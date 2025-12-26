/***********************
 * CONFIG + STATE
 ***********************/
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";

const state = {
  lat: null,
  lon: null,
  temp: null,
  weatherDesc: "",
  mainWeather: "",
  timezone: 0,
  sunrise: 0,
  sunset: 0
};

let clockInterval = null;

/***********************
 * SMALL HELPERS (DRY)
 ***********************/
function $(id) {
  return document.getElementById(id);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/***********************
 * BACKGROUND HANDLER
 ***********************/
function setBackground(mainWeather, isNight) {
  let bgClass = "cloudy-day-bg";

  if (mainWeather === "Clear") {
    bgClass = isNight ? "clear-night-bg" : "clear-day-bg";
  } else if (
    mainWeather === "Rain" ||
    mainWeather === "Drizzle" ||
    mainWeather === "Mist" ||
    mainWeather === "Fog"
  ) {
    bgClass = "rain-mist-bg";
  } else if (mainWeather === "Clouds") {
    bgClass = isNight ? "cloudy-night-bg" : "cloudy-day-bg";
  }

  document.body.className = bgClass;
}

/***********************
 * WEATHER SUMMARY
 ***********************/
function generateSummary(temp, desc, isNight) {
  let feel =
    temp < 10 ? "Freezing" :
    temp < 18 ? "Chilly" :
    temp < 25 ? "Pleasant" : "Warm";

  if (desc.includes("rain")) return `${feel} and rainy 🌧️`;
  if (desc.includes("cloud")) return `${feel} with clouds ☁️`;
  if (desc.includes("clear")) return isNight ? "Clear night 🌙" : "Sunny day ☀️";

  return `${feel} weather 🌤️`;
}

/***********************
 * CLOCK + TIME LOGIC
 ***********************/
function startClock() {
  if (clockInterval) clearInterval(clockInterval);

  function updateClock() {
    const nowUTC = Date.now();
    const localMs = nowUTC + state.timezone * 1000;
    const localDate = new Date(localMs);
    const currentSeconds = Math.floor(localMs / 1000);

    const isNight =
      currentSeconds < state.sunrise || currentSeconds > state.sunset;

    setBackground(state.mainWeather, isNight);

    const dateStr = localDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const timeStr = localDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    $("localTime").textContent = `${dateStr} | ${timeStr}`;
    $("weatherSummary").textContent =
      generateSummary(state.temp, state.weatherDesc, isNight);
  }

  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

/***********************
 * WEATHER FETCH
 ***********************/
async function getWeather(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    state.temp = Math.round(data.main.temp);
    state.weatherDesc = data.weather[0].description.toLowerCase();
    state.mainWeather = data.weather[0].main;
    state.timezone = data.timezone;

    // Convert sunrise/sunset to LOCAL seconds
    state.sunrise = data.sys.sunrise + state.timezone;
    state.sunset = data.sys.sunset + state.timezone;

    $("temperatureHeading").textContent = `${state.temp}°C`;
    $("currentWeather").textContent = capitalize(data.weather[0].description);

    startClock();
  } catch (err) {
    $("status").textContent = "Error fetching weather data.";
    console.error(err);
  }
}

/***********************
 * LOCATION NAME
 ***********************/
async function getLocationName(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) return;

    const loc = data[0];
    const name = loc.state
      ? `${loc.name}, ${loc.state}, ${loc.country}`
      : `${loc.name}, ${loc.country}`;

    $("locationName").textContent = name;
    $("urat").textContent = `📍 You are in ${name}`;
  } catch (err) {
    console.error("Location error:", err);
  }
}

/***********************
 * MAP
 ***********************/
function showMap(lat, lon) {
  $("mapContainer").innerHTML = `
    <iframe
      width="100%"
      height="160"
      src="https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed"
      loading="lazy">
    </iframe>
  `;
}

/***********************
 * ENTRY POINT
 ***********************/
function fetchAll(lat, lon) {
  state.lat = lat;
  state.lon = lon;

  $("status").textContent = "";

  getLocationName(lat, lon);
  getWeather(lat, lon);
  showMap(lat, lon);
}

/***********************
 * GEOLOCATION
 ***********************/
function getLocation() {
  if (!navigator.geolocation) {
    $("status").textContent = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => fetchAll(pos.coords.latitude, pos.coords.longitude),
    () => $("status").textContent = "Location access denied."
  );
}

getLocation();
