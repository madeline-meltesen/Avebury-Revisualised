// Set up the map
var mymap = L.map("map").setView([51.4286, -1.8544], 17);

// Add basemaps
var streets = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20
}).addTo(mymap);

var satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        id: "Esri.WorldImagery",
        maxZoom: 19
    }
);

// Create variable for basemaps
var baseLayers = {
    Streets: streets,
    Satellite: satellite
};

// Create menu window for basemap control
var layerControl = L.control
    .layers(
        baseLayers,
        {},
        {
            collapsed: false,
            position: "topright"
        }
    )
    .addTo(mymap);

// Handle window resize events to adjust map size
window.addEventListener("resize", function () {
    mymap.invalidateSize();

    // Also handle the image viewer case
    if (document.getElementById("image-viewer").style.display === "block") {
        document.getElementById("map").style.width = "65%";
    } else {
        document.getElementById("map").style.width = "100%";
    }
});

// Create reset view button
var ZoomOutControl = L.Control.extend({
    options: {
        position: "topleft"
    },
    onAdd: function (map) {
        var button = L.DomUtil.create("button", "custom-button");
        button.title = "Reset view";
        button.onclick = function () {
            map.setView([51.4286, -1.8544], 17);
        };
        return button;
    }
});
new ZoomOutControl().addTo(mymap);

// Create locator (inset) map
var miniMap = new L.Control.MiniMap(
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"),
    {
        toggleDisplay: true,
        position: "bottomright",
        zoomLevelOffset: -6
    }
).addTo(mymap);

// Add a scale bar to the map
L.control
    .scale({
        imperial: true, // Show imperial units (feet/miles)
        metric: true, // Show metric units (meters/kilometers)
        position: "bottomleft"
    })
    .addTo(mymap);

// Create measurement tool
var measureControl = L.control
    .measure({
        position: "topright",
        primaryLengthUnit: "meters",
        secondaryLengthUnit: "kilometers",
        primaryAreaUnit: "sqmeters",
        activeColor: "#3b82f6", // color for active measurement
        completedColor: "#10b981" // color for completed measurement
    })
    .addTo(mymap);

// Create draw tool
var drawnItems = new L.FeatureGroup();
mymap.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    position: "topright",
    draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems
    }
}).addTo(mymap);

// Add separate control for text annotations
function createTextMarker(map) {
    const textMarker = L.marker(map.getCenter(), {
        draggable: true,
        icon: L.divIcon({
            className: "text-annotation",
            html: '<div class="editable-text">Click to edit</div>',
            iconSize: null
        })
    }).addTo(drawnItems);

    const div = () => textMarker.getElement().querySelector(".editable-text");

    const saveGeoJSON = () => {
        const data = drawnItems.toGeoJSON();
        console.log(JSON.stringify(data));
    };

    const enterEditMode = () => {
        const d = div();
        textMarker.editing = true;
        d.contentEditable = true;
        if (d.textContent.trim() === "Click to edit") d.textContent = "";
        d.focus();
        d.onblur = () => {
            textMarker.editing = false;
            d.contentEditable = false;
            saveGeoJSON();
        };
    };

    textMarker.editing = false;

    textMarker.on("click", () => {
        if (!textMarker.editing) enterEditMode();
    });

    textMarker.on("dblclick", (e) => {
        e.originalEvent.stopPropagation();
        enterEditMode();
    });

    textMarker.on("dragend", saveGeoJSON);
}

// Custom control for text annotations
L.Control.TextControl = L.Control.extend({
    options: { position: "topright" },
    onAdd(map) {
        const container = L.DomUtil.create("div", "leaflet-control-text");
        const button = L.DomUtil.create("button", "", container);
        Object.assign(button.style, {
            width: "32px",
            height: "32px",
            fontWeight: "bold",
            cursor: "pointer"
        });
        button.innerHTML = "T";
        button.title = "Add text annotation";
        L.DomEvent.on(button, "click", () => createTextMarker(map));
        return container;
    }
});

new L.Control.TextControl().addTo(mymap);

// Handle drawing events (for regular draw tools)
mymap.on(L.Draw.Event.CREATED, function (e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);

    // Save drawn items to GeoJSON
    var data = drawnItems.toGeoJSON();
    console.log(JSON.stringify(data));
});

// Create PNG export control
var printControl = L.easyPrint({
    title: "Export Map",
    position: "topright",
    exportOnly: true,
    filename: "avebury-map",
    sizeModes: ["Current"]
}).addTo(mymap);

// GeoJSON layer control
var geoJSONControl = L.Control.extend({
    options: {
        position: "topleft"
    },
    onAdd: function (map) {
        var container = L.DomUtil.create("div", "geojson-control");
        container.innerHTML = "<h3>Digitised Plans (click names to open image sidebar)</h3>";
        return container;
    }
});
var geoJSONControlInstance = new geoJSONControl().addTo(mymap);

