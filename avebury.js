// Set up the map
var mymap = L.map('map').setView([51.4286, -1.8538], 17);

// Add basemaps
var streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(mymap);

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    id: 'Esri.WorldImagery'
});

// Create variable for basemaps
var baseLayers = {
    'Streets': streets,
    'Satellite': satellite
};

// Create menu window for basemap control
var layerControl = L.control.layers(baseLayers, {}, { collapsed: false }).addTo(mymap);

// Create locator (inset) map
var miniMap = new L.Control.MiniMap(L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'), {
    toggleDisplay: true,
    position: 'bottomright',
    zoomLevelOffset: -6,
}).addTo(mymap);

// Add a scale bar to the map
L.control.scale({
    imperial: true, // Show imperial units (feet/miles)
    metric: true,    // Show metric units (meters/kilometers)
    position: 'bottomleft'
}).addTo(mymap);


// Add GeoJSONs to the map
fetch('GeoJSONs/c01_AubreyPlanA.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        weight: 0,
        fillColor: "black",
        fillOpacity: 0.7
      }
    }).addTo(mymap);
  });
