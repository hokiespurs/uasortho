// Create variable to hold map element, give initial settings to map
var mymap = L.map('mapid', {
    center: [44.56576, -123.27888],
    zoom: 14,
    detectRetina: true, // detect whether the sceen is high resolution or not.
    attributionControl: false,
    zoomControl: false
});

// Add OpenStreetMap tile layer to map element
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

// add Camera
var myCamera = new Camera(
    new IO(4000,4000,3000,'test'),
    new EO(44.56738, -123.27484, 200, 30*Math.PI/180, 50*Math.PI/180, 0));

myCamera.addtomap(mymap);