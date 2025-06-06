// Set up the map
var mymap = L.map('map').setView([51.4286, -1.8540], 17);

// Add basemaps
var streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(mymap);

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    id: 'Esri.WorldImagery',
    maxZoom: 19
});

// Create variable for basemaps
var baseLayers = {
    'Streets': streets,
    'Satellite': satellite
};

// Create menu window for basemap control
var layerControl = L.control.layers(baseLayers, {}, { 
    collapsed: false,
    position: 'topright'
}).addTo(mymap);

// Create reset view button
var ZoomOutControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var button = L.DomUtil.create('button', 'custom-button');
            button.title = 'Reset view';
            button.onclick = function() {
                map.setView([51.4286, -1.8540], 17); 
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

// Create measurement tool
var measureControl = L.control.measure({
    position: 'topright',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters', 
    activeColor: '#3b82f6',    // color for active measurement
    completedColor: '#10b981'  // color for completed measurement
}).addTo(mymap);



// GeoJSON layer control

// Create unified GeoJSON control container
var geoJSONControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'geojson-control');
        container.innerHTML = '<h3>Digitised Transparencies</h3>';
        return container;
    }
});
var geoJSONControlInstance = new geoJSONControl().addTo(mymap);

// GeoJSON layer storage
var overlayLayers = {};

// Function to load GeoJSON and create controls
function loadGeoJSON(url, name, defaultColor) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
        // Create GeoJSON layer
            overlayLayers[name] = L.geoJSON(data, {
                style: {
                    weight: 0,
                    fillColor: defaultColor,
                    fillOpacity: 0.6
                }
            }).addTo(mymap);

        // Create control elements
            var layerContainer = L.DomUtil.create('div', 'layer-item', geoJSONControlInstance.getContainer());
            
        // Visibility checkbox
            var checkbox = L.DomUtil.create('input', 'layer-checkbox', layerContainer);
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.onchange = function() {
                mymap.hasLayer(overlayLayers[name]) ? 
                    mymap.removeLayer(overlayLayers[name]) : 
                    mymap.addLayer(overlayLayers[name]);
            };
        
        // Layer name
            var label = L.DomUtil.create('label', 'layer-label', layerContainer);
            label.textContent = name;
            label.htmlFor = 'layer-' + name.replace(/\s+/g, '-');
            
        // Color picker
            var colorPicker = L.DomUtil.create('input', 'layer-color', layerContainer);
            colorPicker.type = 'color';
            colorPicker.value = defaultColor;
            colorPicker.title = 'Change color';
            colorPicker.oninput = function() {
                overlayLayers[name].setStyle({ fillColor: this.value });
            };
        
            // Opacity slider
            var opacityContainer = L.DomUtil.create('div', 'opacity-container', layerContainer);
            var opacityLabel = L.DomUtil.create('span', 'opacity-label', opacityContainer);
            opacityLabel.textContent = 'Opacity:';
            var opacitySlider = L.DomUtil.create('input', 'opacity-slider', opacityContainer);
            opacitySlider.type = 'range';
            opacitySlider.min = 0;
            opacitySlider.max = 1;
            opacitySlider.step = 0.1;
            opacitySlider.value = 0.6;
            L.DomEvent.on(opacitySlider, 'mousedown touchstart click', L.DomEvent.stopPropagation);
            opacitySlider.oninput = function() {
                overlayLayers[name].setStyle({ fillOpacity: parseFloat(this.value) });
            };
        
        // Divider
            L.DomUtil.create('hr', 'layer-divider', geoJSONControlInstance.getContainer());
            
            return overlayLayers[name];
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
}        

// Load all GeoJSON layers
Promise.all([
    loadGeoJSON('GeoJSONs/c01_AubreyPlanA.geojson', "01: Aubrey Plan A", "#000000"),
    loadGeoJSON('GeoJSONs/c02_StukeleyPlanE.geojson', "02: Stukeley Plan E", "#ff0000"),
    loadGeoJSON('GeoJSONs/______', "03: Keiller SE Quad", "#0000FF"),
    loadGeoJSON('GeoJSONs/______', "04: Aubrey S Circle", "#000000"),
]).then(() => {
    console.log('All GeoJSON layers loaded');
});


// Splash screen interaction
document.addEventListener('DOMContentLoaded', function() {
    // Your existing code here
    document.getElementById('accept-splash').addEventListener('click', function() {
        document.getElementById('splash-modal').classList.add('hidden');
        document.getElementById('map').classList.remove('inactive');
    });
});