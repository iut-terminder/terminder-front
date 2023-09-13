const translate_pure_number_to_clock = (number: number) => {
  // number is stm like 1150 that should changes to 11.30
  const hour = Math.floor(number / 100);
  const minute = number % 100 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
};

export default translate_pure_number_to_clock;