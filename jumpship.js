const status = document.getElementById("status");

if (!navigator.geolocation) {
  status.textContent = "Geolocation not supported.";
} else {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      status.textContent = `Lat: ${coords.latitude}, Lon: ${coords.longitude}`;
    },
    () => {
      status.textContent = "Location denied";
    }
  );
}
