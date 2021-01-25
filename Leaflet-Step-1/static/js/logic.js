//store API URL 
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  //log results in console
  console.log(data.features)
  //once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  //define a function we want to run once for each feature in the features array
  //give each feature a popup describing the place, magnitude and depth of earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h4> Location: " + feature.properties.place +
      "<br> Depth: " + (feature.geometry.coordinates[2]) + "<br>Magnitude: " + feature.properties.mag + "</h4>");
  }


  //function for markersize based on earthquake magnitude
  function markerSize(mag) {
    return mag * 15000
  }

  //function for marker color based on earthquake depth
  function markerColor(depth) {
    if (depth < 10) {
      return "#1aff1a"
    }
    else if (depth < 30) {
      return "#8cff1a"
    }
    else if (depth < 50) {
      return "#ffa500"
    }
    else if (depth < 70) {
      return "#ff661a"
    }
    else if (depth < 90) {
      return "#ff884d"
    }
    else {
      return "#ff0000"
    }

  }
  
  //create a GeoJSON layer containing the features array on the earthquakeData object
  //return circle where radius is based on magnitude and circle color is based on depth
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: markerSize(earthquakeData.properties.mag),
        fillColor: markerColor(earthquakeData.geometry.coordinates[2]),
        color: "#000",
        weight: 0.5,
        fillOpacity: 1
      });
    },
      onEachFeature: onEachFeature
  });
  

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      40, -100
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  //create function for legend color ranges
  function getColor(d) {
    return d > 90   ? '#ff0000' :
           d > 70   ? '#ff661a' :
           d > 50   ? '#ffa500' :
           d > 30   ? '#ffff00' :
           d > 10   ? '#8cff1a' :
                      '#1aff1a' ;
  }

  //add legend to map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        depth = [-10, 10, 30, 50, 70, 90]
        labels = [];

    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
           '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
           depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}



