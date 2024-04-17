let map = L.map("map", {
  center: [39.9526, -75.1652],
  zoom: 3
});

// Define the base map, but dont add it yet
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: 'Map data &copy; OpenStreetMap contributors'
});

let earthquakes = new L.LayerGroup().addTo(map); // Earthquake layer is added to the map

// Layers and control
let baseMaps = {
  'Global Map': basemap // Base map is now toggleable
};

let overlays = {
  "Earthquakes": earthquakes // Only earthquakes in overlays
};

L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map); // Control for toggling layers

// Load and style earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson").then(function(data){
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, styleInfo(feature));
      },
      onEachFeature: function(feature, layer) {
          layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>Depth: ' + feature.geometry.coordinates[2] + '<br>Location: ' + feature.properties.place);
      }
  }).addTo(earthquakes);
});


//logic for the color of the circles
function getColor(depth) {
  let r, g, b;
  if (depth <= 10) r = 255, g = 255, b = 255;
  else if (depth <= 30) r = 255, g = 255, b = 255 - Math.round(255 * (depth - 10) / 20);
  else if (depth <= 50) r = 255, g = 255, b = 0;
  else if (depth <= 70) r = 255, g = 255 - Math.round(128 * (depth - 50) / 20), b = 0;
  else if (depth <= 90) r = 255, g = 127 - Math.round(127 * (depth - 70) / 20), b = 0;
  else r = 255, g = 0, b = 0;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
// logic to size the diamter by magnitude
function getRadius(magnitude) {
  return magnitude === 0 ? 1 : magnitude * 4;
}

function styleInfo(feature) {
  return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
  };
}
// add the legend
function addColorLegend() {
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 30, 50, 70, 90], // Depth breakpoints
          labels = [];
      div.innerHTML += '<strong>Depth Scale</strong><br>';
      for (var i = 0; i < grades.length; i++) {
          var color = getColor(grades[i]);
          labels.push(
              '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'));
      }
      div.innerHTML += labels.join('<br>');
      return div;
  };
  legend.addTo(map);
}
addColorLegend();