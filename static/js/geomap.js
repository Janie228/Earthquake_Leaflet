
// Initialize global variables
var plate = "";
var earthquakes = "";
var baseMaps = "";
var myMap ="";
  
//--------------------------------------------------------------------------------------------------------------
// Create GeoMap
createMap();
//--------------------------------------------------------------------------------------------------------------

// This is the MAIN function that creates the map
function createMap(){
  // Step#1 - Define base map layers
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

  // Step#2 - Define a baseMaps object to hold the layers
  baseMaps = {
    "Street Map": streetmap,
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoor": outdoor
  };

  // Step#3 - Create map with satellite layer as default on load
  myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satellite]
  });
  
  // Step#4 - Create all the markers and all layers, and add to the map 
  createMarkers();
}

// This function creates all the markers & add to map: boundary plate, & circle marker with popup
function createMarkers(){
  // Perform a GET request to the query URL
  d3.json("static/dataset/plate.geojson", function(plateData) {
    plate = L.geoJson(plateData, {
      style: function(feature) {
        return {
          stroke: true,
          weight: 3,
          fillOpacity: 0
        };
      }
    }).addTo(myMap);    
  })

  // This variable stores the API endpoint 
  var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  // Perform a GET request to the query URL
  d3.json(url, function(data) {
    // console.log(data);
    // Once response, send data to create circle marker
    createCircleMarker(data.features);
  });
}

// This function create circle marker with popup & send the result to create layers
function createCircleMarker(earthquakeData) {
  earthquakes = L.geoJson(earthquakeData, {
    // Create circle & pass to layer
    pointToLayer: function(feature, latlng) {
      return L.circle(latlng, {
        radius: (feature.properties.mag * 25000),
        fillColor: getColor(feature.properties.mag),  
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    // Create tooltip & attach to layer
    onEachFeature: createTooltip
  }).addTo(myMap);
  
  // Send layer to the createMap function
  // ***Note: after circle marker w/ pointtolayer is creates, it needs to create 
  //  control layer right away (cannot pass back & forth the earthquakes object)****
  createMapLayers();
}

// This function creates popup describing the place, time, and magnitude of the earthquake
function createTooltip(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
  new Date(feature.properties.time) + "</p><p>Magnititude: " + feature.properties.mag + "</p>");
}

// This function create the map & map layers
function createMapLayers() {
  // Set layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": plate 
  };

  // Create a layer control, pass in baseMaps and overlayMaps, and add to the map
  L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

  // Add legend to map
  CreateLegend(myMap);
}

// This function creates the legend for the circles baseed on earthquake's magnitude
function CreateLegend(map) {
  var legend = L.control({position: 'topleft'});  // create legend at top left
  
  // Add on the color scale manually
  legend.onAdd = function (map) {  
    var div = L.DomUtil.create('div', 'info legend'),
    magnitudes = [0, 1, 2, 3, 4, 5],
    labels = ['<strong>Magitudes</strong>'];

    // loop through magnitudes and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
      labels.push('<li style=\"list-style-type:none;\"><i style="background:' + getColor(magnitudes[i] + 1) + '"></i><div>' +
      magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1]: '+') + "</div></li>");
    }  

    div.innerHTML = labels.join('');
    return div;
  };
  
  legend.addTo(map);
}

// This function will determine the color based on the magnitude of the earthquake
function getColor(m) {
  return  m > 5?  '#DC143C':
          m > 4?  '#FF5733': 
          m > 3?  '#FFD633':
          m > 2?  '#DEFF33':
          m > 1?  '#7FFF00':
          m > 0?  '#2E8B57':
                  '#2E8B57';
} 