var geoJSONContainer = geoJSONControlInstance.getContainer();

// Prevent wheel events from propagating to the map when over the control
L.DomEvent.on(geoJSONContainer, "wheel", function (e) {
    // Only stop propagation if we're actually scrolling the control
    if (e.target.closest(".geojson-control")) {
        L.DomEvent.stopPropagation(e);
    }
});

L.DomEvent.disableScrollPropagation(geoJSONContainer);

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
    "27: Stukeley Plan E (N Circle)": "Transparencies/27_StukeleyPlanE.png"
};

// Create a container for the image viewer
const imageViewer = document.createElement("div");
imageViewer.id = "image-viewer";
imageViewer.style.display = "none";
document.body.appendChild(imageViewer);

// Create close button for the image viewer
const closeButton = document.createElement("button");
closeButton.id = "close-image-viewer";
closeButton.innerHTML = "&times;";
closeButton.onclick = function () {
    imageViewer.style.display = "none";
    document.getElementById("map").style.width = "100%";
};
imageViewer.appendChild(closeButton);

// Create image element
const viewerImage = document.createElement("img");
viewerImage.id = "viewer-image";
imageViewer.appendChild(viewerImage);

// Modified function to load GeoJSON and connect to pre-created controls
function loadGeoJSON(url, name, defaultColor, container, addToMap = false) {
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // Create GeoJSON layer
            overlayLayers[name] = L.geoJSON(data, {
                style: {
                    weight: 0,
                    fillColor: defaultColor,
                    fillOpacity: 0.6
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(name);
                }
            });

            // Only add to map if specified
            if (addToMap) {
                mymap.addLayer(overlayLayers[name]);
            }

            // Find the existing container for this layer
            var layerContainer = container.querySelector(`[data-layer-name="${name}"]`);

            // Set up the checkbox
            var checkbox = layerContainer.querySelector(".layer-checkbox");
            checkbox.onchange = function () {
                mymap.hasLayer(overlayLayers[name])
                    ? mymap.removeLayer(overlayLayers[name])
                    : mymap.addLayer(overlayLayers[name]);
            };

            // Set up color picker
            var colorPicker = layerContainer.querySelector(".layer-color");
            colorPicker.oninput = function () {
                overlayLayers[name].setStyle({ fillColor: this.value });
            };

            // Set up opacity slider
            var opacitySlider = layerContainer.querySelector(".opacity-slider");
            opacitySlider.oninput = function () {
                overlayLayers[name].setStyle({ fillOpacity: parseFloat(this.value) });
            };

            return overlayLayers[name];
        })
        .catch((error) => console.error("Error loading GeoJSON:", error));
}

// Function to initialize all layers with controls
function initializeLayers() {
    const container = geoJSONControlInstance.getContainer();

    // First create all control elements in order
    layersToLoad.forEach((layer, index) => {
        // Layer container
        var layerContainer = L.DomUtil.create("div", "layer-item", container);
        layerContainer.dataset.layerName = layer.name;

        // Visibility checkbox - only check first 3 layers
        var checkbox = L.DomUtil.create("input", "layer-checkbox", layerContainer);
        checkbox.type = "checkbox";
        checkbox.checked = index < 3; // This will check only first 3 layers

        // Layer name
        var label = L.DomUtil.create("label", "layer-label", layerContainer);
        label.textContent = layer.name;
        label.htmlFor = "layer-" + layer.name.replace(/\s+/g, "-");
        label.style.cursor = "pointer";

        // Click handler for image viewer
        label.onclick = function (e) {
            e.stopPropagation();
            if (layerImages[layer.name]) {
                viewerImage.src = layerImages[layer.name];
                viewerImage.alt = layer.name;
                imageViewer.style.display = "block";
                document.getElementById("map").style.width = "65%";
            }
        };

        // Color picker
        var colorPicker = L.DomUtil.create("input", "layer-color", layerContainer);
        colorPicker.type = "color";
        colorPicker.value = layer.color;
        colorPicker.title = "Change color";

        // Opacity slider
        var opacityContainer = L.DomUtil.create("div", "opacity-container", layerContainer);
        var opacityLabel = L.DomUtil.create("span", "opacity-label", opacityContainer);
        opacityLabel.textContent = "Opacity:";
        var opacitySlider = L.DomUtil.create("input", "opacity-slider", opacityContainer);
        opacitySlider.type = "range";
        opacitySlider.min = 0;
        opacitySlider.max = 1;
        opacitySlider.step = 0.1;
        opacitySlider.value = 0.6;
        L.DomEvent.on(opacitySlider, "mousedown touchstart click", L.DomEvent.stopPropagation);

        // Divider
        L.DomUtil.create("hr", "layer-divider", container);
    });

    // Then load all layers using Promise.all
    Promise.all(
        layersToLoad.map(
            (layer, index) => loadGeoJSON(layer.url, layer.name, layer.color, container, index < 3) // Pass whether to add to map
        )
    ).then((loadedLayers) => {
        console.log("All GeoJSON layers loaded");
    });
}

