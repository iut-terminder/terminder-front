// روزهای هفته‌ی تحصیلی (شنبه تا چهارشنبه) به ترتیب نمایش در چارت
export const WEEK_DAYS = [
    { key: 0, label: 'شنبه' },
    { key: 1, label: 'یکشنبه' },
    { key: 2, label: 'دوشنبه' },
    { key: 3, label: 'سه‌شنبه' },
    { key: 4, label: 'چهارشنبه' },
];

// چارت از ۸ صبح تا ۱۷ (۵ عصر) را در بازه‌های نیم‌ساعته نشان می‌دهد
export const START_HOUR = 8;
export const END_HOUR = 17;
export const SLOT_MINUTES = 30;
export const SLOTS_COUNT = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES; // 18 بازه

// برچسب‌های کنار جدول، مثلاً "8"، "8:30"، "9"، ...
export const getTimeLabels = () => {
    const labels = [];
    for (let i = 0; i <= SLOTS_COUNT; i++) {
        const totalMinutes = START_HOUR * 60 + i * SLOT_MINUTES;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        labels.push(minute === 0 ? `${hour}` : `${hour}:${minute}`);
    }
    return labels;
};

// لیست کامل بازه‌های شروع به فرمت "HH:MM" (نه برچسب کوتاه)، برای استفاده در فیلترها
export const getStartTimeOptions = () => {
    const options = [];
    for (let i = 0; i < SLOTS_COUNT; i++) {
        const totalMinutes = START_HOUR * 60 + i * SLOT_MINUTES;
        const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const minute = String(totalMinutes % 60).padStart(2, '0');
        options.push(`${hour}:${minute}`);
    }
    return options;
};

// تبدیل رشته‌ی "HH:MM" به تعداد دقیقه از نیمه‌شب
export const timeStringToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

// محاسبه‌ی شماره‌ی بازه (slot index از صفر) بر اساس رشته‌ی زمان
export const timeToSlotIndex = (timeStr) => {
    const minutes = timeStringToMinutes(timeStr);
    if (minutes === null) return null;
    const startMinutes = START_HOUR * 60;
    const index = (minutes - startMinutes) / SLOT_MINUTES;
    return index;
};

// آیا دو بازه‌ی زمانی (روی یک روز) با هم تداخل دارند؟
// جلسات حل تمرین (isExerciseSolving) از قاعده‌ی تداخل مستثنی هستند.
export const timesOverlap = (time1, time2) => {
    if (time1.day !== time2.day) return false;
    if (time1.isExerciseSolving || time2.isExerciseSolving) return false;

    const start1 = timeStringToMinutes(time1.start);
    const end1 = timeStringToMinutes(time1.end);
    const start2 = timeStringToMinutes(time2.start);
    const end2 = timeStringToMinutes(time2.end);

    if ([start1, end1, start2, end2].some((v) => v === null)) return false;

    return start1 < end2 && end1 > start2;
};

// آیا دو درس (هرکدام با آرایه‌ی times) با هم تداخل زمانی دارند؟
export const lessonsHaveConflict = (lessonA, lessonB) => {
    const timesA = lessonA?.times || [];
    const timesB = lessonB?.times || [];
    for (const t1 of timesA) {
        for (const t2 of timesB) {
            if (timesOverlap(t1, t2)) return true;
        }
    }
    return false;
};

// کد پایه‌ی درس بدون شماره‌ی گروه (دو رقم آخر lesson_id شماره‌ی گروه است)
export const getBaseLessonCode = (lessonId) => {
    if (!lessonId || lessonId.length <= 2) return lessonId;
    return lessonId.slice(0, -2);
};

// آیا دو درس، همان درس (با گروه یکسان یا متفاوت) هستند؟
export const isSameLesson = (lessonA, lessonB) => {
    return getBaseLessonCode(lessonA.lesson_id) === getBaseLessonCode(lessonB.lesson_id);
};

// در بین دروس انتخاب‌شده، آن‌هایی که با درس جدید تداخل زمانی دارند را برمی‌گرداند
export const findConflicts = (newLesson, selectedItems) => {
    return selectedItems
        .filter((item) => lessonsHaveConflict(newLesson, item.lesson))
        .map((item) => item.lesson);
};

// رنگ پیش‌فرض دروس بدون تداخل
export const DEFAULT_LESSON_COLOR = '#2BCDE2';

// رنگ پایه‌ی دروس دارای تداخل؛ هرچه درس دیرتر انتخاب شده باشد، تیره‌تر می‌شود
const CONFLICT_BASE_HUE = 0; // قرمز
const CONFLICT_LIGHTEST = 70; // درصد روشنایی برای اولین درسِ تداخل‌دار
const CONFLICT_DARKEST = 32;  // درصد روشنایی برای آخرین (دیرترین) درسِ تداخل‌دار

// rank: جایگاه درس در بین دروسِ تداخل‌دار (0 = اولین انتخاب‌شده)
// total: تعداد کل دروس تداخل‌دار
export const getConflictColor = (rank, total) => {
    if (total <= 1) return `hsl(${CONFLICT_BASE_HUE}, 70%, ${CONFLICT_LIGHTEST}%)`;
    const ratio = rank / (total - 1); // 0 تا 1
    const lightness = CONFLICT_LIGHTEST - ratio * (CONFLICT_LIGHTEST - CONFLICT_DARKEST);
    return `hsl(${CONFLICT_BASE_HUE}, 70%, ${lightness}%)`;
};
