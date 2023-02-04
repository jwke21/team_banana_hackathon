// function distance_to_emissions(dist_miles) {
//     const mean = 403.27698344; // (Grams per Mile)
//     return dist_miles * mean;
// }

// function distance_to_calories(dist_miles) {
//     const mean = 0.6168538717; // Calories per 
//     return dist_miles * mean;
// }


MAPBOX_ACCESS_TOKEN = "?access_token=pk.eyJ1Ijoid2FrZTIxIiwiYSI6ImNsZHBxNmE5NDAza24zdm1zMmp3b3BlejYifQ.2zh68FrGfBHSDnuhtpk1Ig"

mapboxgl.accessToken = 'pk.eyJ1Ijoid2FrZTIxIiwiYSI6ImNsZHBxNmE5NDAza24zdm1zMmp3b3BlejYifQ.2zh68FrGfBHSDnuhtpk1Ig';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-122.337410, 47.620630], // starting position [lng, lat]
  zoom: 12, // starting zoom
});
// Add control to the map
map.addControl(
  new MapBoxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  })
);

function carbonCalculations() {
  var coordinates = getCoordinates();
  console.log(coordinates);
}

function getCoordinates() {
    var origin = convertAddressToCoordinates("origin-input");
    var dest = convertAddressToCoordinates("destination-input");
    return [origin, dest];
}

// Converts the given address string into coordinates (lattitude and longitude)
async function convertAddressToCoordinates(elemId) {
  // Get the string of the address
  var addrString = document.getElementById(elemId).value;

  // Geofetch using MapBox API: https://docs.mapbox.com/api/search/geocoding/
  GEOCODING_API_GET_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

  // Correctly format the address string for API
  addrString = addrString.trim();
  addrString = addrString.replaceAll(" ", "%20");
  url = GEOCODING_API_GET_URL + addrString + ".json" + MAPBOX_ACCESS_TOKEN;

  try {
    // Make API call
    const response = await fetch(url);
    const myJson = await response.json(); //extract JSON from the http response
    const val = await JSON.parse(JSON.stringify(myJson));
    const coordinates = await val.features[0].center;
    console.log("Coordinates: " + coordinates);
    return coordinates;
  } catch (error) {
    console.log(error);
  }
}

