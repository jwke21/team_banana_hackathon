MAPBOX_ACCESS_TOKEN = "<Place_Your_MapBox_Access_Token_Here>";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [-122.337410, 47.620630], // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Map markers
let currentMarkers = []

function getBananaMetrics(travelMode) {
  // Clear prev markers if necessary
  for (var i = currentMarkers.length - 1; i >= 0; i--) {
    currentMarkers[i].remove();
  }

  // Get Origin and destination coordinates
  let originCoordinates = convertAddressToCoordinates("origin-input");
  let destCoordinates = convertAddressToCoordinates("destination-input");

  let fromLoc, toLoc;
  let dist;
  let originLong, originLat;
  let destLong, destLat;

  /* Add origin marker to map */
  originCoordinates
    .then((res) => {
      originLong = res[0];
      originLat = res[1];
      console.log("Origin: " + originLat + "," + originLong);
      // Add marker to map
      const marker = new mapboxgl.Marker()
        .setLngLat([originLong, originLat])
        .addTo(map);
      currentMarkers.push(marker);
      // Set from location
      fromLoc = new mapboxgl.LngLat(originLong, originLat);
    })
    /* Add destination marker to map */
    .then(() => {
      destCoordinates
        .then((res) => {
          destLong = res[0];
          destLat = res[1];
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
        })
      /* Get distance between points */
      .then(() => {
        dist = getDistanceBetweenCoordinates(fromLoc, toLoc);
        console.log("Distance: " + dist + " miles");
        // Update screen for distance traveled (rounded to nearest hundredth)
        document.getElementById("distance").textContent = round(dist, 100);
      })
      /* Perform calculations */
      .then(() => {
        calculateAndUpdateMetrics(travelMode, dist);
      })
    })
    /* Catch and report potential error */
    .catch(err => {
      console.error(err);
    })

  // TODO: Resize the map view
}


function getDistanceBetweenCoordinates(fromLoc, toLoc) {
  const milesConversion = 0.000621371; // 1 meter = ~0.000621371 miles
  var metersTraveled = fromLoc.distanceTo(toLoc);
  // Return distance traveled converted to miles
  return metersTraveled * milesConversion;
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
  url = GEOCODING_API_GET_URL + addrString + ".json?access_token=" + MAPBOX_ACCESS_TOKEN;

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


const bananaConversion = 89 * (126/100); // 1 Banana (126g avg) = 112.14 kcal or Calories (large calorie)
const seqForest = 0.84/3600; // Metric tons CO2/acre/day
const galToKcalConversion = 31477.8537;
const avgBusEmissions = 0.39 * 0.000453592; // Convert lbs/mile to metric tons CO2/mile
const avgCarEmissions = 0.000403; // EPA's est average CO2 emissions: 4.03 x 10-4 metric tons CO2E/mile.
const avgBusMPG = 26.4; // passanger-mpg, national average for US transit bus
const avgCarMPG = 27.48165199729181; // From CO2 Emissions_Canada.csv
const avgWalkMPH = 3.5; // https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights
const avgWalkKcalBurned = 133*2; // (avg Kcal/30mins) * 2 = avg Kcal per hour
const avgBikeMPH = 12; // https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-for-people-of-three-different-weights
const avgCycleKcalBurned = 288*2; // (avg Kcal/30mins) * 2 = avg Kcal per hour

function calculateAndUpdateMetrics(travelMode, dist) {
  let emissions; // CO2 emission = distance * (metric tons CO2/mile)
  let energy;
  let bananaEnergy; // Banana energy = energy / 112
  let reqForestArea; // Required forest area = (metric ton CO2 sequestered/acre/day) / CO2 emission

  if (travelMode === "pubTrans") {
    emissions = dist * avgBusEmissions; // Emissions = distance * (bus metric tons CO2 / mile)
    energy = dist / avgBusMPG * galToKcalConversion; // Kcal energy it took for the travel for all passengers
    bananaEnergy = energy / bananaConversion;
    reqForestArea = seqForest / emissions;
  } else if (travelMode === "drive") {
    emissions = dist * avgCarEmissions; // Emissions = distance * (car metric tons C02 / mile)
    energy = dist / avgCarMPG * galToKcalConversion; // Energy = distance / (average miles/gallon) * (gallon/kcal)
    bananaEnergy = energy / bananaConversion;
    reqForestArea = seqForest / emissions;
  } else if (travelMode === "walk") {
    emissions = 0.0; // Emissions is 0 for walking
    energy = dist / avgWalkMPH * avgWalkKcalBurned;
    bananaEnergy = energy / bananaConversion;
    reqForestArea = 0.0; // Required forest area is 0 for walking
  } else {
    emissions = 0.0; // Emissions is 0 for cycling
    energy = dist / avgBikeMPH * avgCycleKcalBurned;
    bananaEnergy = energy / bananaConversion;
    reqForestArea = 0.0; // Required forest area is 0 for cycling
  }

  // Update screen with metrics
  document.getElementById("emissions").textContent = round(emissions, 100);
  document.getElementById("energy").textContent = round(energy, 100);
  document.getElementById("banana-energy").textContent = round(bananaEnergy, 100);
  document.getElementById("forest-area").textContent = round(reqForestArea, 100);
  console.log("Emissions: " + emissions + " metric tons CO2E");
  console.log("Energy: " + energy + " kcals");
  console.log("Banana Energy: " + bananaEnergy + " bananas");
  console.log("Required Forest Area: " + reqForestArea + " acres per day");
}
