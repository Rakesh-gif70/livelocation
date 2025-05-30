const socket = io();
let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let userMarker = null;
let otherMarkers = {};

function updateMap(lat, lng, id) {
  if (id === socket.id) {
    if (!userMarker) {
      userMarker = L.marker([lat, lng]).addTo(map).bindPopup("You");
    } else {
      userMarker.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], 15);
  } else {
    if (!otherMarkers[id]) {
      otherMarkers[id] = L.marker([lat, lng]).addTo(map).bindPopup("User");
    } else {
      otherMarkers[id].setLatLng([lat, lng]);
    }
  }
}

navigator.geolocation.watchPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    socket.emit('locationUpdate', { lat: latitude, lng: longitude });
    updateMap(latitude, longitude, socket.id);
  },
  (err) => alert("Geolocation error: " + err.message),
  { enableHighAccuracy: true }
);

socket.on('locationUpdate', ({ id, lat, lng }) => {
  if (id !== socket.id) {
    updateMap(lat, lng, id);
  }
});