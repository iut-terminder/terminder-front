import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';
import './Rank.css';

const API_BASE = 'http://127.0.0.1:8000/api';

const HOURS = [8, 9, 10, 11, 12, 13];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ENTRY_YEARS = [400, 401, 402, 403, 404];

// اگر ساعت 13 انتخاب شود فقط دقیقه‌ی 0 مجاز است (بازه تا 13:00 دقیق است)
const minutesForHour = (hour) => (hour === 13 ? [0] : MINUTES);

const Rank = () => {
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);

    const [loadingStatus, setLoadingStatus] = useState(true);
    const [entry, setEntry] = useState(null); // ثبت قبلی کاربر (اگر وجود داشته باشد)

    const [departments, setDepartments] = useState([]);
    const [fields, setFields] = useState([]);

    const [hour, setHour] = useState(8);
    const [minute, setMinute] = useState(0);
    const [departmentId, setDepartmentId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [entryYear, setEntryYear] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [result, setResult] = useState(null);
    const [loadingResult, setLoadingResult] = useState(false);

    // بارگذاری وضعیت ثبت کاربر + لیست دانشکده‌ها و رشته‌ها
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingStatus(true);
            try {
                const [meRes, deptRes, fieldRes] = await Promise.all([
                    fetch(`${API_BASE}/rank/me`, {
                        headers: { Authorization: `Bearer ${authCtx.access}` },
                    }),
                    fetch(`${API_BASE}/department`, {
                        headers: { Authorization: `Bearer ${authCtx.access}` },
                    }),
                    fetch(`${API_BASE}/fields`, {
                        headers: { Authorization: `Bearer ${authCtx.access}` },
                    }),
                ]);

                const meData = await meRes.json();
                const deptData = await deptRes.json();
                const fieldData = await fieldRes.json();

                if (!meRes.ok) throw new Error(meData.error || 'خطا در دریافت وضعیت ثبت‌نام');
                if (!deptRes.ok) throw new Error(deptData.error || 'خطا در دریافت دانشکده‌ها');
                if (!fieldRes.ok) throw new Error(fieldData.error || 'خطا در دریافت رشته‌ها');

                setEntry(meData.entry);
                setDepartments(deptData);
                setFields(fieldData);
            } catch (error) {
                showToast(error.message || 'خطا در بارگذاری اطلاعات', 'error');
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleHourChange = (e) => {
        const newHour = Number(e.target.value);
        setHour(newHour);
        if (newHour === 13) setMinute(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!departmentId || !fieldId || !entryYear) {
            showToast('لطفاً همه‌ی فیلدها را تکمیل کنید', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/rank`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authCtx.access}`,
                },
                body: JSON.stringify({
                    hour,
                    minute,
                    department: departmentId,
                    field: fieldId,
                    entry_year: Number(entryYear),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'ثبت اطلاعات انجام نشد');
            }

            setEntry(data.entry);
            showToast('اطلاعات شما با موفقیت ثبت شد', 'success');
        } catch (error) {
            showToast(error.message || 'ثبت اطلاعات انجام نشد', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCalculate = async () => {
        setLoadingResult(true);
        try {
            const response = await fetch(`${API_BASE}/rank/result`, {
                headers: { Authorization: `Bearer ${authCtx.access}` },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'محاسبه‌ی رتبه انجام نشد');
            }
            setResult(data);
        } catch (error) {
            showToast(error.message || 'محاسبه‌ی رتبه انجام نشد', 'error');
        } finally {
            setLoadingResult(false);
        }
    };

    const formattedTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    if (loadingStatus) {
        return (
            <div className='rank_page'>
                <p className='rank_loading'>در حال بارگذاری...</p>
            </div>
        );
    }

    const needsRegistration = !entry;

    return (
        <div className='rank_page'>
            <div className='rank_card'>
                <h2 className='rank_title'>رتبه‌بندی انتخاب واحد</h2>

                {!needsRegistration && (
                    <div className='rank_registered_info'>
                        <p>
                            ساعت ثبت‌شده‌ی شما: <strong>{formattedTime(entry.hour, entry.minute)}</strong>
                        </p>
                        <p>
                            دانشکده: <strong>{entry.department?.dept_name}</strong>
                        </p>
                        <p>
                            رشته: <strong>{entry.field?.field_name}</strong>
                        </p>
                        <p>
                            ورودی: <strong>{entry.entry_year}</strong>
                        </p>

                        <button
                            type='button'
                            className='rank_calc_btn'
                            onClick={handleCalculate}
                            disabled={loadingResult}
                        >
                            {loadingResult ? 'در حال محاسبه...' : 'محاسبه رتبه'}
                        </button>

                        {result && (
                            <div className='rank_result_box'>
                                {result.same_time_count > 1 ? (
                                    <p>
                                        شما بین نفر <strong>{result.rank_from}</strong> تا{' '}
                                        <strong>{result.rank_to}</strong> هستید
                                        <span className='rank_result_note'>
                                            ({result.same_time_count} نفر دقیقاً همان ساعت شما را انتخاب کرده‌اند)
                                        </span>
                                    </p>
                                ) : (
                                    <p>
                                        شما نفر <strong>{result.rank_from}</strong> هستید
                                    </p>
                                )}
                                <p className='rank_result_total'>
                                    از مجموع {result.total_in_group} نفر در این رشته و ورودی
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {needsRegistration && (
                <div className='rank_modal_overlay'>
                    <div className='rank_modal_box'>
                        <h3 className='rank_modal_title'>ثبت اطلاعات انتخاب واحد</h3>
                        <p className='rank_modal_subtitle'>
                            لطفاً ساعت مورد نظر خود (بین 08:00 تا 13:00)، دانشکده، رشته و ورودی خود را انتخاب کنید.
                            توجه: این اطلاعات فقط یک‌بار قابل ثبت است.
                        </p>

                        <form className='rank_form' onSubmit={handleSubmit}>
                            <div className='rank_form_group'>
                                <label>ساعت انتخابی</label>
                                <div className='rank_time_selects'>
                                    <select value={hour} onChange={handleHourChange}>
                                        {HOURS.map((h) => (
                                            <option key={h} value={h}>
                                                {String(h).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <span className='rank_time_colon'>:</span>
                                    <select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                                        {minutesForHour(hour).map((m) => (
                                            <option key={m} value={m}>
                                                {String(m).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='rank_form_group'>
                                <label>دانشکده</label>
                                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                                    <option value=''>انتخاب دانشکده</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='rank_form_group'>
                                <label>رشته</label>
                                <select value={fieldId} onChange={(e) => setFieldId(e.target.value)} required>
                                    <option value=''>انتخاب رشته</option>
                                    {fields.map((f) => (
                                        <option key={f._id} value={f._id}>
                                            {f.field_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='rank_form_group'>
                                <label>ورودی</label>
                                <select value={entryYear} onChange={(e) => setEntryYear(e.target.value)} required>
                                    <option value=''>انتخاب ورودی</option>
                                    {ENTRY_YEARS.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type='submit' className='rank_submit_btn' disabled={submitting}>
                                {submitting ? 'در حال ثبت...' : 'تایید'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rank;
