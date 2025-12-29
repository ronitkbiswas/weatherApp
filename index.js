/* =======================
   CONFIG
======================= */
const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
let localTimeInterval;

/* =======================
   BACKGROUND HANDLER
======================= */
function setBackground(weatherDesc, isNight) {
  const body = document.getElementById("body");
  if (!body) return;

  const currentClass = body.className;
  let newClass = "";

  const desc = weatherDesc.toLowerCase();

  if (desc.includes("clear") || desc.includes("sun")) {
    newClass = isNight ? "clear-night-bg" : "clear-day-bg";
  } else if (
    desc.includes("rain") ||
    desc.includes("mist") ||
    desc.includes("fog") ||
    desc.includes("haze")
  ) {
    newClass = "rain-mist-bg";
  } else if (desc.includes("cloud")) {
    newClass = isNight ? "cloudy-night-bg" : "cloudy-day-bg";
  } else {
    newClass = isNight ? "cloudy-night-bg" : "cloudy-day-bg";
  }

  if (currentClass !== newClass) {
    body.className = newClass;
  }
}

/* =======================
   FORECAST (TOMORROW)
======================= */
async function getForecast(lat, lon) {
  const forecastElement = document.getElementById("tomorrowForecast");
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.list) {
      forecastElement.textContent = "Forecast unavailable.";
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split("T")[0];

    let tomorrowWeather = {
      rain: false,
      wind: false,
      description: "Clear",
    };

    for (let item of data.list) {
      if (item.dt_txt.startsWith(tomorrowDateString)) {
        const desc = item.weather[0].description.toLowerCase();

        if (desc.includes("rain") || desc.includes("shower")) {
          tomorrowWeather.rain = true;
        }

        if (item.wind.speed > 10) {
          tomorrowWeather.wind = true;
        }

        if (!tomorrowWeather.rain && !tomorrowWeather.wind) {
          tomorrowWeather.description = desc;
        }
      }
    }

    let summaryText = "";
    if (tomorrowWeather.rain) {
      summaryText = "☔ Rain coming tomorrow!";
    } else if (tomorrowWeather.wind) {
      summaryText = "💨 Be prepared for a windy day ahead!";
    } else if (tomorrowWeather.description.includes("clouds")) {
      summaryText = "☁️ Expect partly cloudy skies tomorrow.";
    } else {
      summaryText = "☀️ Mostly sunny and clear day ahead.";
    }

    forecastElement.textContent = summaryText;
  } catch (err) {
    forecastElement.textContent = "Forecast unavailable.";
    console.error("Error fetching forecast data:", err);
  }
}

/* =======================
   MAP
======================= */
function displayMap(lat, lon) {
  const mapContainer = document.getElementById("mapContainer");
  if (!mapContainer) return;

  mapContainer.innerHTML = `
    <iframe
      width="100%"
      height="160"
      frameborder="0"
      scrolling="on"
      marginheight="0"
      marginwidth="0"
      src="https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=12&output=embed"
      allowfullscreen>
    </iframe>
  `;
}

/* =======================
   WEATHER SUMMARY
======================= */
function generateWeatherSummary(temp, weatherDesc, isNight) {
  const desc = weatherDesc.toLowerCase();
  let summary = "";
  let emojis = isNight ? " 🌙✨" : " ☀️";

  let tempFeel =
    temp < 10
      ? "freezing"
      : temp < 18
      ? "chilly"
      : temp < 25
      ? "pleasant"
      : "warm";

  if (desc.includes("clear")) {
    summary = isNight
      ? `${
          tempFeel.charAt(0).toUpperCase() + tempFeel.slice(1)
        } and clear night sky!`
      : `${
          tempFeel.charAt(0).toUpperCase() + tempFeel.slice(1)
        } and sunny day!`;
  } else if (desc.includes("clouds")) {
    summary = isNight
      ? "Overcast and dark night with patchy clouds."
      : `Mildly cloudy day with ${tempFeel} air.`;
  } else if (desc.includes("rain")) {
    summary = `A wet, ${tempFeel} day with steady rain.`;
    emojis = " 🌧️☔";
  } else if (
    desc.includes("mist") ||
    desc.includes("fog") ||
    desc.includes("haze")
  ) {
    summary = isNight
      ? `A ${tempFeel} hazy night with low visibility!`
      : `A ${tempFeel} hazy morning with a soft glow.`;
  } else {
    summary = `${
      tempFeel.charAt(0).toUpperCase() + tempFeel.slice(1)
    } and ${desc} conditions.`;
  }

  return summary + emojis;
}

