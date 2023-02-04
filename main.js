// function distance_to_emissions(dist_miles) {
//     const mean = 403.27698344; // (Grams per Mile)
//     return dist_miles * mean;
// }

// function distance_to_calories(dist_miles) {
//     const mean = 0.6168538717; // Calories per 
//     return dist_miles * mean;
// }

MAPBOX_ACCESS_TOKEN = "?access_token=pk.eyJ1Ijoid2FrZTIxIiwiYSI6ImNsZHBxNmE5NDAza24zdm1zMmp3b3BlejYifQ.2zh68FrGfBHSDnuhtpk1Ig";

mapboxgl.accessToken = 'pk.eyJ1Ijoid2FrZTIxIiwiYSI6ImNsZHBxNmE5NDAza24zdm1zMmp3b3BlejYifQ.2zh68FrGfBHSDnuhtpk1Ig';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-122.337410, 47.620630], // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Map markers
var currentMarkers = []

function carbonCalculations() {
  var originLat;
  var originLong;
  var destLat;
  var destLong;

  // Clear markers
  for (var i = currentMarkers.length - 1; i >= 0; i--) {
    currentMarkers[i].remove();
  }

  // Get Origin loc
  var originCoordinates = convertAddressToCoordinates("origin-input");
  // Get Dest loc
  var destCoordinates = convertAddressToCoordinates("destination-input");

  var fromLoc;
  var toLoc;

  originCoordinates.then((res) => {
    originLat = res[1];
    originLong = res[0];
    console.log("Origin: " + originLat + "," + originLong);
    // Add marker to map
    const marker = new mapboxgl.Marker()
      .setLngLat([originLong, originLat])
      .addTo(map);
    currentMarkers.push(marker);
    // Set from location
    fromLoc = new mapboxgl.LngLat(originLong, originLat);
  });

  destCoordinates.then((res) => {
    destLat = res[1];
    destLong = res[0];
    console.log("Dest: " + destLat + "," + destLong);
    // Add marker to map
    const marker = new mapboxgl.Marker({
      color: "#FF0000" // Red
    })
      .setLngLat([destLong, destLat])
      .addTo(map);
    currentMarkers.push(marker);
    // Set to location
    toLoc = new mapboxgl.LngLat(destLong, destLat);
  });

  /* Get dist */
  var dist;
  const getDist = setInterval(() => {
    dist = fromLoc.distanceTo(toLoc);
  }, 1000);

  /* Perform calculations */
  
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
    var coordinates = await myJson.features[0].center;
    return coordinates;
  } catch (error) {
    console.log(error);
  }
}

