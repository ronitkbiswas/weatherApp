const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
const auto_city = document.getElementById("auto_city");
const result = document.getElementById("result");
const cityIp = document.getElementById("cityIp");
const btn = document.getElementById("getWeatherBtn");

///////////////////////////////////
//  Manual city search
///////////////////////////////////
btn.addEventListener("click", async () => {
  const city = cityIp.value.trim();
  if (!city) {
    result.textContent = "Enter a city please!";
    return;
  }
  document.getElementById("myImageUp").classList.remove("hidden");
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
    let desc = data.weather[0].description;
    const name = data.name || city;

    let now = new Date();
    let hours24 = now.getHours(); // 0–23 (keep this for conditions)
    let minutes = now.getMinutes();
    let ampm = hours24 >= 12 ? "PM" : "AM";

    // convert only for display
    let hours12 = hours24 % 12 || 12;
    let fullTime = `${hours12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    //console.log(fullTime);
    // time ranges
    //Time Range (24-hr)	Period Shown
    //05:00(5am) → 11:59(am)	 Morning
    //12:00(12pm) → 15:59(4pm) Noon
    //16:00 (4pm) → 18:59(7pm)	Evening
    // 19:00(7pm) → 04:59(5am) Night
    if (hours24 >= 5 && hours24 < 12) {
      let g = "🌅 Good Morning 🍵";
    } else if (hours24 >= 12 && hours24 < 16) {
      g = "☀️ High Noon";
    } else if (hours24 >= 16 && hours24 < 19) {
      g = "🌇 Nice Evening";
    } else {
      g = "🌙 Silent Night";
    }
    result.innerHTML = `
      <span style='font-size:22px'>${name}</span><br>
          <span style='font-size:14px'>${fullTime}</span> | <span>${g}</span><br>
          <span style='font-size:40px'><b>${temp.toFixed(0)}°C</b></span>
        <br>
           <div style="margin-top:15px;font-size:14px;">
          <span><b>feels like:</b> ${data.main.feels_like.toFixed(
            0
          )}°C</span> | 
          <span><b>Now:</b> ${desc}</span> | <span><b>humidity:</b> ${
      data.main.humidity
    }%</span> | <span><b>wind speed: </b>${
      data.wind.speed
    } km/h</span> | <span><b>visibility:</b> ${
      data.visibility / 1000
    } km</span> | <span><b>pressure:</b> ${
      data.main.pressure
    } mb</span> | <span><b>clouds:</b> ${data.clouds.all}%</span>
          </div>
    `;
    document.getElementById("myImageUp").classList.add("hidden");
  } catch (err) {
    console.error(err);
    result.textContent = "Something went wrong! ERROR 404";
  }
});
/////////////////////////////////////////////////////////////////

// Auto location on page load

//////////////////////////////////////////
if (navigator.geolocation) {
  const loader = document.getElementById("myImage");
  loader.classList.remove("hidden");

  auto_city.textContent = "Detecting your location...";

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

        /* ========= CORE WEATHER DATA ========= */
        const city = data.name || "Current location";
        const country = data.sys?.country ?? "";
        const temp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const tempMin = data.main.temp_min;
        const tempMax = data.main.temp_max;
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;

        const weatherMain = data.weather?.[0]?.main ?? "N/A";
        const description = data.weather?.[0]?.description ?? "N/A";
        const icon = data.weather?.[0]?.icon ?? "";

        const windSpeedMS = data.wind?.speed ?? 0;
        const windSpeedKmH = (windSpeedMS * 3.6).toFixed(1);
        const windDeg = data.wind?.deg ?? "N/A";
        const windGust = data.wind?.gust ?? "N/A";

        const visibilityKm = data.visibility
          ? (data.visibility / 1000).toFixed(1)
          : "N/A";

        const clouds = data.clouds?.all ?? "N/A";

        const rain1h = data.rain?.["1h"] ?? 0;
        const rain3h = data.rain?.["3h"] ?? 0;
        const snow1h = data.snow?.["1h"] ?? 0;
        const snow3h = data.snow?.["3h"] ?? 0;

        const sunrise = data.sys?.sunrise
          ? new Date(data.sys.sunrise * 1000).toLocaleTimeString()
          : "N/A";
        const sunset = data.sys?.sunset
          ? new Date(data.sys.sunset * 1000).toLocaleTimeString()
          : "N/A";

        const timezoneOffset = data.timezone; // seconds from UTC

        /* ========= LOCAL TIME (WEATHER LOCATION) ========= */
        const localTime = new Date(Date.now() + timezoneOffset * 1000);
        const hours24 = localTime.getUTCHours();
        const minutes = localTime.getUTCMinutes();
        const ampm = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 % 12 || 12;
        const fullTime = `${hours12}:${minutes
          .toString()
          .padStart(2, "0")} ${ampm}`;

        /* ========= GREETING ========= */
        let g = "";
        if (hours24 >= 5 && hours24 < 12) g = "🌅 Good Morning 🍵";
        else if (hours24 >= 12 && hours24 < 16) g = "☀️ High Noon";
        else if (hours24 >= 16 && hours24 < 19) g = "🌇 Nice Evening";
        else g = "🌙 Silent Night";

        /* ========= UI ========= */
        auto_city.innerHTML = `
          <span style="color:darkgreen;font-weight:500;">🏠 Current location</span><br>
          <span style="font-size:22px">${city}, ${country}</span><br>
          <span style="font-size:14px">${fullTime}</span> | <span>${g}</span><br>

          <span style="font-size:42px"><b>${temp.toFixed(0)}°C</b></span><br>
          <span>${weatherMain} — ${description}</span><br>

          <div style="margin-top:12px;font-size:14px;line-height:1.6">
            🌡️ Feels like: ${feelsLike.toFixed(0)}°C |
            🔻 Min: ${tempMin.toFixed(0)}°C |
            🔺 Max: ${tempMax.toFixed(0)}°C <br>

            💧 Humidity: ${humidity}% |
            🧭 Pressure: ${pressure} mb |
            ☁️ Clouds: ${clouds}% <br>

            🌬️ Wind: ${windSpeedKmH} km/h (${windDeg}°) |
            💨 Gust: ${windGust} <br>

            👀 Visibility: ${visibilityKm} km <br>

            🌧️ Rain (1h): ${rain1h} mm |
            🌧️ Rain (3h): ${rain3h} mm <br>

            ❄️ Snow (1h): ${snow1h} mm |
            ❄️ Snow (3h): ${snow3h} mm <br>

            🌅 Sunrise: ${sunrise} |
            🌇 Sunset: ${sunset}
          </div>
        `;

        console.log("Full weather data:", data);
      } catch (err) {
        console.error(err);
        result.textContent = "Something went wrong with auto location!";
      } finally {
        loader.classList.add("hidden");
      }
    },
    () => {
      result.textContent =
        "Location permission denied or unavailable. Use manual search.";
      document.getElementById("myImage").classList.add("hidden");
    }
  );
} else {
  console.log("Geolocation not supported.");
}
//popular locations starts /////////////////// KOLKATA
async function fetchKolkataWeather() {
  const pop = document.getElementById("pop");
  const city = "Kolkata";
  const apiKey = "b782ee4ad515b759b84bb4c98d77b48e"; // add your key here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      pop.textContent = "Not found! Try another city...";
      return;
    }
    const data = await res.json();
    const temp = data.main.temp;
    pop.innerHTML = `
      <span style='font-size:22px;color:black;font-weight:600;'>⛅ Popular Location</span>
      <br><br>
      <span style='font-size:16px'>🏙️ ${city}</span> : <span style='font-size:18px;'><b>${temp.toFixed(
      0
    )}°C</b></span>
    `;
  } catch (err) {
    console.error(err);
    pop.textContent = "Something went wrong! ERROR 404";
  }
}

// call the function
fetchKolkataWeather();

// popular locations ends ///////////////////
// sikkim //
async function fetchSikkimWeather() {
  const pop2 = document.getElementById("pop2");
  const city = "Sikkim";
  const apiKey = "b782ee4ad515b759b84bb4c98d77b48e"; // add your key here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      pop2.textContent = "Not found! Try another city...";
      return;
    }
    const data = await res.json();
    const temp = data.main.temp;
    pop2.innerHTML = `
      
      <span style='font-size:16px'>❄️ ${city}</span> : <span style='font-size:18px;'><b>${temp.toFixed(
      0
    )}°C</b></span>
    `;
  } catch (err) {
    console.error(err);
    pop2.textContent = "Something went wrong! ERROR 404";
  }
}

// call the function
fetchSikkimWeather();
//sikkim ///
//ranaghat
async function fetchRanaghatWeather() {
  const pop3 = document.getElementById("pop3");
  const city = "Ranaghat";
  const apiKey = "b782ee4ad515b759b84bb4c98d77b48e"; // add your key here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      pop3.textContent = "Not found! Try another city...";
      return;
    }
    const data = await res.json();
    const temp = data.main.temp;
    pop3.innerHTML = `
      
      <span style='font-size:16px'>🌨️ ${city}</span> : <span style='font-size:18px;'><b>${temp.toFixed(
      0
    )}°C</b></span>
    `;
  } catch (err) {
    console.error(err);
    pop3.textContent = "Something went wrong! ERROR 404";
  }
}

// call the function
fetchRanaghatWeather();
//Darjeeling ///
async function fetchDarjeelingWeather() {
  const pop4 = document.getElementById("pop4");
  const city = "Darjeeling";
  const apiKey = "b782ee4ad515b759b84bb4c98d77b48e"; // add your key here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      pop4.textContent = "Not found! Try another city...";
      return;
    }
    const data = await res.json();
    const temp = data.main.temp;
    pop4.innerHTML = `
      
      <span style='font-size:16px'>❄️ ${city}</span> :
      <span style='font-size:18px;'><b>${temp.toFixed(0)}°C</b></span>
    `;
  } catch (err) {
    console.error(err);
    pop4.textContent = "Something went wrong! ERROR 404";
  }
}

// call the function
fetchDarjeelingWeather();
