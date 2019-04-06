// This variable stores the API endpoint 
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(url, function(data) {
  // console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});
 
// This function will determine the color based on the magnitude of the earthquake
function getColor(m) {
  return m > 5 ? '#9B1308' :
  m > 4? '#DC1303' : 
  m > 3? '#FF5733' :
  m > 2? '#FFD633' :
  m > 1 ? '#DEFF33' :
  m > 0 ? '#A0FF33' :
  '#A0FF33';
} 

// This function creates the legend for the circles
function CreateLegend(map) {
  var legend = L.control({position: 'bottomright'});  // create legend at bottom right
  
  // Add on the color scale manually
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

function createFeatures(earthquakeData) {
  // This function provides a popup describing the place, time, and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>Magnititude: " + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer with circle markers containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {
    // Create circle & pass to layer
    pointToLayer: function(feature, latlng) {
      return L.circle(latlng, {
        // style: createCircle(feature.properties.mag)
        radius: (feature.properties.mag * 25000),
        fillColor: getColor(feature.properties.mag),  
        color: "blue",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    // Create tooltip & attach to layer
    onEachFeature: onEachFeature
  });

   // Send earthquakes layer to the createMap function
  createMap(earthquakes);
}

// This function create the map & map layers
function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoor": outdoor
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend to map
  CreateLegend(myMap);
}

  


