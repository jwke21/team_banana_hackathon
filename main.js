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

function carbonCalculations(travelMode) {
  var originLat;
  var originLong;
  var destLat;
  var destLong;

  // Clear prev markers
  for (var i = currentMarkers.length - 1; i >= 0; i--) {
    currentMarkers[i].remove();
  }

  // Get Origin loc
  var originCoordinates = convertAddressToCoordinates("origin-input");
  // Get Dest loc
  var destCoordinates = convertAddressToCoordinates("destination-input");

  var fromLoc;
  var toLoc;

  // Add origin marker to map
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

  // Add destination marker to map
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
    // Convert from meters to miles
    dist *= 0.000621371; // 1 meter = ~0.000621371 miles
    // Round to nearest hundredth
    console.log("Distance: " + dist + " miles");
    // Update screen for miles (rounded to nearest hundredth)
    var s = document.getElementById("distance");
    s.textContent = round(dist, 100);

    // Stop the repeat
    clearInterval(getDist);
  }, 1000);

  /* Perform calculations */

  var banana = 89 * (126/100); // 1 Banana (126g avg) = 112.14 kcal or Calories (large calorie)

  if (travelMode === "walk" || travelMode === "cycle") {
    const calculations = setInterval(() => {
      // Emissions is 0 for walking
      let emissions = 0.0;
      document.getElementById("emissions").textContent = emissions;
      
      // Energy
      let avgWalkSpeed = 3.5; // Harvard dataset
      let avgKcalBurned = 133*2; // per hour
      let energy = dist / avgWalkSpeed * avgKcalBurned;
      document.getElementById("energy").textContent = round(energy, 100);

      // Banana energy
      let bananaEnergy = energy / banana;
      document.getElementById("banana-energy").textContent = round(bananaEnergy, 100);

      // Trees required is 0 for walking
      let reqForestArea = 0.0;
      document.getElementById("forest-area").textContent = reqForestArea;

      // Stop the repeat
      clearInterval(calculations);
    }, 1000);
  } else if(travelMode === "pubTrans") {
    const calculations = setInterval(() => {
      // Emissions
      var avgEmissions = 0.39 * 0.000453592;
      let emissions = dist * avgEmissions;
      document.getElementById("emissions").textContent = round(emissions, 100);

      // Energy
      let avgMPG = 26.4;
      let convertGal = 31477.8537;
      let energy = dist / avgMPG * convertGal;
      document.getElementById("energy").textContent = round(energy, 100);

      // Banana energy
      let bananaEnergy = energy / banana;
      document.getElementById("banana-energy").textContent = round(bananaEnergy, 100);

      // Req forest
      let seq = 0.84/3600; // Metric tons CO2/acre/day
      let reqForestArea = seq / emissions;
      document.getElementById("forest-area").textContent = round(reqForestArea, 100);

      // Stop the repeat
      clearInterval(calculations);
    }, 1000);
  }
  else {
    const calculations = setInterval(() => {
      // Calculate CO2 emissions: CO2 emission = distance * (metric tons CO2/mile)
      var avgEmissions = 0.000403; // EPA's est average CO2 emissions: 4.03 x 10-4 metric tons CO2E/mile.
      var emissions = dist * avgEmissions;
      console.log("Emissions: " + emissions + " metric tons CO2E");
      // Update screen for emissions (rounded to nearest hundredth)
      var s = document.getElementById("emissions");
      s.textContent = round(emissions, 100);

      // Calculate energy used: Energy = distance / (average miles/gallon) * (gallon/kcal)
      var avgMPG = 27.48165199729181; // From CO2 Emissions_Canada.csv
      var convertGal = 31477.8537; // kcal 
      var energy = dist / avgMPG * convertGal;
      console.log("Energy: " + energy + " kcals");
      // Update screen for energy
      s = document.getElementById("energy");
      s.textContent = round(energy, 100);

      // Calculate banana energy: Banana energy = energy / 112
      var bananaEnergy = energy / banana;
      console.log("Banana Energy: " + bananaEnergy + " bananas");
      // Update screen for banana energy
      s = document.getElementById("banana-energy");
      s.textContent = round(bananaEnergy, 100);

      // Calculate req forest area: Forest area = (metric ton CO2 sequestered/acre/day) / CO2 emission
      var seq = 0.84/3600; // Metric tons CO2/acre/day
      var reqForestArea = seq / emissions;
      console.log("Required Forest Area: " + reqForestArea + " /acre/day");
      // Update screen for required forest area
      s = document.getElementById("forest-area");
      s.textContent = round(reqForestArea, 100);

      // Stop the repeat
      clearInterval(calculations);
    }, 1000);
  }

  // Resize the map view
  // const fitToMarkers = setInterval(() => {
  //   var bounds = new mapboxgl.LngLatBounds();
  //   markers.features.forEach(function(feature) {
  //     bounds.extend(feature.geometry.coordinates);
  //   });
  //   map.fitBounds(bounds);

  //   // Stop the repeat
  //   clearInterval(fitToMarkers);
  // }, 500);
}

function round(number, decimalPlace) {
  return Math.ceil(number * decimalPlace) / decimalPlace;
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

