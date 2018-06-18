function stampFootprint(){
    var LL1 = myCamera.calcLLpt(myCamera.IO.cx*2, 0.5);
    var LL2 = myCamera.calcLLpt(myCamera.IO.cx*2, myCamera.IO.cy*2);
    var LL3 = myCamera.calcLLpt(0.5, myCamera.IO.cy*2);
    var LL4 = myCamera.calcLLpt(0.5, 0.5);
    var coords = [LL1, LL2, LL3, LL4];

    var polygon = new L.Polygon(coords, {color: 'cyan', weight: 1});
    polygon.setStyle({color: $('#colorFootprintLine').val()});
    polygon.setStyle({fillColor: $('#colorFootprintFill').val()});
    polygon.setStyle({weight: $('#lineWeight').val()});
    polygon.setStyle({fillOpacity: $('#fillOpacity').val()});

    let markerLL = myCamera.EO.getLatLng;
    var marker = new L.marker(markerLL, {
        icon: L.divIcon({
            html: '<i class="fas fa-stop-circle"></i>',
            iconSize: [10, 10],
            className: 'stampcamera'
        }),
        zIndexOffset: -1000
    });

    // make popup text
    var currentval = parseFloat($('#camselect').val());
    if (currentval == ncams) {
        camname = 'Custom';
    }
    else {
        camname = cameras[currentval].name;
    }

    let popupstr = "<table border=\"1\" style='width:100%'";

    popupstr = popupstr + "<tr><td>Camera: </td><td align=\"right\">" + camname + "</td></tr>";
    if (validproj4) {
        let xy = proj4(leafletproj, projTo, [myCamera.EO.lng, myCamera.EO.lat]);
        var curproj = parseFloat($('#projselect').val())
        var projname = projections[curproj].name;
        popupstr = popupstr + "<tr><td>Projection: </td><td align=\"right\">" + projname + "</td></tr>";

        popupstr = popupstr + "<tr><td>X: </td><td align=\"right\">" + numberWithCommas(xy[0].toFixed(1)) + "</td></tr>";
        popupstr = popupstr + "<tr><td>Y: </td><td align=\"right\">" + numberWithCommas(xy[1].toFixed(1)) + "</td></tr>";
    }
    else {
        popupstr = popupstr + "<tr><td>Projection: </td><td align=\"right\">WGS84</td></tr>";

        popupstr = popupstr + "<tr><td>Longitude: </td><td align=\"right\">" + deg_to_dms(markerLL[1]) + "</td></tr>";
        popupstr = popupstr + "<tr><td>Latitude: </td><td align=\"right\">" + deg_to_dms(markerLL[0]) + "</td></tr>";
    }
    popupstr = popupstr + "<tr><td>Z: </td><td align=\"right\">" + myCamera.EO.Zc.toFixed(2) + "m</td></tr>";

    popupstr = popupstr + "<tr><td>Roll: </td><td align=\"right\">" + (myCamera.EO.roll * 180/ Math.PI).toFixed(2) + "&#176;</td></tr>";
    popupstr = popupstr + "<tr><td>Pitch: </td><td align=\"right\">" + (myCamera.EO.pitch * 180/ Math.PI).toFixed(2) + "&#176;</td></tr>";
    var myYaw = myCamera.EO.yaw * 180/ Math.PI;
    if (myYaw<0){myYaw = myYaw + 360;}
    popupstr = popupstr + "<tr><td>Yaw: </td><td align=\"right\">" + myYaw.toFixed(2) + "&#176;</td></tr>";

    popupstr = popupstr + "</table>";

    let popup = L.popup({
        closeOnClick: false,
        autoClose: false
    }).setContent(popupstr);

    polygon.bindPopup(popup);

    let stampGroup = L.layerGroup([polygon, marker]);

    stampGroup.addTo(mymap);
    marker._icon.style.color = $('#colorCamera').val();

    polygon.originalcolor = $('#colorFootprintLine').val();
    polygon.originalweight = $('#lineWeight').val();

    polygon.on({
        mouseover: highlightfeature,
        mouseout: resethighlight
    });

    return stampGroup
}

function highlightfeature(e){
    var layer = e.target;
    layer.setStyle({
        //color: 'magenta',
        weight: layer.originalweight*1.5,
    })
}

function resethighlight(e){
    var layer = e.target;
    layer.setStyle({
        //color: layer.originalcolor,
        weight: layer.originalweight
    })
}
function dostamp(){
    allStamps.push(stampFootprint());
}
function clearstamps(){
    for(var i=0;i<allStamps.length;i++){
        mymap.removeLayer(allStamps[i])
    }
    allStamps.length=0;
}