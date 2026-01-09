/* =======================
   CONFIG
======================= */
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
let localTimeInterval = null;

/* =======================
   UTILITIES
======================= */
const $ = (id) => document.getElementById(id);

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* =======================
   BACKGROUND LOGIC
======================= */
function getBackgroundClass(desc, isNight) {
  const d = desc.toLowerCase();

  if (d.includes("clear") || d.includes("sun")) {
    return isNight ? "clear-night-bg" : "clear-day-bg";
  }

  if (
    d.includes("rain") ||
    d.includes("mist") ||
    d.includes("fog") ||
    d.includes("haze")
  ) {
    return "rain-mist-bg";
  }

  if (d.includes("cloud")) {
    return isNight ? "cloudy-night-bg" : "cloudy-day-bg";
  }

  return isNight ? "cloudy-night-bg" : "cloudy-day-bg";
}

function applyBackground(desc, isNight) {
  const body = $("body");
  if (!body) return;

  const newClass = getBackgroundClass(desc, isNight);
  if (body.className !== newClass) {
    body.className = newClass;
  }
}

/* =======================
   WEATHER SUMMARY (PURE)
======================= */
function generateWeatherSummary(temp, weatherDesc, isNight) {
  const desc = weatherDesc.toLowerCase();
  let emojis = isNight ? " 🌙✨" : " ☀️";

  const tempFeel =
    temp < 10
      ? "freezing"
      : temp < 18
      ? "chilly"
      : temp < 25
      ? "pleasant"
      : "warm";

  let summary = "";

  if (desc.includes("clear")) {
    summary = isNight
      ? `${capitalize(tempFeel)} and clear night sky..`
      : `${capitalize(tempFeel)} and sunny day..`;
  } else if (desc.includes("cloud")) {
    summary = isNight
      ? "Overcast and dark night with patchy clouds.."
      : `Mildly cloudy day with ${tempFeel} air..`;
  } else if (desc.includes("rain")) {
    summary = `A wet, ${tempFeel} day with steady rain..`;
    emojis = " 🌧️☔";
  } else if (
    desc.includes("mist") ||
    desc.includes("fog") ||
    desc.includes("haze")
  ) {
    summary = isNight
      ? `A ${tempFeel} hazy night with low visibility..`
      : `A ${tempFeel} hazy morning with a soft glow..`;
  } else {
    summary = `${capitalize(tempFeel)} and ${desc} conditions..`;
  }

  return emojis + " " + summary;
}

/* =======================
   TIME ENGINE
======================= */
function startLocalClock(timezoneOffset, sunrise, sunset, weatherDesc) {
  if (localTimeInterval) clearInterval(localTimeInterval);

  const timeEl = $("localTime");
  const summaryEl = $("weatherSummary");
  const sunEventEl = $("sunEvent");

  function tick() {
    const nowMs = Date.now() + timezoneOffset * 1000;
    const nowSec = Math.floor(nowMs / 1000);
    const date = new Date(nowMs);

    const isNight = nowSec > sunset || nowSec < sunrise;
    applyBackground(weatherDesc, isNight);

    timeEl.textContent = `${date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })} | ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })}`;

    let event, emoji, target;

    if (nowSec < sunrise) {
      event = "Sunrise";
      emoji = "🌅";
      target = sunrise;
    } else if (nowSec < sunset) {
      event = "Sunset";
      emoji = "🌇";
      target = sunset;
    } else {
      event = "Sunrise";
      emoji = "🌅";
      target = sunrise + 86400;
    }

    const diff = target * 1000 - nowMs;
    if (diff > 0) {
      const mins = Math.floor(diff / 60000);
      sunEventEl.textContent = `${emoji} ${event} in ${Math.floor(
        mins / 60
      )} hours ${mins % 60} mins`;
    }

    const temp = parseFloat($("temperatureHeading").textContent);
    if (!isNaN(temp)) {
      summaryEl.textContent = generateWeatherSummary(
        temp,
        weatherDesc,
        isNight
      );
    }
  }

  tick();
  localTimeInterval = setInterval(tick, 1000);
}

/* =======================
   API HELPERS
======================= */
async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

