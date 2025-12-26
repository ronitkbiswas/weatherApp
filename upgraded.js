/************************
 * CONFIG
 ************************/
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
let clockInterval = null;

/************************
 * HELPERS
 ************************/
function $(id) {
  return document.getElementById(id);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/************************
 * BACKGROUND
 ************************/
function setBackground(main, isNight) {
  let cls = "cloudy-day-bg";

  if (main === "Clear") {
    cls = isNight ? "clear-night-bg" : "clear-day-bg";
  } else if (["Rain", "Mist", "Fog", "Drizzle"].includes(main)) {
    cls = "rain-mist-bg";
  } else if (main === "Clouds") {
    cls = isNight ? "cloudy-night-bg" : "cloudy-day-bg";
  }

  document.body.className = cls;
}

/************************
 * SUMMARY
 ************************/
function generateSummary(temp, desc, isNight) {
  let feel =
    temp < 10 ? "Freezing" :
    temp < 18 ? "Chilly" :
    temp < 25 ? "Pleasant" : "Warm";

  if (desc.includes("rain")) return `${feel} and rainy 🌧️`;
  if (desc.includes("cloud")) return `${feel} with clouds ☁️`;
  if (desc.includes("clear"))
    return isNight ? "Clear night 🌙" : "Sunny day ☀️";

  return `${feel} weather 🌤️`;
}

/************************
 * CLOCK + SUN EVENTS
 ************************/
function startClock(timezone, sunrise, sunset, mainWeather, temp, desc) {
  if (clockInterval) clearInterval(clockInterval);

  function update() {
    // UTC seconds
    const nowUTC = Math.floor(Date.now() / 1000);

    // Local seconds (API timezone)
    const localSeconds = nowUTC + timezone;
    const localDate = new Date(localSeconds * 1000);

    const isNight =
      localSeconds < sunrise || localSeconds > sunset;

    setBackground(mainWeather, isNight);

    $("localTime").textContent =
      localDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      }) +
      " | " +
      localDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

    $("weatherSummary").textContent =
      generateSummary(temp, desc, isNight);

    // --- NEXT SUN EVENT ---
    let nextEvent, label, emoji;

    if (localSeconds < sunrise) {
      nextEvent = sunrise;
      label = "Sunrise";
      emoji = "🌅";
    } else if (localSeconds < sunset) {
      nextEvent = sunset;
      label = "Sunset";
      emoji = "🌇";
    } else {
      nextEvent = sunrise + 86400;
      label = "Sunrise";
      emoji = "🌅";
    }

    const diff = nextEvent - localSeconds;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);

    $("sunEvent").textContent = `${emoji} ${label} in ${h}h ${m}m`;
  }

  update();
  clockInterval = setInterval(update, 1000);
}

/************************
 * WEATHER
 ************************/
async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  const temp = Math.round(data.main.temp);
  const desc = data.weather[0].description.toLowerCase();
  const main = data.weather[0].main;
  const timezone = data.timezone;

  // Convert sunrise/sunset to LOCAL seconds
  const sunrise = data.sys.sunrise + timezone;
  const sunset = data.sys.sunset + timezone;

  $("temperatureHeading").textContent = `${temp}°C`;
  $("currentWeather").textContent = capitalize(data.weather[0].description);

  $("sunriseTime").textContent =
    "🌅 Sunrise: " +
    new Date(sunrise * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

  $("sunsetTime").textContent =
    "🌇 Sunset: " +
    new Date(sunset * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

  startClock(timezone, sunrise, sunset, main, temp, desc);
}

/************************
 * LOCATION NAME
 ************************/
async function getLocationName(lat, lon) {
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
}

/************************
 * FORECAST (TOMORROW)
 ************************/
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  let rain = false;
  let wind = false;

  data.list.forEach(item => {
    if (item.dt_txt.startsWith(dateStr)) {
      if (item.weather[0].description.includes("rain")) rain = true;
      if (item.wind.speed > 10) wind = true;
    }
  });

  $("tomorrowForecast").textContent =
    rain ? "☔ Rain expected tomorrow" :
    wind ? "💨 Windy tomorrow" :
    "☀️ Mostly clear tomorrow";
}

/************************
 * MAP
 ************************/
function showMap(lat, lon) {
  $("mapContainer").innerHTML = `
    <iframe
      width="100%"
      height="160"
      src="https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed">
    </iframe>
  `;
}

/************************
 * ENTRY POINT
 ************************/
function fetchAll(lat, lon) {
  $("status").textContent = "";
  getLocationName(lat, lon);
  getWeather(lat, lon);
  getForecast(lat, lon);
  showMap(lat, lon);
}

/************************
 * GEOLOCATION
 ************************/
function getLocation() {
  if (!navigator.geolocation) {
    $("status").textContent = "Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => fetchAll(pos.coords.latitude, pos.coords.longitude),
    () => $("status").textContent = "Location access denied"
  );
}

getLocation();
