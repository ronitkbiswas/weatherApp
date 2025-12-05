// url = https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric
// api key b782ee4ad515b759b84bb4c98d77b48e
// °C
// url = https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric
// api key b782ee4ad515b759b84bb4c98d77b48e
// °C
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
const cityIp = document.getElementById("cityIp");
const result = document.getElementById("result");
const btn = document.getElementById("getWeatherBtn");
btn.addEventListener("click", getWeather);
async function getWeather() {
  const city = cityIp.value.trim();
  if (!city) {
    result.textContent = "Enter a city please!";
    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      result.textContent = "This city not found! Try with another city";
      return;
    }
    const data = await res.json();
    const temp = data.main.temp;
    const desc = data.weather[0].description;
    result.textContent = `${city}: ${temp}°C, ${desc}`;
  } catch (err) {
    result.textContent = "Something went wrong !";
    console.error(err);
  }
}
