function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById("status").textContent =
      "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
    () => {
      document.getElementById("status").textContent =
        "Failed to get location. Please use the search bar.";
    }
  );
}

getLocation();
