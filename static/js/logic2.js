// Creating map object
var map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 3
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(map);

var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Function that will determine the color of a neighborhood based on the borough it belongs to
function getColor(d) {
  return d > 5 ? '#9B1308' :
  d > 4? '#DC1303' :  //FF4233
  d > 3? '#FF5733' :
  d > 2? '#FFD633' :
  d > 1 ? '#DEFF33' :
  d > 0 ? '#A0FF33' :
  '#A0FF33';
  } 

// Grabbing our GeoJSON data..
d3.json(link, function(data) {

  // Looping thru data to create circle
  data.features.forEach(feature => {

    L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      // Passing in our style object
      radius: (feature.properties.mag * 15000),
      fillColor: getColor(feature.properties.mag),  
      color: "blue",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
      new Date(feature.properties.time) + "</p><p>Magnititude: " + feature.properties.mag + "</p>").addTo(map);
  
  });

  CreateLegend();
});


function CreateLegend() {
  
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i>' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(map);
}