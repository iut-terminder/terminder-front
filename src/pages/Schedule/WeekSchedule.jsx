import { WEEK_DAYS, getTimeLabels, timeToSlotIndex, SLOTS_COUNT, DEFAULT_LESSON_COLOR, getConflictColor } from './scheduleUtils';
import './WeekSchedule.css';

const WeekSchedule = ({ items = [], onDelete, onLessonClick }) => {
    const timeLabels = getTimeLabels();

    // هر آیتم چارت شامل: { lesson, hasConflict, conflictRank, conflictCount }
    // برای هر بازه‌ی زمانی lesson.times یک بلوک جدا در گرید رسم می‌شود.
    const blocks = [];
    items.forEach((item) => {
        const { lesson, hasConflict, conflictRank, conflictCount } = item;
        const blockColor = hasConflict
            ? getConflictColor(conflictRank, conflictCount)
            : DEFAULT_LESSON_COLOR;

        (lesson.times || []).forEach((time, timeIdx) => {
            const rawStartSlot = timeToSlotIndex(time.start);
            const rawEndSlot = timeToSlotIndex(time.end);
            if (rawStartSlot === null || rawEndSlot === null) return;
            if (rawEndSlot <= 0 || rawStartSlot >= SLOTS_COUNT) return; // کاملاً خارج از بازه‌ی چارت

            // برش (clamp) بازه به محدوده‌ی نمایش چارت (۸ تا ۱۷) تا جلسات نیمه‌داخل هم دیده شوند
            const startSlot = Math.max(0, rawStartSlot);
            const endSlot = Math.min(SLOTS_COUNT, rawEndSlot);

            blocks.push({
                key: `${lesson._id || lesson.lesson_id}-${timeIdx}`,
                lesson,
                day: time.day,
                startSlot,
                endSlot,
                isExerciseSolving: time.isExerciseSolving,
                color: blockColor,
                hasConflict: !!hasConflict,
            });
        });
    });

    return (
        <div className='week_schedule_wrapper'>
            <div className='week_schedule'>
                <div
                    className='week_schedule_grid'
                    style={{
                        gridTemplateColumns: `4rem repeat(${WEEK_DAYS.length}, 1fr)`,
                        gridTemplateRows: `2.5rem repeat(${SLOTS_COUNT}, 2.6rem)`,
                    }}
                >
                    {/* گوشه‌ی بالا-راست خالی */}
                    <div className='schedule_corner' style={{ gridColumn: 1, gridRow: 1 }} />

                    {/* هدر روزها */}
                    {WEEK_DAYS.map((day, idx) => (
                        <div
                            key={day.key}
                            className='schedule_day_header'
                            style={{ gridColumn: idx + 2, gridRow: 1 }}
                        >
                            {day.label}
                        </div>
                    ))}

                    {/* ستون ساعت‌ها (فقط خطوط زوج/شروع ساعت کامل و نیم‌ساعته برچسب دارند) */}
                    {timeLabels.slice(0, SLOTS_COUNT).map((label, idx) => (
                        <div
                            key={`time-${idx}`}
                            className='schedule_time_label'
                            style={{ gridColumn: 1, gridRow: idx + 2 }}
                        >
                            {label}
                        </div>
                    ))}

                    {/* پس‌زمینه‌ی خانه‌های خالی گرید (خطوط جدول) */}
                    {WEEK_DAYS.map((day, dayIdx) =>
                        Array.from({ length: SLOTS_COUNT }).map((_, slotIdx) => (
                            <div
                                key={`cell-${day.key}-${slotIdx}`}
                                className='schedule_cell'
                                style={{ gridColumn: dayIdx + 2, gridRow: slotIdx + 2 }}
                            />
                        ))
                    )}

                    {/* بلوک‌های درس */}
                    {blocks.map((block) => (
                        <div
                            key={block.key}
                            className={`schedule_block ${block.isExerciseSolving ? 'schedule_block_exercise' : ''}`}
                            style={{
                                gridColumn: block.day + 2,
                                gridRow: `${block.startSlot + 2} / ${block.endSlot + 2}`,
                                backgroundColor: block.color,
                            }}
                            onClick={() => onLessonClick && onLessonClick(block.lesson)}
                        >
                            {onDelete && (
                                <button
                                    type='button'
                                    className='schedule_block_delete'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(block.lesson._id || block.lesson.lesson_id);
                                    }}
                                    title='حذف درس'
                                >
                                    ✕
                                </button>
                            )}
                            <div className='schedule_block_content'>
                                <span className='schedule_block_name'>{block.lesson.lesson_name}</span>
                                {block.lesson.instructors_list && block.lesson.instructors_list.length > 0 && (
                                    <span className='schedule_block_teacher'>
                                        {block.lesson.instructors_list.join('، ')}
                                    </span>
                                )}
                                <span className='schedule_block_code'>{block.lesson.lesson_id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeekSchedule;