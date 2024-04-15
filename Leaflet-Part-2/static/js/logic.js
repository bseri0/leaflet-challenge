let basemap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{
  attibution: 'Map data: &copy;'
});

let map = L.map("map", {
  center: [39.9526, -75.1652],
  zoom: 4
})



basemap.addTo(map);

let tectonicPlates = new L. LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
  'Global Map': basemap
}

let overlays = {
  "Tectonic Plates": tectonicPlates,
  "Earthquakes": earthquakes
}

L.control.layers(BaseMaps, overlays).addTo(map);

// Color symbols by Depth VALUE
function getColor(depth) {
  let r = 255, g = 255, b = 255; // Start with white

  if (depth <= 10) {
    // Color remains white up to depth 10
    r = 255;
    g = 255;
    b = 255;
  } else if (depth <= 30) {
    // Interpolate from white to yellow from depth 10 to 30
    const factor = (depth - 10) / (30 - 10);
    r = 255;
    g = 255;
    b = 255 - Math.round(255 * factor); // Reduce blue to transition to yellow
  } else if (depth <= 50) {
    // Yellow at depth 30, maintain yellow until 50
    r = 255;
    g = 255;
    b = 0;
  } else if (depth <= 70) {
    // Interpolate from yellow to orange from depth 50 to 70
    const factor = (depth - 50) / (70 - 50);
    r = 255;
    g = 255 - Math.round(128 * factor); // Gradually reduce green
    b = 0;
  } else if (depth <= 90) {
    // Interpolate from orange to red from depth 70 to 90
    const factor = (depth - 70) / (90 - 70);
    r = 255;
    g = 127 - Math.round(127 * factor); // Continue reducing green to reach red
    b = 0;
  } else {
    // Color is red at depth 90 or more
    r = 255;
    g = 0;
    b = 0;
  }


  // Convert RGB to hex string
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// calculate diameter of circle
function getRadius(magnitude) {
  if (magnitude ===0) {
      return 1
  }
  return magnitude * 4
}

/// pull the data with d3

  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson").then(function(data){
  console.log(data);

  function styleInfo(feature) {
      return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000000",
          radius: getRadius(feature.properties.mag),
          stroke : true,
          weight: 0.6

      }
  }

  L.geoJson(data,{
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function(feature, layer) {
          layer.bindPopup(`
              Magnitude: ${feature.properties.mag} <br>
              Depth: ${feature.geometry.coordinates[2]} <br>
              Location: ${feature.properties.place}
          `);
      }
  }).addTo(earthquakes);

  earthquakes.addTo(map);


      // pull the earth's tectonic plates line data with d3
  d3.json(
      "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
  L.geoJson(plateData,{
      color:"orange",
      width: 3 ,
  }).addTo(tectonicPlates);

  tectonicPlates.addTo(map);
});




// LEGEND
        // Define and add the color legend
        function addColorLegend(map) {
          var legend = L.control({position: 'bottomright'});
          legend.onAdd = function (map) {
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
                      from + (to ? '&ndash;' + to : '+'));
              }
              div.innerHTML += labels.join('<br>');
              return div;
          };
          legend.addTo(map);
      }

      // Call the function to add the legend
      addColorLegend(map);

});