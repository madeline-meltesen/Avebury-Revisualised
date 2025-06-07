// Set up the map
var mymap = L.map('map').setView([51.4286, -1.8542], 17);

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
                map.setView([51.4286, -1.8542], 17); 
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


// Create draw tool
var drawnItems = new L.FeatureGroup();
mymap.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: true,  
        marker: true, 
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems  // Enable editing of drawn items
    }
}).addTo(mymap);

// Handle drawing events
mymap.on(L.Draw.Event.CREATED, function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
    
    // Save drawn items to GeoJSON
    var data = drawnItems.toGeoJSON();
    console.log(JSON.stringify(data));
});


// Create export control
var printControl = L.easyPrint({
    title: 'Export Map',
    position: 'topright',
    exportOnly: true,
    filename: 'avebury-map',
    sizeModes: ['Current'],
}).addTo(mymap);

// GeoJSON layer control
var geoJSONControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'geojson-control');
        container.innerHTML = '<h3>Digitised Plans</h3>';
        return container;
    }
});
var geoJSONControlInstance = new geoJSONControl().addTo(mymap);

// GeoJSON layer storage
var overlayLayers = {};

// Link GeoJSONs to original digitised transparency PNGs
const layerImages = {
    "01: Aubrey Plan A": "Transparencies/01_AubreyPlanA.png",
    "02: Stukeley Plan E": "Transparencies/02_StukeleyPlanE.png",
    "03: Keiller SE Quad": "Transparencies/03_KeillerSEQuad.png",
    "04: Aubrey Plan A (S Circle)": "Transparencies/04_AubreySCircle.png",
    "05: Aubrey Plan A (S Circle Enlarged)": "Transparencies/05_AubreySCircleEnlarged.png",
    "06: Stukeley Plate 32": "Transparencies/06_StukeleyPlate32.png",
    "07: Stukeley Plate 33": "Transparencies/07_StukeleyPlate33.png",
    "08: Stukeley Plate 34": "Transparencies/08_StukeleyPlate34.png",
    "09: Stukeley Plate 35": "Transparencies/09_StukeleyPlate35.png",
    "10: Stukeley Plate 36": "Transparencies/10_StukeleyPlate36.png",
    "11: Stukeley Plate 37": "Transparencies/11_StukeleyPlate37.png",
    "12: Stukeley Plate 38": "Transparencies/12_StukeleyPlate38.png",
    "13: Stukeley Plate 39": "Transparencies/13_StukeleyPlate39.png",
    "14: Stukeley Plate 40": "Transparencies/14_StukeleyPlate40.png",
    "15: Stukeley Plate 41": "Transparencies/15_StukeleyPlate41.png",
    "16: Stukeley Plate 42": "Transparencies/16_StukeleyPlate42.png",
    "17: Smith 1965": "Transparencies/17_Smith1965.png",
    "18: Aubrey Plan B": "Transparencies/18_AubreyPlanB.png",
    "19: Stukeley 1722-24b": "Transparencies/19_StukeleyTour.png",
    "20: Stukeley Plate 15": "Transparencies/20_StukeleyMeasuredPlan.png",
    "21: Smith 1965 (S Circle)": "Transparencies/21_SmithSCircle_Geophys.png",
    "22: Stukeley Plan E (S Circle)": "Transparencies/22_StukeleyPlanE.png",
    "23: Aubrey Plan B (S Circle)": "Transparencies/23_AubreyPlanB.png",
    "24: Smith 1965 (N Circle)": "Transparencies/24_SmithNCircle_Geophys.png",
    "25: Aubrey Plan B (N Circle)": "Transparencies/25_AubreyPlanBNCircle.png",
    "26: Aubrey Plan A (N Circle)": "Transparencies/26_AubreyPlanANCircle.png",
    "27: Stukeley Plan E (N Circle)": "Transparencies/27_StukeleyPlanE.png",
};

// Create a container for the image viewer
const imageViewer = document.createElement('div');
imageViewer.id = 'image-viewer';
imageViewer.style.display = 'none';
document.body.appendChild(imageViewer);

// Create close button for the image viewer
const closeButton = document.createElement('button');
closeButton.id = 'close-image-viewer';
closeButton.innerHTML = '&times;';
closeButton.onclick = function() {
    imageViewer.style.display = 'none';
    document.getElementById('map').style.width = '100%';
};
imageViewer.appendChild(closeButton);

// Create image element
const viewerImage = document.createElement('img');
viewerImage.id = 'viewer-image';
imageViewer.appendChild(viewerImage);



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
            label.style.cursor = 'pointer';
        
        // Click for transparency PNG
            label.onclick = function(e) {
                e.stopPropagation();
                
                if (layerImages[name]) {
                    viewerImage.src = layerImages[name];
                    viewerImage.alt = name;
                    imageViewer.style.display = 'block';
                    document.getElementById('map').style.width = '65%';
                }
            };
            
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
    loadGeoJSON('GeoJSONs/c03_KeillerSEQuad.geojson', "03: Keiller SE Quad", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "04: Aubrey Plan A (S Circle)", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "05: Aubrey Plan A (S Circle Enlarged)", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "06: Stukeley Plate 32", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "07: Stukeley Plate 33", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "08: Stukeley Plate 34", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "09: Stukeley Plate 35", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "10: Stukeley Plate 36", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "11: Stukeley Plate 37", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "12: Stukeley Plate 38", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "13: Stukeley Plate 39", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "14: Stukeley Plate 40", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "15: Stukeley Plate 41", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "16: Stukeley Plate 42", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "17: Smith 1965", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "18: Aubrey Plan B", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "19: Stukeley 1722-24b", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "20: Stukeley Plate 15", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "21: Smith 1965 (S Circle)", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "22: Stukeley Plan E (S Circle)", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "23: Aubrey Plan B (S Circle)", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "24: Smith 1965 (N Circle)", "#0000FF"),
    loadGeoJSON('GeoJSONs/_______________________', "25: Aubrey Plan B (N Circle)", "#000000"),
    loadGeoJSON('GeoJSONs/_______________________', "26: Aubrey Plan A (N Circle)", "#ff0000"),
    loadGeoJSON('GeoJSONs/_______________________', "27: Stukeley Plan E (N Circle)", "#0000FF"),
]).then(() => {
    console.log('All GeoJSON layers loaded');
});






// Splash screen interaction
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('accept-splash').addEventListener('click', function() {
        document.getElementById('splash-modal').classList.add('hidden');
        document.getElementById('map').classList.remove('inactive');
    });
});