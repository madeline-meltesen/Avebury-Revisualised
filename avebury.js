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

// Create reset view button
var ZoomOutControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var button = L.DomUtil.create('button', 'custom-button');
            button.title = 'Reset view';
            button.onclick = function() {
                map.setView([51.4286, -1.8538], 17); 
                };
                return button;
    }
});
new ZoomOutControl().addTo(mymap); 

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



// GeoJSON layer control
var overlayLayers = {};

// Add GeoJSONs to the map
function loadGeoJSON(url, name, color) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            overlayLayers[name] = L.geoJSON(data, {
                style: {
                    weight: 0,
                    fillColor: color,
                    fillOpacity: 0.5
                }
            }).addTo(mymap);
        });
}

// Initialise layer control
Promise.all([
    loadGeoJSON('GeoJSONs/c01_AubreyPlanA.geojson', "01: Aubrey Plan A", "black"),
    loadGeoJSON('GeoJSONs/c02_StukeleyPlanE.geojson', "02: Stukeley Plan E", "red"),
]).then(() => {
    var overlayControl = L.control.layers(null, overlayLayers, {
        collapsed: false,
        position: 'topleft'
    }).addTo(mymap);
    
    overlayControl.getContainer().classList.add('geojson-overlay-control');
})
