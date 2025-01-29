// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {attribution: "<a href='https://openstreetmap.org'>OpenStreetMap</a>"}
)
// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// Create the map object with center and zoom options.
var myMap = L.map("map", {
  center: [40.7, -94.5],
  zoom: 3,
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquake = new L.layerGroup();
let tectonic_plates = new L.layerGroup();

// Create an object to hold the base layers. \\
let baseMaps = {
'Basemap': basemap,
'Street Map': street 
};

// Create an overlays object to add to the layer control. \\
let overlays = {
  Earthquakes: earthquake,
  'Tectonic Plates': tectonic_plates
};

// Add the layer control to the map. \\
L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
return {
  opacity: 1,
  fillOpacity: 1,
  fillColor: getColor(feature.geometry.coordinates[2]),
  color: "#000000",
  radius: getRadius(feature.properties.mag),
  stroke: true,
  weight: 0.5
  };
}

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
return depth > 90 ? "#d73027" :
  depth > 70 ? "#fc8d59" :
  depth > 50 ? "#fee08b" :
  depth > 30 ? "#d9ef8b" :
  depth > 10 ? "#d4ee00" :
  "#98ee00"
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 :
    magnitude * 4;   
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup('Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]} km');
    }
  }).addTo(earthquake);

  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  
  earthquake.addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depth = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#d9ef8b",
      "#fee08b",
      "#fc8d59",
      "#d73027"
    ];
    // Initialize depth intervals and colors for the legend
  
    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depth.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " + depth[i] + (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, add the legend to the map.
legend.addTo(myMap);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
L.geoJson(plate_data, {
  color: "#ff6500",
  weight: 2
}).addTo(tectonic_plates);

    // Then add the tectonic_plates layer to the map.
tectonic_plates.addTo(myMap);
  });
});
