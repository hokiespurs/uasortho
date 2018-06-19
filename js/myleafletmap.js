var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
    maxNativeZoom: 19,
    maxZoom: 23
});

var arcgis = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
    maxNativeZoom: 21,
    maxZoom: 23
});

var mymap = L.map('mapid', {
    center: [44.566142496389155, -123.273],
    zoom: 18,
    maxZoom: 23,
    detectRetina: true, // detect whether the sceen is high resolution or not.
    attributionControl: false,
    zoomControl: false,
    layers: [osm, arcgis]
});

var baseMaps = {
    "Satellite": arcgis,
    "Open Street Map": osm
};

L.control.layers(baseMaps).addTo(mymap);

// Add OpenStreetMap tile layer to map element
//L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

// add Camera
var myCamera = new Camera(
    new IO(4000,4000,3000,'test'),
    new EO(44.566142496389155, -123.2718586921692, 120, 0*Math.PI/180, 40*Math.PI/180, 270*Math.PI/180));

myCamera.addtomap(mymap);

var cursor = {lat:0, lon:0};
mymap.addEventListener('mousemove', function(ev) {
    cursor.lat = ev.latlng.lat;
    cursor.lon = ev.latlng.lng;
    updatecursorpos();
});
function updatecursorpos(){
    var str='';
    if (validproj4){
        try {
            var xy = proj4(leafletproj, projTo, [cursor.lon, cursor.lat]);
            str = "X: " + numberWithCommas(xy[0].toFixed(1)) + " Y: " + numberWithCommas(xy[1].toFixed(1));

            str = str + "<br>";
        }
        catch {
            console.log('proj4 error in update cursor()');
            // sometimes and error is thrown while things are loading
        }
    }
    str = str + "Lon: " + deg_to_dms(cursor.lon) + " Lat: " + deg_to_dms(cursor.lat);
    $('#cursorBox').html(str);
}

function movecamerahere(){
    myCamera.EO.lat = mymap.getCenter().lat;
    myCamera.EO.lng = mymap.getCenter().lng;

    myCamera.EO.calcUTM();
    myCamera.EO.calcRT();

    myCamera.updateAll();

    updateSettings();
}

function flytocamera(){
    mymap.setView([myCamera.EO.lat,myCamera.EO.lng]);
}