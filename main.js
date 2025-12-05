const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";

document.addEventListener("DOMContentLoaded", () => {
  const result = document.getElementById("result");
  const cityIp = document.getElementById("cityIp");
  const btn = document.getElementById("getWeatherBtn");

  // ---------- Helpers ----------
  function setBackground(desc) {
    const d = desc.toLowerCase();
    if (d.includes("haze")) {
      document.body.style.backgroundColor = "lightgrey";
    } else if (d.includes("cloud")) {
      document.body.style.backgroundColor = "grey";
    } else if (d.includes("clear")) {
      document.body.style.backgroundColor = "skyblue";
    } else {
      document.body.style.backgroundColor = "white";
    }
  }

  function renderWeather(city, temp, desc) {
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

    setBackground(desc);
  }

  async function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        result.textContent = "This city not found! Try another city.";
        return;
      }

      const data = await res.json();
      const temp = data.main.temp;
      const desc = data.weather[0].description;
      const name = data.name || city; // use normalized city name from API
      renderWeather(name, temp, desc);
    } catch (err) {
      console.error(err);
      result.textContent = "Something went wrong!";
    }
  }

  async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        result.textContent =
          "Could not load weather for your location. Try manual search.";
        return;
      }

      const data = await res.json();
      const temp = data.main.temp;
      const desc = data.weather[0].description;
      const city = data.name || "Your location";
      renderWeather(city, temp, desc);
    } catch (err) {
      console.error(err);
      result.textContent = "Something went wrong with auto location!";
    }
  }

  // ---------- Manual search ----------
  btn.addEventListener("click", () => {
    const city = cityIp.value.trim();
    if (!city) {
      result.textContent = "Enter a city please!";
      return;
    }
    getWeatherByCity(city);
  });

  // ---------- Auto location on load ----------
  if (navigator.geolocation) {
    result.textContent = "Detecting your location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      (error) => {
        console.error(error);
        result.textContent =
          "Location permission denied or unavailable. Use manual search.";
      }
    );
  } else {
    console.log("Geolocation not supported.");
  }
});
