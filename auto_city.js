const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
const result = document.getElementById("result");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      // 🔹 Directly fetch weather using lat/lon (works for Ghuni or any local place)
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      const weatherRes = await fetch(url);
      if (!weatherRes.ok) {
        result.textContent = "Weather not found for this location";
        return;
      }

      const weatherData = await weatherRes.json();

      // City name from OpenWeather (usually English, e.g. "Kolkata")
      const city = weatherData.name || "Your location";
      console.log("Detected city:", city);

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

      // Background change based on weather
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