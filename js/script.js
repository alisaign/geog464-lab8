// Initialize base map
const map = L.map("map").setView([55, -70], 5);

// Add base tile layer (OpenStreetMap)
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// PART 1
// Load GeoJSON of weather stations
const stationsURL = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-8/refs/heads/main/DATA/climate-stations.geojson";

// Fetch GeoJSON and add to map
function loadStations(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Failed to load GeoJSON");
      return response.json();
    })
    .then(data => {
      const stationLayer = L.geoJSON(data, {
        onEachFeature: onEachStation,
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, stationStyle(feature))
        
      });
      // Add marker cluster group
      const markers = L.markerClusterGroup();
      stationLayer.eachLayer(layer => {
        markers.addLayer(layer);
      });
      markers.addTo(map);

      // Add layer control
      const baseMaps = {
        "OpenStreetMap": osm,
      };
      const overlayMaps = {
        "Climate Stations": stationLayer
      };
      L.control.layers(baseMaps, overlayMaps).addTo(map);
      L.control.scale().addTo(map);
    })
    .catch(err => console.error("Error loading GeoJSON:", err));
};

// Popup and click handler for each station
function onEachStation(feature, layer) {
  const props = feature.properties;
  const popup = `
    <strong>${props.name}</strong><br>
    Province: ${props.province}<br>
    Station ID:${props.STN_ID}<br>
    Elevation: ${props.ELEVATION}<br>
  `;
  layer.bindPopup(popup);
  // Fetch API data on click
  layer.on("click", () => {
    document.getElementById("station-name").innerHTML = "<strong>" + props.STATION_NAME + "</strong>";
    document.getElementById("climate-data").innerHTML = "<p>Loading climate data...</p>";
    fetchClimateData(props.CLIMATE_IDENTIFIER);
  });
}
// Q1. .then() executes the code inside it after the succsessful response from fetch is received
// Q2. .catch() executes when an error is thrown either by response is not being ok or something else broken



// PART 2
// Function to fetch Environment Canada climate data
function fetchClimateData(climateID) {
  let year = 2025;
  const apiURL = `https://api.weather.gc.ca/collections/climate-daily/items?limit=10&sortby=-LOCAL_DATE&CLIMATE_IDENTIFIER=${climateID}`;
  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(json => {
      if (!json.features || json.features.length === 0) {
        console.log("No recent climate data available for this station.");
        return;
      }

      const props = json.features[0].properties;
      console.log("Date:", props.LOCAL_DATE);
      console.log("Mean Temp (°C):", props.MEAN_TEMPERATURE);
      console.log("Total Precip:", props.TOTAL_PRECIPITATION);
    })
    .catch(error => {
      console.error("Error fetching climate data:", error);
    });
}

// PART 3
// Style for stations
function stationStyle(feature) {
  let elev = feature.properties.ELEVATION;
  let fillColor;
  if (elev < 100) fillColor = "#91bfdb";
  else if (elev < 300) fillColor = "#d4b86cff";
  else fillColor = "#b94915ff";
  return {
    radius: 6,
    fillColor: fillColor,
    color: "#fff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}


// PART 5


// Load map
loadStations(stationsURL);