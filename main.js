const apiKey = "b782ee4ad515b759b84bb4c98d77b48e";
const auto_city = document.getElementById("auto_city");
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
      let g = "🌅 Morning";
    } else if (hours24 >= 12 && hours24 < 16) {
      g = "☀️ Noon";
    } else if (hours24 >= 16 && hours24 < 19) {
      g = "🌇 Evening";
    } else {
      g = "🌙 Night";
    }
    if (desc === "clear sky") {
      desc = "Sky is clear! Enjoy the vive ! 🏙️";
    } else if (desc === "haze") {
      desc = "Cold hazy day with a greyish vive ! ☁️";
    }
    result.innerHTML = `
      <span style='font-size:22px'>${name}</span><br>
          <span style='font-size:14px'>${fullTime}</span> | <span>${g}</span><br><br>
          <span style='font-size:40px'><b>${temp.toFixed(0)}°C</b></span>
        <br><br>
          <span>${desc}</span>
    `;
    document.getElementById("myImageUp").classList.add("hidden");
  } catch (err) {
    console.error(err);
    result.textContent = "Something went wrong! ERROR 404";
  }
});
/////////////////////////////////////////////////////////////////

// Auto location on page load

////////////////////////////////////////////////////////////////
if (navigator.geolocation) {
  document.getElementById("myImage").classList.remove("hidden");
  auto_city.textContent = "Detecting your location.....";
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
        let desc = data.weather[0].description;
        const city = data.name || "Your current location";

        let now = new Date();
        let hours24 = now.getHours(); // 0–23 (keep this for conditions)
        let minutes = now.getMinutes();
        let ampm = hours24 >= 12 ? "PM" : "AM";

        // convert only for display
        let hours12 = hours24 % 12 || 12;
        let fullTime = `${hours12}:${minutes
          .toString()
          .padStart(2, "0")} ${ampm}`;
        //console.log(fullTime);
        // time ranges
        //Time Range (24-hr)	Period Shown
        //05:00(5am) → 11:59(am)	 Morning
        //12:00(12pm) → 15:59(4pm) Noon
        //16:00 (4pm) → 18:59(7pm)	Evening
        // 19:00(7pm) → 04:59(5am) Night
        if (hours24 >= 5 && hours24 < 12) {
          let g = "🌅 Morning";
        } else if (hours24 >= 12 && hours24 < 16) {
          g = "☀️ Noon";
        } else if (hours24 >= 16 && hours24 < 19) {
          g = "🌇 Evening";
        } else {
          g = "🌙 Night";
        }
        console.log(typeof desc);
        if (desc === "clear sky") {
          desc = "Sky is clear! Enjoy the vive ! 🏙️";
        } else if (desc === "haze") {
          desc = "Cold hazy day with a greyish vive ! ☁️";
        }
        auto_city.innerHTML = `
        <span style='color:darkgreen;font-weight:500;'>Your current location</span>
        <br><br>
          <span style='font-size:22px'>${city}</span><br>
          <span style='font-size:14px'>${fullTime}</span> | <span>${g}</span><br><br>
          <span style='font-size:40px'><b>${temp.toFixed(0)}°C</b></span>
        <br><br>
          <span>${desc}</span>
        `;
        document.getElementById("myImage").classList.add("hidden");
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
