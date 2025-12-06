const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";

const result = document.getElementById("result");
const cityIp = document.getElementById("cityIp");
const btn = document.getElementById("getWeatherBtn");

// Manual city search
btn.addEventListener("click", async () => {
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
      result.textContent = "Not found! Try another city...";
      return;
    }

    const data = await res.json();
    const temp = data.main.temp;
    const desc = data.weather[0].description;
    const name = data.name || city;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const fullTime = `${hours}:${minutes} ${ampm}`;

    result.innerHTML = `
      <h2>${name}</h2>
      <h3>${fullTime} ~ ${temp.toFixed(0)}°C</h3>
      <h3>${desc}</h3>
    `;
  } catch (err) {
    console.error(err);
    result.textContent = "Something went wrong!";
  }
});

// Auto location on page load
if (navigator.geolocation) {
  result.textContent = "Detecting your location...";
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
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

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const fullTime = `${hours}:${minutes} ${ampm}`;

        result.innerHTML = `
          <h2>${city}</h2>
          <h3>${fullTime} ~ ${temp.toFixed(0)}°C</h3>
          <h3>${desc}</h3>
        `;
      } catch (err) {
        console.error(err);
        result.textContent = "Something went wrong with auto location!";
      }
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
