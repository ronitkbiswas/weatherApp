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
  // city

  // city ends
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
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // convert 24h → 12h format

    const fullTime = `${hours}:${minutes} ${ampm}`;

    result.innerHTML = `
  <h2>${city}</h2>
  <h3> ${fullTime} | ${temp}°C</h3>
  <h3>${desc}</h3>
`;
    if (desc === "haze") {
      document.body.style.backgroundColor = "lightgrey";
      console.log("its hazey!");
    } else if (desc === "scattered clouds") {
      document.body.style.backgroundColor = "grey";
    } else if (desc === "clear sky") {
      document.body.style.backgroundColor = "skyblue";
    }
  } catch (err) {
    result.textContent = "Something went wrong !";
    console.error(err);
  }
}
