const LessonRow = ({ lesson, badgeType, badgeLabel }) => (
    <li className='lesson_item'>
        <div className='lesson_main_info'>
            <span className='lesson_name'>{lesson.lesson_name || lesson.lesson_id}</span>
            <span className='lesson_meta'>
                کد درس: {lesson.lesson_id}
                {lesson.instructors && lesson.instructors.length > 0 && (
                    <> — استاد: {lesson.instructors.join('، ')}</>
                )}
                {typeof lesson.credit !== 'undefined' && <> — {lesson.credit} واحد</>}
            </span>
        </div>
        <span className={`lesson_badge ${badgeType}`}>{badgeLabel}</span>
    </li>
);

const UploadReport = ({ report }) => {
    if (!report) return null;

    const {
        created_lessons = [],
        changed_lessons = [],
        reactivated_lessons = [],
        notchanged_lessons = [],
        errors = [],
    } = report;

    const hasAnyLesson =
        created_lessons.length > 0 ||
        changed_lessons.length > 0 ||
        reactivated_lessons.length > 0 ||
        notchanged_lessons.length > 0;

    if (!hasAnyLesson && errors.length === 0) {
        return null;
    }

    return (
        <div className='upload_report'>
            {created_lessons.length > 0 && (
                <div className='report_section'>
                    <p className='report_section_title created'>دروس جدید اضافه‌شده ({created_lessons.length})</p>
                    <ul className='lesson_list'>
                        {created_lessons.map((lesson) => (
                            <LessonRow key={lesson.lesson_id} lesson={lesson} badgeType='created' badgeLabel='جدید' />
                        ))}
                    </ul>
                </div>
            )}

            {changed_lessons.length > 0 && (
                <div className='report_section'>
                    <p className='report_section_title changed'>دروس به‌روزرسانی‌شده ({changed_lessons.length})</p>
                    <ul className='lesson_list'>
                        {changed_lessons.map((lesson) => (
                            <LessonRow key={lesson.lesson_id} lesson={lesson} badgeType='changed' badgeLabel='آپدیت شد' />
                        ))}
                    </ul>
                </div>
            )}

            {reactivated_lessons.length > 0 && (
                <div className='report_section'>
                    <p className='report_section_title reactivated'>دروس فعال‌شده مجدد ({reactivated_lessons.length})</p>
                    <ul className='lesson_list'>
                        {reactivated_lessons.map((lesson) => (
                            <LessonRow key={lesson.lesson_id} lesson={lesson} badgeType='reactivated' badgeLabel='فعال شد' />
                        ))}
                    </ul>
                </div>
            )}

            {notchanged_lessons.length > 0 && (
                <div className='report_section'>
                    <p className='report_section_title notchanged'>دروس بدون تغییر ({notchanged_lessons.length})</p>
                    <ul className='lesson_list'>
                        {notchanged_lessons.map((lesson) => (
                            <LessonRow key={lesson.lesson_id} lesson={lesson} badgeType='notchanged' badgeLabel='بدون تغییر' />
                        ))}
                    </ul>
                </div>
            )}

            {errors.length > 0 && (
                <div className='report_section'>
                    <p className='report_section_title errors'>خطاها ({errors.length})</p>
                    <ul className='lesson_list'>
                        {errors.map((err, idx) => (
                            <li key={idx} className='error_item'>{err}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UploadReport;