/* =======================
   LOCAL TIME + SUN EVENTS
======================= */
function displayLocalTime(timezoneOffsetSeconds, sunriseTime, sunsetTime) {
  if (localTimeInterval) clearInterval(localTimeInterval);

  const timeElement = document.getElementById("localTime");
  const summaryElement = document.getElementById("weatherSummary");
  const sunEventElement = document.getElementById("sunEvent");
  const sunriseElement = document.getElementById("sunriseTime");
  const sunsetElement = document.getElementById("sunsetTime");

  const weatherDesc = document.getElementById("currentWeather").textContent;

  function updateClock() {
    const localTimeMs = Date.now() + timezoneOffsetSeconds * 1000;
    const localDate = new Date(localTimeMs);
    const currentSecondUTC = Math.floor(localTimeMs / 1000);

    const isNight =
      currentSecondUTC > sunsetTime || currentSecondUTC < sunriseTime;

    setBackground(weatherDesc, isNight);

    timeElement.textContent = `${localDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })} | ${localDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })}`;

    let nextEventTime, eventName, emoji;

    if (currentSecondUTC < sunriseTime) {
      eventName = "Sunrise";
      emoji = "🌅";
      nextEventTime = sunriseTime;
    } else if (currentSecondUTC < sunsetTime) {
      eventName = "Sunset";
      emoji = "🌇";
      nextEventTime = sunsetTime;
    } else {
      eventName = "Sunrise";
      emoji = "🌅";
      nextEventTime = sunriseTime + 86400;
    }

    const diffMs = nextEventTime * 1000 - localTimeMs;

    if (diffMs > 0) {
      const diffSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);

      sunEventElement.textContent = `${emoji} ${eventName} in ${hours} hours ${minutes} mins`;
    } else {
      sunEventElement.textContent = "";
    }

    const tempText = document.getElementById("temperatureHeading").textContent;
    const temp = parseFloat(tempText.replace("°C", ""));

    if (!isNaN(temp)) {
      summaryElement.textContent = generateWeatherSummary(
        temp,
        weatherDesc,
        isNight
      );
    }
  }

  sunriseElement.textContent = `🌅 Sunrise: ${new Date(
    sunriseTime * 1000
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })}`;

  sunsetElement.textContent = `🌇 Sunset: ${new Date(
    sunsetTime * 1000
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })}`;

  updateClock();
  localTimeInterval = setInterval(updateClock, 1000);
}

/* =======================
   CURRENT WEATHER
======================= */
async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.main) return;

    const temp = Math.round(data.main.temp);
    const weatherDesc = data.weather[0].description;
    const timezone = data.timezone;

    const sunriseTime = data.sys.sunrise + timezone;
    const sunsetTime = data.sys.sunset + timezone;

    document.getElementById("temperatureHeading").textContent = `${temp}°C`;
    document.getElementById("currentWeather").textContent =
      weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);

    displayLocalTime(timezone, sunriseTime, sunsetTime);
  } catch (err) {
    document.getElementById("status").textContent =
      "Error fetching weather data.";
    console.error(err);
  }
}

/* =======================
   LOCATION NAME
======================= */
async function getLocationName(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const loc = data[0];
      const display = loc.state
        ? `${loc.name}, ${loc.state}, ${loc.country}`
        : `${loc.name}, ${loc.country}`;

      document.getElementById("locationName").textContent = display;
      document.getElementById("urat").textContent = `📍You are in ${display}`;
    }
  } catch (err) {
    console.error(err);
  }
}

/* =======================
   COORDINATION
======================= */
function fetchAllData(lat, lon) {
  document.getElementById("status").textContent = "";
  getLocationName(lat, lon);
  getWeather(lat, lon);
  getForecast(lat, lon);
  displayMap(lat, lon);
}

async function getCoordinatesByCityName(cityName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    cityName
  )}&limit=1&appid=${apiKey}`;

  try {
    document.getElementById(
      "status"
    ).textContent = `Searching for "${cityName}"...`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      fetchAllData(data[0].lat, data[0].lon);
    } else {
      document.getElementById(
        "status"
      ).textContent = `Location "${cityName}" not found.`;
    }
  } catch {
    document.getElementById("status").textContent = "Error during city search.";
  }
}

function searchLocation() {
  const city = document.getElementById("cityInput").value.trim();
  if (city) getCoordinatesByCityName(city);
  else
    document.getElementById("status").textContent =
      "Please enter a location name.";
}

/* =======================
   GEOLOCATION INIT
======================= */
function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById("status").textContent =
      "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => fetchAllData(pos.coords.latitude, pos.coords.longitude),
    () => {
      document.getElementById("status").textContent =
        "Failed to get location. Please use the search bar.";
    }
  );
}

getLocation();
