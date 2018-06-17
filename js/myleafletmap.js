// Create variable to hold map element, give initial settings to map
var grayscale = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
    esri   = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');


var mymap = L.map('mapid', {
    center: [44.56576, -123.27888],
    zoom: 16,
    detectRetina: true, // detect whether the sceen is high resolution or not.
    attributionControl: false,
    zoomControl: false,
    layers: [grayscale, esri]
});

var baseMaps = {
    "Grayscale": grayscale,
    "ESRI World": esri
};

L.control.layers(baseMaps).addTo(mymap);

// Add OpenStreetMap tile layer to map element
//L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

// add Camera
var myCamera = new Camera(
    new IO(4000,4000,3000,'test'),
    new EO(44.566142496389155, -123.2718586921692, 120, 0*Math.PI/180, 60*Math.PI/180, 270*Math.PI/180));

myCamera.addtomap(mymap);

var cursor = {lat:0, lon:0};
mymap.addEventListener('mousemove', function(ev) {
    cursor.lat = ev.latlng.lat;
    cursor.lon = ev.latlng.lng;
    updatecursorpos();
});