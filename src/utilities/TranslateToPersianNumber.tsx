function translate_to_persian_number(number: string) {
    const persianNumbers = [
        "۰",
        "۱",
        "۲",
        "۳",
        "۴",
        "۵",
        "۶",
        "۷",
        "۸",
        "۹",
    ];
    const englishNumbers = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ];
    for (let i = 0; i < 10; i++) {
        number = number.replace(
        new RegExp(englishNumbers[i], "g"),
        persianNumbers[i]
        );
    }
    return number;
}

export default translate_to_persian_number;