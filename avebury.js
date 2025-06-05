// Set up the map
var mymap = L.map('map').setView([51.4285, -1.8538], 16);

// Add basemaps
var streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    id: 'Esri.WorldTopoMap'
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