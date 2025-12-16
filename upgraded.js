const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
let localTimeInterval;

// --- BACKGROUND ANIMATION LOGIC (UNCHANGED) ---
function setBackground(weatherDesc, isNight) {
  const body = document.getElementById("body");
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

// --- AQI CALCULATION (UNCHANGED) ---

function pm25ToAQI(pm25) {
  const breakpoints = [
    { cLow: 0, cHigh: 12, aLow: 0, aHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, aLow: 51, aHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, aLow: 101, aHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, aLow: 151, aHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, aLow: 201, aAigh: 300 },
    { cLow: 250.5, cHigh: 500.4, aLow: 301, aAigh: 500 },
  ];
  for (let b of breakpoints) {
    if (pm25 >= b.cLow && pm25 <= b.cHigh) {
      return Math.round(
        ((b.aHigh - b.aLow) / (b.cHigh - b.cLow)) * (pm25 - b.cLow) + b.aLow
      );
    }
  }
  return 500;
}

function getAqiMeaning(aqi) {
  if (aqi <= 50)
    return {
      text: "Good",
      message: "Air quality is excellent. Great time for outdoor activities!",
    };
  if (aqi <= 100)
    return {
      text: "Moderate",
      message:
        "Air quality is acceptable. Sensitive people should take it easy outdoors.",
    };
  if (aqi <= 150)
    return {
      text: "Unhealthy for Sensitive",
      message: "Those with asthma or allergies should limit outdoor exposure.",
    };
  if (aqi <= 200)
    return {
      text: "Unhealthy",
      message: "Air quality is poor. Avoid prolonged outdoor activity.",
    };
  if (aqi <= 300)
    return {
      text: "Very Unhealthy",
      message:
        "Everyone may experience health effects. Stay indoors with filtered air.",
    };
  return {
    text: "Hazardous",
    message: "Dangerous air quality! Stay indoors.",
  };
}

// --- FORECAST FUNCTION (UNCHANGED) ---

async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const forecastElement = document.getElementById("tomorrowForecast");

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.list) {
      forecastElement.textContent = "Forecast unavailable.";
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

// --- MAP FUNCTION (UNCHANGED) ---

function displayMap(lat, lon) {
  const mapContainer = document.getElementById("mapContainer");

  const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=12&output=embed`;

  mapContainer.innerHTML = `
              <iframe 
                  width="100%" 
                  height="200" 
                  frameborder="0" 
                  scrolling="no" 
                  marginheight="0" 
                  marginwidth="0" 
                  src="https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=12&output=embed"
                  allowfullscreen>
              </iframe>
          `;
}

// --- TIME & WEATHER FUNCTIONS (UNCHANGED) ---

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
      ? `Overcast and dark night with patchy clouds.`
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

function displayLocalTime(timezoneOffsetSeconds, sunriseTime, sunsetTime) {
  if (localTimeInterval) {
    clearInterval(localTimeInterval);
  }

  const timeElement = document.getElementById("localTime");
  const summaryElement = document.getElementById("weatherSummary");
  const sunEventElement = document.getElementById("sunEvent");
  const sunriseElement = document.getElementById("sunriseTime");
  const sunsetElement = document.getElementById("sunsetTime");

  const weatherDesc = document.getElementById("currentWeather").textContent;
  const tempElement = document.getElementById("temperatureHeading");
  const temp = parseFloat(tempElement.textContent.replace("°C", ""));

  function updateClock() {
    const utcMs = Date.now();
    const localTimeMs = utcMs + timezoneOffsetSeconds * 1000;
    const localDate = new Date(localTimeMs);
    const currentSecondUTC = Math.floor(localTimeMs / 1000);

    const isNight =
      currentSecondUTC > sunsetTime || currentSecondUTC < sunriseTime;

    setBackground(weatherDesc, isNight);

    // --- 1. Update Time Display ---
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    };
    const dateOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    };

    const timeString = localDate.toLocaleTimeString("en-US", timeOptions);
    const dateString = localDate.toLocaleDateString("en-US", dateOptions);
    timeElement.textContent = `${dateString} | ${timeString}`;

    // --- 2. Update Sun Event Countdown ---
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

    // --- 3. Update Custom Summary ---
    const currentTemp = parseFloat(
      document
        .getElementById("temperatureHeading")
        .textContent.replace("°C", "")
    );
    if (!isNaN(currentTemp)) {
      summaryElement.textContent = generateWeatherSummary(
        currentTemp,
        weatherDesc.toLowerCase(),
        isNight
      );
    }
  }

  // --- STATIC SUN TIME DISPLAY ---
  const sunriseDate = new Date(sunriseTime * 1000);
  const sunsetDate = new Date(sunsetTime * 1000);

  const sunTimeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  };

  const formattedSunrise = sunriseDate.toLocaleTimeString(
    "en-US",
    sunTimeOptions
  );
  const formattedSunset = sunsetDate.toLocaleTimeString(
    "en-US",
    sunTimeOptions
  );

  sunriseElement.textContent = `🌅 Sunrise: ${formattedSunrise}`;
  sunsetElement.textContent = `🌇 Sunset: ${formattedSunset}`;

  updateClock();
  localTimeInterval = setInterval(updateClock, 1000);
}

async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.main) {
      const temp = Math.round(data.main.temp);
      const weatherDesc = data.weather[0].description;
      const timezone = data.timezone;

      const sunriseTime = data.sys.sunrise + timezone;
      const sunsetTime = data.sys.sunset + timezone;

      document.getElementById("temperatureHeading").textContent = `${temp}°C`;
      document.getElementById("currentWeather").textContent =
        weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);

      displayLocalTime(timezone, sunriseTime, sunsetTime);
    } else {
      document.getElementById("temperatureHeading").textContent = "--°C";
      document.getElementById("currentWeather").textContent =
        "Weather data unavailable.";
      document.getElementById("localTime").textContent = "--:--";
      document.getElementById("weatherSummary").textContent = "";
      document.getElementById("sunriseTime").textContent = "";
      document.getElementById("sunsetTime").textContent = "";
      document.getElementById("sunEvent").textContent = "";
      if (localTimeInterval) clearInterval(localTimeInterval);
    }
  } catch (err) {
    document.getElementById("status").textContent =
      "Error fetching weather data.";
    console.error("Error fetching weather data:", err);
  }
}
// --- LOCATION & AQI FETCHING (UNCHANGED) --
async function getLocationName(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      const location = data[0];
      const display = location.state
        ? `${location.name}, ${location.state}, ${location.country}`
        : `${location.name}, ${location.country}`;
      document.getElementById("locationName").textContent = display;
      document.getElementById("urat").textContent = `🏠 You are in ${display}`;
      return display;
    } else {
      document.getElementById("locationName").textContent = "Unknown Location";
      return "Unknown Location";
    }
  } catch (err) {
    console.error("Error fetching location name:", err);
    return "Error fetching location name";
  }
}

function fetchAllData(lat, lon) {
  document.getElementById("status").textContent = "";
  getLocationName(lat, lon);
  getWeather(lat, lon);
  getForecast(lat, lon);
  displayMap(lat, lon);
}

// --- USER INPUT HANDLER (UNCHANGED) ---

async function getCoordinatesByCityName(cityName) {
  const encodedCity = encodeURIComponent(cityName);
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=1&appid=${apiKey}`;
  try {
    document.getElementById(
      "status"
    ).textContent = `Searching for "${cityName}"...`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      fetchAllData(lat, lon);
    } else {
      document.getElementById(
        "status"
      ).textContent = `Location "${cityName}" not found.`;
    }
  } catch (err) {
    document.getElementById("status").textContent = "Error during city search.";
    console.error(err);
  }
}

function searchLocation() {
  const cityName = document.getElementById("cityInput").value.trim();
  if (cityName) {
    getCoordinatesByCityName(cityName);
  } else {
    document.getElementById("status").textContent =
      "Please enter a location name.";
  }
}
function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById("status").textContent =
      "Geolocation not supported. Please use the search bar.";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchAllData(latitude, longitude);
    },
    () => {
      document.getElementById("status").textContent =
        "Failed to get location. Please use the search bar.";
    }
  );
}

// Initialize on load
getLocation();
