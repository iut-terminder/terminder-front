function get_random_green() {
  const max = 150;
  const min = 100;
  const green = Math.floor(Math.random() * (max - min + 1)) + min;
  return `rgb(0, ${green} ,0)`;
}

export default get_random_green;
