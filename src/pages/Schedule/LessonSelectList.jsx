import { useState } from 'react';
import { getStartTimeOptions, WEEK_DAYS } from './scheduleUtils';

const GENDER_OPTIONS = [
    { value: '', label: 'همه' },
    { value: '0', label: 'مختلط' },
    { value: '1', label: 'مرد' },
    { value: '2', label: 'زن' },
];

const startTimeOptions = getStartTimeOptions();

const LessonSelectList = ({ title, lessons, onSelect, disabled, disabledMessage }) => {
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [startTimeFilter, setStartTimeFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');

    const filtered = lessons.filter((lesson) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            lesson.lesson_name.toLowerCase().includes(q) ||
            lesson.lesson_id.toLowerCase().includes(q) ||
            (lesson.instructors_list || []).some((i) => i.toLowerCase().includes(q));

        const matchesGender = !genderFilter || String(lesson.gender) === genderFilter;

        const matchesStartTime =
            !startTimeFilter ||
            (lesson.times || []).some((t) => t.start === startTimeFilter);

        const matchesDay =
            !dayFilter ||
            (lesson.times || []).some((t) => String(t.day) === dayFilter);

        return matchesSearch && matchesGender && matchesStartTime && matchesDay;
    });

    return (
        <div className='lesson_select_box'>
            <p className='lesson_select_title'>{title}</p>
            <input
                type='text'
                className='lesson_select_search'
                placeholder='جستجوی نام درس، استاد یا کد درس...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
                dir='rtl'
            />

            <div className='lesson_select_filters'>
                <select
                    className='lesson_select_filter'
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    disabled={disabled}
                >
                    {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <select
                    className='lesson_select_filter'
                    value={startTimeFilter}
                    onChange={(e) => setStartTimeFilter(e.target.value)}
                    disabled={disabled}
                >
                    <option value=''>ساعت شروع (همه)</option>
                    {startTimeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <select
                    className='lesson_select_filter'
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    disabled={disabled}
                >
                    <option value=''>روز (همه)</option>
                    {WEEK_DAYS.map((day) => (
                        <option key={day.key} value={day.key}>{day.label}</option>
                    ))}
                </select>
            </div>

            {disabled ? (
                <p className='lesson_select_empty'>{disabledMessage}</p>
            ) : (
                <div className='lesson_select_list'>
                    {filtered.length === 0 && <p className='lesson_select_empty'>موردی یافت نشد</p>}
                    {filtered.map((lesson) => (
                        <div key={lesson.id} className='lesson_select_item' onClick={() => onSelect(lesson)}>
                            <span className='lesson_select_item_name'>{lesson.lesson_name}</span>
                            <span className='lesson_select_item_meta'>
                                {(lesson.instructors_list || []).join('، ')}
                                {lesson.instructors_list?.length > 0 && ' — '}
                                {lesson.lesson_id}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LessonSelectList;