/* =======================
   WEATHER DATA
======================= */
async function getWeather(lat, lon) {
  $("status").textContent = "🌍 Fetching weather data...";

  const data = await fetchJSON(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  if (!data || !data.main) {
    $("status").textContent = "❌ Failed to load weather data.";
    return;
  }

  // ✅ clear status ONLY after success
  $("status").textContent = "";

  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const desc = data.weather[0].description;
  const tz = data.timezone;

  $("temperatureHeading").textContent = `${temp}°C`;
  $("feelsLike").textContent = `🌡️ Feels Like: ${feelsLike}°C`;
  // $("currentWeather").textContent = capitalize(desc);

  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const clouds = data.clouds?.all ?? "N/A";
  const visibilityKm = data.visibility
    ? (data.visibility / 1000).toFixed(1)
    : "N/A";
  // const windDeg = data.wind?.degree;
  const windDeg = data.wind?.deg ?? "N/A";
  const windSpeedKmH = ((data.wind?.speed ?? 0) * 3.6).toFixed(1);
  const windGust = data.wind?.gust ?? "N/A";

  $("otherDetails").innerHTML = `
    <div style="padding:2px">
      ☁️ Clouds in sky: ${clouds}%<br>
      👀 Visibility: ${visibilityKm} km<br>
      🌬️ Wind: ${windSpeedKmH} km/h (${windDeg}°)<br>
      💨 Gust: ${windGust}<br>
      💧 Humidity: ${humidity}%<br>
      🧭 Pressure: ${pressure} mb
    </div>
  `;

  $("sunriseTime").textContent = `🌅 Sunrise: ${new Date(
    (data.sys.sunrise + tz) * 1000
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })}`;

  $("sunsetTime").textContent = `🌇 Sunset: ${new Date(
    (data.sys.sunset + tz) * 1000
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })}`;

  startLocalClock(tz, data.sys.sunrise + tz, data.sys.sunset + tz, desc);
}

/* =======================
   FORECAST
======================= */
async function getForecast(lat, lon) {
  const data = await fetchJSON(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  if (!data.list) {
    $("tomorrowForecast").textContent = "Forecast unavailable.";
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = tomorrow.toISOString().split("T")[0];

  let rain = false;
  let wind = false;
  let desc = "Clear";

  for (const item of data.list) {
    if (item.dt_txt.startsWith(target)) {
      const d = item.weather[0].description.toLowerCase();
      if (d.includes("rain")) rain = true;
      if (item.wind.speed > 10) wind = true;
      if (!rain && !wind) desc = d;
    }
  }

  $("tomorrowForecast").textContent = rain
    ? "☔ Rain coming tomorrow!"
    : wind
    ? "💨 Windy day ahead!"
    : desc.includes("cloud")
    ? "☁️ Partly cloudy tomorrow.."
    : "☀️ Mostly sunny day ahead..";
}

/* =======================
   LOCATION + MAP
======================= */
async function getLocationName(lat, lon) {
  const data = await fetchJSON(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
  );

  if (!data.length) return;

  const loc = data[0];
  $("locationName").textContent = loc.state
    ? `${loc.name}, ${loc.state}, ${loc.country}`
    : `${loc.name}, ${loc.country}`;
}

function displayMap(lat, lon) {
  $("mapContainer").innerHTML = `
    <iframe
      width="100%"
      height="140"
      frameborder="0"
      src="https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed">
    </iframe>`;
}

/* =======================
   ORCHESTRATION
======================= */
function fetchAllData(lat, lon) {
  getLocationName(lat, lon);
  getWeather(lat, lon);
  getForecast(lat, lon);
  displayMap(lat, lon);
}

/* =======================
   SEARCH
======================= */
async function getCoordinatesByCityName(city) {
  $("status").textContent = `🔍 Searching for "${city}"...`;

  const data = await fetchJSON(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${apiKey}`
  );

  if (!data.length) {
    $("status").textContent = `❌ Location "${city}" not found.`;
    return;
  }

  fetchAllData(data[0].lat, data[0].lon);
}

function searchLocation() {
  const city = $("cityInput").value.trim();
  if (!city) {
    $("status").textContent = "⚠️ Please enter a location name.";
    return;
  }
  getCoordinatesByCityName(city);
}

/* =======================
   INIT
======================= */
function initGeolocation() {
  $("status").textContent = "🪄 Getting your location... Please wait 😊🍂";

  if (!navigator.geolocation) {
    $("status").textContent = "❌ Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => fetchAllData(pos.coords.latitude, pos.coords.longitude),
    () => {
      $("status").textContent = "❌ Location access denied. Use search.";
    }
  );
}

initGeolocation();
