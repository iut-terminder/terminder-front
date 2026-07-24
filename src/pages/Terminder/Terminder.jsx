import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';
import WeekSchedule from '../Schedule/WeekSchedule';
import LessonSelectList from '../Schedule/LessonSelectList';
import ConflictModal from '../Schedule/ConflictModal';
import LessonDetailModal from '../Schedule/LessonDetailModal';
import RemovedLessonsModal from '../Schedule/RemovedLessonsModal';
import ScheduleTabs from '../Schedule/ScheduleTabs';
import {
    findConflicts,
    isSameLesson,
    lessonsHaveConflict,
} from '../Schedule/scheduleUtils';
import './Terminder.css';

const LAB_PREFIXES = ['آزمایشگاه', 'ازمايشگاه', 'آزمايشگاه', 'كارگاه', 'کارگاه'];
const API_BASE = 'http://127.0.0.1:8000/api';
const MAX_SCHEDULES = 5;

const isLabOrWorkshop = (lessonName) => LAB_PREFIXES.some((prefix) => lessonName.startsWith(prefix));

const emptySlot = () => ({ id: null, items: [] });

const Terminder = () => {
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);

    const [departments, setDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [deptLessons, setDeptLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    const [slots, setSlots] = useState(Array.from({ length: MAX_SCHEDULES }, emptySlot));
    const [activeIndex, setActiveIndex] = useState(0);

    const [pendingConflict, setPendingConflict] = useState(null);
    const [detailLesson, setDetailLesson] = useState(null);
    const [removedLessons, setRemovedLessons] = useState(null);

    const [savingSchedule, setSavingSchedule] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    const activeSlot = slots[activeIndex];
    const scheduleItems = activeSlot.items;

    const setActiveItems = useCallback((updater) => {
        setSlots((prevSlots) => {
            const newSlots = [...prevSlots];
            const current = newSlots[activeIndex];
            const newItems = typeof updater === 'function' ? updater(current.items) : updater;
            newSlots[activeIndex] = { ...current, items: newItems };
            return newSlots;
        });
    }, [activeIndex]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(`${API_BASE}/department`, {
                    headers: { Authorization: `Bearer ${authCtx.access}` },
                });
                const data = await response.json();
                if (!response.ok) throw new Error('خطا در دریافت دانشکده‌ها');
                setDepartments(data);
            } catch (error) {
                showToast('خطا در دریافت لیست دانشکده‌ها', 'error');
            }
        };
        fetchDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // بارگذاری همه‌ی برنامه‌های ذخیره‌شده‌ی کاربر (حداکثر ۵ تا) و چیدن هرکدام در اسلات خودش
    useEffect(() => {
        const fetchSavedSchedules = async () => {
            setLoadingSchedules(true);
            try {
                const response = await fetch(`${API_BASE}/schedules`, {
                    headers: { Authorization: `Bearer ${authCtx.access}` },
                });
                const data = await response.json();
                if (!response.ok) throw new Error('خطا در دریافت برنامه‌ها');

                const schedules = data.schedules || [];
                const removedFromServer = data.removed_lessons || [];

                // سرور بر اساس آخرین به‌روزرسانی مرتب می‌کند؛ برای نگاشت پایدار به اسلات‌ها،
                // بر اساس id مرتب می‌کنیم تا ترتیب تب‌ها هر بار یکسان بماند
                const sorted = [...schedules].sort((a, b) => String(a._id).localeCompare(String(b._id)));

                const newSlots = Array.from({ length: MAX_SCHEDULES }, emptySlot);

                sorted.slice(0, MAX_SCHEDULES).forEach((schedule, idx) => {
                    // بک‌اند پیش از پاسخ‌دادن، آیتم‌های مربوط به دروس غیرفعال را
                    // از دیتابیس حذف کرده؛ پس هرچه در schedule.items باقی مانده فعال است
                    const activeItems = schedule.items.map((item) => ({ lesson: item.lesson }));
                    newSlots[idx] = { id: schedule._id, items: activeItems };
                });

                setSlots(newSlots);

                if (removedFromServer.length > 0) {
                    setRemovedLessons(removedFromServer);
                }
            } catch (error) {

            } finally {
                setLoadingSchedules(false);
            }
        };
        fetchSavedSchedules();
    }, []);

    const normalizePersian = (str) => {
        if (!str) return '';
        return str.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    };

    useEffect(() => {
        if (!selectedDeptId) {
            setDeptLessons([]);
            return;
        }
        const fetchLessons = async () => {
            setLoadingLessons(true);
            try {
                const response = await fetch(
                    `${API_BASE}/lessons/?department_id=${selectedDeptId}`,
                    { headers: { Authorization: `Bearer ${authCtx.access}` } }
                );
                const data = await response.json();
                if (!response.ok) throw new Error('خطا در دریافت دروس');

                const normalizedData = data.map((lesson) => ({
                    ...lesson,
                    lesson_name: normalizePersian(lesson.lesson_name),
                    instructors_list: (lesson.instructors_list || []).map((name) => normalizePersian(name)),
                }));

                setDeptLessons(normalizedData);
            } catch (error) {
                showToast('خطا در دریافت لیست دروس این دانشکده', 'error');
            } finally {
                setLoadingLessons(false);
            }
        };
        fetchLessons();
    }, [selectedDeptId]);

    const theoryLessons = deptLessons.filter((l) => !isLabOrWorkshop(l.lesson_name));
    const labLessons = deptLessons.filter((l) => isLabOrWorkshop(l.lesson_name));

    const addLessonToSchedule = (lesson) => {
        setActiveItems((prev) => [...prev, { lesson }]);
        showToast(`درس «${lesson.lesson_name}» اضافه شد`, 'success');
    };

    const handleSelectLesson = (lesson) => {
        const sameLessonAlready = scheduleItems.find((item) => isSameLesson(item.lesson, lesson));
        if (sameLessonAlready) {
            showToast('این درس قبلاً انتخاب شده است', 'error');
            return;
        }

        const conflicts = findConflicts(lesson, scheduleItems);
        if (conflicts.length > 0) {
            setPendingConflict({ lesson, conflicts });
            return;
        }

        addLessonToSchedule(lesson);
    };

    const handleConfirmConflict = () => {
        if (pendingConflict) {
            addLessonToSchedule(pendingConflict.lesson);
        }
        setPendingConflict(null);
    };

    const handleCancelConflict = () => {
        setPendingConflict(null);
    };

    const handleDeleteLesson = (lessonPk) => {
        setActiveItems((prev) => prev.filter((item) => item.lesson._id !== lessonPk));
    };

    const handleSelectTab = (idx) => {
        setActiveIndex(idx);
    };

    const handleSaveSchedule = async () => {
        setSavingSchedule(true);
        try {
            const payload = {
                title: `برنامه ${activeIndex + 1}`,
                items: scheduleItems.map((item) => ({
                    lesson: item.lesson._id,
                })),
            };

            const url = activeSlot.id ? `${API_BASE}/schedules/${activeSlot.id}` : `${API_BASE}/schedules`;
            const method = activeSlot.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authCtx.access}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'ذخیره برنامه انجام نشد');
            }

            setSlots((prevSlots) => {
                const newSlots = [...prevSlots];
                newSlots[activeIndex] = { ...newSlots[activeIndex], id: data._id };
                return newSlots;
            });
            showToast('برنامه با موفقیت ذخیره شد', 'success');
        } catch (error) {
            showToast(error.message || 'ذخیره برنامه انجام نشد', 'error');
        } finally {
            setSavingSchedule(false);
        }
    };

    const handleClearSchedule = async () => {
        if (scheduleItems.length === 0) return;

        const scheduleIdToDelete = activeSlot.id;
        setSlots((prevSlots) => {
            const newSlots = [...prevSlots];
            newSlots[activeIndex] = emptySlot();
            return newSlots;
        });

        if (!scheduleIdToDelete) return;

        try {
            const response = await fetch(`${API_BASE}/schedules/${scheduleIdToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authCtx.access}` },
            });
            if (!response.ok && response.status !== 204) {
                throw new Error('حذف برنامه از سرور انجام نشد');
            }
            showToast('برنامه حذف شد', 'success');
        } catch (error) {
            showToast(error.message || 'حذف برنامه از سرور انجام نشد', 'error');
        }
    };

    const conflictOrder = [];
    scheduleItems.forEach((item, idx) => {
        const others = scheduleItems.filter((_, otherIdx) => otherIdx !== idx);
        const hasConflict = others.some((other) => lessonsHaveConflict(item.lesson, other.lesson));
        if (hasConflict) conflictOrder.push(idx);
    });

    const itemsWithConflictFlag = scheduleItems.map((item, idx) => {
        const conflictRank = conflictOrder.indexOf(idx);
        return {
            ...item,
            hasConflict: conflictRank !== -1,
            conflictRank,
            conflictCount: conflictOrder.length,
        };
    });

    const totalCredit = scheduleItems.reduce((sum, item) => sum + (item.lesson.credit || 0), 0);

    return (
        <div className='terminder_page'>
            <ScheduleTabs
                slots={slots.map((s) => (s.items.length > 0 || s.id ? s : null))}
                activeIndex={activeIndex}
                onSelect={handleSelectTab}
            />

            <WeekSchedule
                items={itemsWithConflictFlag}
                onDelete={handleDeleteLesson}
                onLessonClick={(lesson) => setDetailLesson(lesson)}
            />

            <div className='terminder_summary'>
                <div className='terminder_summary_header'>
                    <span>مجموع واحدها: {totalCredit}</span>
                    <div className='terminder_summary_actions'>
                        <button
                            type='button'
                            className='terminder_action_btn save'
                            onClick={handleSaveSchedule}
                            disabled={savingSchedule || loadingSchedules}
                        >
                            {savingSchedule ? 'در حال ذخیره' : 'ذخیره برنامه'}
                        </button>
                        <button
                            type='button'
                            className='terminder_action_btn clear'
                            onClick={handleClearSchedule}
                            disabled={scheduleItems.length === 0}
                        >
                            حذف کامل برنامه
                        </button>
                    </div>
                </div>

                {scheduleItems.length > 0 && (
                    <ul className='terminder_selected_list'>
                        {scheduleItems.map((item) => {
                            const exam = item.lesson.exam_time || {};
                            const examLabel = exam.date
                                ? `${exam.date}${exam.start_time ? ` ساعت ${exam.start_time}` : ''}`
                                : 'تاریخ امتحان ثبت نشده';
                            return (
                                <li key={item.lesson._id} className='terminder_selected_item'>
                                    <span className='terminder_selected_name'>{item.lesson.lesson_name}</span>
                                    <span className='terminder_selected_exam'>{examLabel}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className='terminder_controls'>
                <select
                    className='terminder_dept_select'
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                >
                    <option value=''>انتخاب دانشکده</option>
                    {departments.map((dept) => (
                        <option key={dept.dept_id} value={dept.dept_id}>
                            {dept.dept_name}
                        </option>
                    ))}
                </select>

                <div className='terminder_lesson_lists'>
                    <LessonSelectList
                        title='دروس تئوری'
                        lessons={theoryLessons}
                        onSelect={handleSelectLesson}
                        disabled={!selectedDeptId || loadingLessons}
                        disabledMessage={!selectedDeptId ? 'ابتدا دانشکده را انتخاب کنید' : 'در حال بارگذاری...'}
                    />
                    <LessonSelectList
                        title='آزمایشگاه و کارگاه'
                        lessons={labLessons}
                        onSelect={handleSelectLesson}
                        disabled={!selectedDeptId || loadingLessons}
                        disabledMessage={!selectedDeptId ? 'ابتدا دانشکده را انتخاب کنید' : 'در حال بارگذاری...'}
                    />
                </div>
            </div>

            <ConflictModal
                isOpen={!!pendingConflict}
                lesson={pendingConflict?.lesson}
                conflictingLessons={pendingConflict?.conflicts || []}
                onConfirm={handleConfirmConflict}
                onCancel={handleCancelConflict}
            />

            <LessonDetailModal
                isOpen={!!detailLesson}
                lesson={detailLesson}
                onClose={() => setDetailLesson(null)}
            />

            <RemovedLessonsModal
                isOpen={!!removedLessons}
                removedLessons={removedLessons || []}
                onClose={() => setRemovedLessons(null)}
            />
        </div>
    );
};

export default Terminder;
