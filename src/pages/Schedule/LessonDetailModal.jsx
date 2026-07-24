import Modal from './Modal';
import './LessonDetailModal.css';

const DAY_NAMES = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const GENDER_LABELS = { 0: 'مختلط', 1: 'مرد', 2: 'زن' };

const LessonDetailModal = ({ isOpen, lesson, onClose }) => {
    if (!lesson) return null;

    const examTime = lesson.exam_time || {};
    const hasExam = examTime.date || examTime.start_time;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lesson.lesson_name}>
            <div className='lesson_detail_grid'>
                <div className='lesson_detail_row'>
                    <span className='lesson_detail_label'>کد درس</span>
                    <span>{lesson.lesson_id}</span>
                </div>
                <div className='lesson_detail_row'>
                    <span className='lesson_detail_label'>استاد</span>
                    <span>{(lesson.instructors_list || []).join('، ') || 'نامشخص'}</span>
                </div>
                <div className='lesson_detail_row'>
                    <span className='lesson_detail_label'>تعداد واحد</span>
                    <span>{lesson.credit}</span>
                </div>
                <div className='lesson_detail_row'>
                    <span className='lesson_detail_label'>ظرفیت</span>
                    <span>{lesson.capacity ?? 'نامشخص'}</span>
                </div>
                <div className='lesson_detail_row'>
                    <span className='lesson_detail_label'>جنسیت</span>
                    <span>{GENDER_LABELS[lesson.gender] ?? 'نامشخص'}</span>
                </div>

                <div className='lesson_detail_section_title'>زمان‌بندی کلاس</div>
                {(lesson.times || []).length === 0 && <p className='lesson_detail_empty'>زمانی ثبت نشده</p>}
                {(lesson.times || []).map((t, idx) => (
                    <div key={idx} className='lesson_detail_row'>
                        <span className='lesson_detail_label'>
                            {DAY_NAMES[t.day] || t.day}
                            {t.isExerciseSolving && ' (حل تمرین)'}
                        </span>
                        <span>{t.start} تا {t.end}</span>
                    </div>
                ))}

                <div className='lesson_detail_section_title'>امتحان</div>
                {!hasExam && <p className='lesson_detail_empty'>تاریخ امتحان ثبت نشده</p>}
                {hasExam && (
                    <>
                        {examTime.date && (
                            <div className='lesson_detail_row'>
                                <span className='lesson_detail_label'>تاریخ</span>
                                <span>{examTime.date}</span>
                            </div>
                        )}
                        {examTime.start_time && (
                            <div className='lesson_detail_row'>
                                <span className='lesson_detail_label'>ساعت</span>
                                <span>{examTime.start_time} تا {examTime.end_time}</span>
                            </div>
                        )}
                    </>
                )}

                {lesson.description && (
                    <>
                        <div className='lesson_detail_section_title'>توضیحات</div>
                        <p className='lesson_detail_description'>{lesson.description}</p>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default LessonDetailModal;
