//const city = document.getElementById("auto_city");
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
const result = document.getElementById("result");
const cityIp = document.getElementById("cityIp");
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
//up
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      // Get city from coordinates
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      const city =
        data.address.city || data.address.town || data.address.village;
      console.log("Detected city:", city);

      // Now fetch weather for that city
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric`;

      const weatherRes = await fetch(url);
      if (!weatherRes.ok) {
        result.textContent = "This city not found! Try with another city";
        return;
      }

      const weatherData = await weatherRes.json();
      const temp = weatherData.main.temp;
      const desc = weatherData.weather[0].description;
      const now = new Date();

      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      const fullTime = `${hours}:${minutes} ${ampm}`;

      result.innerHTML = `
        <h2>${city}</h2>
        <h3>${fullTime} | ${temp}°C</h3>
        <h3>${desc}</h3>
      `;

      // Optional: change background based on weather
      if (desc.includes("haze")) {
        document.body.style.backgroundColor = "lightgrey";
      } else if (desc.includes("cloud")) {
        document.body.style.backgroundColor = "grey";
      } else if (desc.includes("clear")) {
        document.body.style.backgroundColor = "skyblue";
      }
    } catch (err) {
      result.textContent = "Something went wrong!";
      console.error(err);
    }
  });
} else {
  console.log("Auto location not supported.");
}