// Load all GeoJSON layers
const layersToLoad = [
    { url: "GeoJSONs/c01_AubreyPlanA.geojson", name: "01: Aubrey Plan A", color: "#000000" },
    { url: "GeoJSONs/c02_StukeleyPlanE.geojson", name: "02: Stukeley Plan E", color: "#ff0000" },
    { url: "GeoJSONs/c03_KeillerSEQuad.geojson", name: "03: Keiller SE Quad", color: "#0000FF" },
    { url: "GeoJSONs/c04_AubreySCircle.geojson", name: "04: Aubrey Plan A (S Circle)", color: "#000000" },
    {
        url: "GeoJSONs/c05_AubreySCircleEnlarged.geojson",
        name: "05: Aubrey Plan A (S Circle Enlarged)",
        color: "#ff0000"
    },
    { url: "GeoJSONs/c06_StukeleyPlate32.geojson", name: "06: Stukeley Plate 32", color: "#0000FF" },
    { url: "GeoJSONs/c07_StukeleyPlate33.geojson", name: "07: Stukeley Plate 33", color: "#000000" },
    { url: "GeoJSONs/c08_StukeleyPlate34.geojson", name: "08: Stukeley Plate 34", color: "#ff0000" },
    { url: "GeoJSONs/c09_StukeleyPlate35.geojson", name: "09: Stukeley Plate 35", color: "#0000FF" },
    { url: "GeoJSONs/c10_StukeleyPlate36.geojson", name: "10: Stukeley Plate 36", color: "#000000" },
    { url: "GeoJSONs/c11_StukeleyPlate37.geojson", name: "11: Stukeley Plate 37", color: "#ff0000" },
    { url: "GeoJSONs/c12_StukeleyPlate38.geojson", name: "12: Stukeley Plate 38", color: "#0000FF" },
    { url: "GeoJSONs/c13_StukeleyPlate39.geojson", name: "13: Stukeley Plate 39", color: "#000000" },
    { url: "GeoJSONs/c14_StukeleyPlate40.geojson", name: "14: Stukeley Plate 40", color: "#ff0000" },
    { url: "GeoJSONs/c15_StukeleyPlate41.geojson", name: "15: Stukeley Plate 41", color: "#0000FF" },
    { url: "GeoJSONs/c16_StukeleyPlate42.geojson", name: "16: Stukeley Plate 42", color: "#000000" },
    { url: "GeoJSONs/c17_Smith1965.geojson", name: "17: Smith 1965", color: "#ff0000" },
    { url: "GeoJSONs/c18_AubreyPlanB.geojson", name: "18: Aubrey Plan B", color: "#0000FF" },
    { url: "GeoJSONs/c19_StukeleyTour.geojson", name: "19: Stukeley 1722-24b", color: "#000000" },
    { url: "GeoJSONs/c20_StukeleyMeasuredPlan.geojson", name: "20: Stukeley Plate 15", color: "#ff0000" },
    { url: "GeoJSONs/c21_SmithSCircle_Geophys.geojson", name: "21: Smith 1965 (S Circle)", color: "#0000FF" },
    { url: "GeoJSONs/c22_StukeleyPlanE.geojson", name: "22: Stukeley Plan E (S Circle)", color: "#000000" },
    { url: "GeoJSONs/c23_AubreyPlanB.geojson", name: "23: Aubrey Plan B (S Circle)", color: "#ff0000" },
    { url: "GeoJSONs/c24_SmithNCircle_Geophys.geojson", name: "24: Smith 1965 (N Circle)", color: "#0000FF" },
    { url: "GeoJSONs/c25_AubreyPlanBNCircle.geojson", name: "25: Aubrey Plan B (N Circle)", color: "#000000" },
    { url: "GeoJSONs/c26_AubreyPlanANCircle.geojson", name: "26: Aubrey Plan A (N Circle)", color: "#ff0000" },
    { url: "GeoJSONs/c27_StukeleyPlanE.geojson", name: "27: Stukeley Plan E (N Circle)", color: "#0000FF" }
];

// Initialize all layers with controls
initializeLayers();

// Splash screen interaction
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("accept-splash").addEventListener("click", function () {
        document.getElementById("splash-modal").classList.add("hidden");
        document.getElementById("map").classList.remove("inactive");
    });
});
