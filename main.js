const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";

document.addEventListener("DOMContentLoaded", () => {
  const result = document.getElementById("result");
  const cityIp = document.getElementById("cityIp");
  const btn = document.getElementById("getWeatherBtn");

  // ---------- Helpers ----------
  // function setBackground(desc) {
  //   const d = desc.toLowerCase();
  //   if (d.includes("haze")) {
  //     document.body.style.backgroundColor = "lightgrey";
  //   } else if (d.includes("cloud")) {
  //     document.body.style.backgroundColor = "grey";
  //   } else if (d.includes("clear")) {
  //     document.body.style.backgroundColor = "skyblue";
  //   } else {
  //     document.body.style.backgroundColor = "white";
  //   }
  // }

  function renderWeather(city, temp, desc) {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const fullTime = `${hours}:${minutes} ${ampm}`;
    const emoji = setWeatherTheme(desc);

    result.innerHTML = `
      <h2>${city} ${emoji}</h2>
      <h3>${fullTime} | ${temp}°C</h3>
      <h3>${desc}</h3>
    `;
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
      let desc = data.weather[0].description;
      // does not work
      // if (data.weather[0].description === "few clouds") {
      //   desc = "few clouds in the night sky";
      // } else if (data.description === "haze") {
      //   desc = "hazy night sky";
      // }
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

function setWeatherTheme(desc) {
  const d = desc.toLowerCase();
  let bg = "white";
  let emoji = "🌍";
  if (d.includes("clear")) {
    bg = "#87CEEB"; // sky blue
    emoji = "☀️";
  } else if (d.includes("few clouds")) {
    bg = "#c3c9cbff"; // light sky blue
    emoji = "☁️";
  } else if (d.includes("scattered clouds")) {
    bg = "#B0C4DE"; // light steel blue
    emoji = "🌥️";
  } else if (d.includes("broken clouds") || d.includes("overcast")) {
    bg = "#778899"; // grayish
    emoji = "☁️";
  } else if (d.includes("rain") || d.includes("drizzle")) {
    bg = "#6CA6CD"; // dull blue
    emoji = "🌧️";
  } else if (d.includes("thunderstorm")) {
    bg = "#4B0082"; // dark violet
    emoji = "⛈️";
  } else if (d.includes("snow")) {
    bg = "#F0F8FF"; // icy white
    emoji = "❄️";
  } else if (d.includes("sleet")) {
    bg = "#D6EAF8";
    emoji = "🌨️";
  } else if (d.includes("mist") || d.includes("fog") || d.includes("haze")) {
    bg = "#C0C0C0"; // misty grey
    emoji = "🌫️";
  } else if (d.includes("smoke")) {
    bg = "#A9A9A9"; // dark gray
    emoji = "🚬";
  } else if (d.includes("dust") || d.includes("sand")) {
    bg = "#DEB887"; // sandy brown
    emoji = "🌪️";
  } else if (d.includes("ash")) {
    bg = "#696969"; // ash gray
    emoji = "🌋";
  } else if (d.includes("squall")) {
    bg = "#708090"; // slate gray
    emoji = "🌬️";
  } else if (d.includes("tornado")) {
    bg = "#2F4F4F"; // dark slate
    emoji = "🌪️";
  } else if (d.includes("hot")) {
    bg = "#FF6347"; // tomato red
    emoji = "🥵";
  } else if (d.includes("cold")) {
    bg = "#AFEEEE"; // pale blue
    emoji = "🥶";
  } else if (d.includes("wind")) {
    bg = "#A4C2F4";
    emoji = "💨";
  } else if (d.includes("hail")) {
    bg = "#D0E4F7";
    emoji = "🌨️";
  } else if (d.includes("tropical storm") || d.includes("hurricane")) {
    bg = "#36454F"; // stormy gray
    emoji = "🌀";
  }

  // Apply background
  document.body.style.backgroundColor = bg;

  // Return emoji if needed for UI
  return emoji;
}
