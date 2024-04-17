let map = L.map("map", {
  center: [39.9526, -75.1652],
  zoom: 4
});

// Base Maps
let BaseMaps = {
  'OpenStreetMap': L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy; OpenStreetMap contributors'
  }).addTo(map),
  'OpenTopoMap': L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy; OpenTopoMap contributors'
  }),
  'Esri World Imagery': L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }),
  'CartoDB Positron': L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    attribution: '©OpenStreetMap, ©CartoDB'
  })
};

let earthquakes = new L.LayerGroup().addTo(map);
let tectonicPlates = new L.LayerGroup().addTo(map);

let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

L.control.layers(BaseMaps, overlays).addTo(map);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson").then(function(data){
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, styleInfo(feature));
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]} <br> Location: ${feature.properties.place}`);
    }
  }).addTo(earthquakes);
});

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
  L.geoJson(plateData, {
    color: "orange",
    weight: 3
  }).addTo(tectonicPlates);
});

function getColor(depth) {
  let r, g, b;
  if (depth <= 10) {
      r = 255; g = 255; b = 255; // White
  } else if (depth <= 30) {
      const factor = (depth - 10) / 20;
      r = 255;
      g = 255;
      b = 255 - Math.round(255 * factor); // Transition to yellow
  } else if (depth <= 50) {
      r = 255;
      g = 255;
      b = 0; // Yellow
  } else if (depth <= 70) {
      const factor = (depth - 50) / 20;
      r = 255;
      g = 255 - Math.round(128 * factor);
      b = 0; // Transition to orange
  } else if (depth <= 90) {
      const factor = (depth - 70) / 20;
      r = 255;
      g = 127 - Math.round(127 * factor);
      b = 0; // Transition to red
  } else {
      r = 255; g = 0; b = 0; // Red
  }
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

function getRadius(magnitude) {
  return magnitude === 0 ? 1 : magnitude * 4;
};

function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: getColor(feature.geometry.coordinates[2]),
    color: "#000000",
    radius: getRadius(feature.properties.mag),
    stroke: true,
    weight: 0.6
  };
};

function addColorLegend() {
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 30, 50, 70, 90], // Depth breakpoints
          labels = [];
      div.innerHTML += '<strong>Depth Scale</strong><br>';
      for (var i = 0; i < grades.length; i++) {
          var from = grades[i];
          var to = grades[i + 1];
          var color = getColor(from);
          labels.push(
              '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ' +
              (to ? from + '&ndash;' + to : from + '+'));
      }
      div.innerHTML += labels.join('<br>');
      return div;
  };
  legend.addTo(map);
}

addColorLegend();
``