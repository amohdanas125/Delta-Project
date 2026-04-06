
    //   // Change this to your access token
    //   var key =mapToken;
    //   // Add layers that we need to the map
    //   var streets = L.tileLayer.Unwired({
    //     key: key,
    //     scheme: "streets"
    //   });
    //   // Initialize the map
    //   var map = L.map('map', {
    //     center: [37.779,-122.42], // Map loads with this location as center lat,lon
    //     zoom: 13,
    //     scrollWheelZoom: true,
    //     layers: [streets],
    //     zoomControl: false
    //   });


    //   // Add the autocomplete text box
    //   L.control.geocoder(key, {
    //     // placeholder: 'Search nearby',
    //     url: "https://api.locationiq.com/v1",
    //     expanded: true,
    //     panToPoint: true,
    //     focus: true,
    //     position: "topleft"
    //   }).addTo(map);

// var key = mapToken;

// var streets = L.tileLayer.Unwired({
//   key: key,
//   scheme: "streets"
// });

// var map = L.map('map', {
//   center: [37.779,-122.42], // temporary
//   zoom: 13,
//   scrollWheelZoom: true,
//   layers: [streets],
//   zoomControl: false
// });

// // 🔥 Add this part
// const coordinates = listing.geometry.coordinates;
// const lat = coordinates[1];
// const lng = coordinates[0];

// map.setView([lat, lng], 13);

// L.marker([lat, lng])
//   .addTo(map)
//   .bindPopup("<b>" + listing.title + "</b>")
//   .openPopup();


// // existing geocoder (keep it)
// L.control.geocoder(key, {
//   url: "https://api.locationiq.com/v1",
//   expanded: true,
//   panToPoint: true,
//   focus: true,
//   position: "topleft"
// }).addTo(map);

var key = mapToken;

var streets = L.tileLayer.Unwired({
  key: key,
  scheme: "streets"
});

var map = L.map('map', {
  center: [37.779, -122.42],
  zoom: 13,
  scrollWheelZoom: true,
  layers: [streets],
  zoomControl: false
});

// ✅ SAFETY CHECK
if (!listing || !listing.geometry) {
  console.error("No geometry found");
}

// ✅ Get coordinates
const coordinates = listing.geometry.coordinates;

// GeoJSON → Leaflet
const lat = coordinates[1];
const lng = coordinates[0];

// ✅ Set view
map.setView([lat, lng], 13);

// ✅ Add marker
L.marker([lat, lng])
  .addTo(map)
  .bindPopup(`<b>${listing.title}</b>`)
  .openPopup();


// geocoder (keep)
L.control.geocoder(key, {
  url: "https://api.locationiq.com/v1",
  expanded: true,
  panToPoint: true,
  focus: true,
  position: "topleft"
}).addTo(map);