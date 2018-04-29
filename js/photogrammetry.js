class IO {
    constructor(f,totpixx,totpixy) {
        this.f = f;
        this.cx = totpixx/2;
        this.cy = totpixy/2;
        this.totpixx = totpixx;
        this.totpixy = totpixy;
    }
}
class EO {
    constructor(lat,lon,alt,roll,pitch,yaw) {
        this.lat    = lat;
        this.lon    = lon;
        this.Zc     = alt;
        this.calcUTM();
        this.roll   = roll;
        this.pitch  = pitch;
        this.yaw    = yaw;
    }
    calcUTM(){
        this.Xc     = L.latLng(this.lat, this.lon).utm().x;
        this.Yc     = L.latLng(this.lat, this.lon).utm().y;
        this.zone   = L.latLng(this.lat, this.lon).utm().zone;
        this.band   = L.latLng(this.lat, this.lon).utm().band;
    }
}
class Camera {
    constructor(iIO, iEO) {
        this.IO = iIO;
        this.EO = iEO;

        this.centerpoint = this.calcCenterPoint();
        this.footprint = this.calcfootprint();

        this.uasmarker = new L.Marker([iEO.lat, iEO.lon],{icon: uasicon, draggable: true});
        this.uasmarker.on("drag",this.updateEO,this);

        this.centermarker = new L.Marker(this.centerpoint,{icon: crosshairicon, draggable: true});
        this.centermarker.on("drag",this.updateEOPitchYaw,this);

        this.footprintpolygon = new L.Polygon(this.footprint,{
            color: 'orange',
            weight: 5
        });
    }

    // redrawfootprint
    // redrawmarker

    updateEO(){
        this.EO.lat = this.uasmarker.getLatLng().lat;
        this.EO.lon = this.uasmarker.getLatLng().lng;
        this.EO.calcUTM();
        this.redraw();
    }
    updateEOPitchYaw() {
        var x = this.EO.Xc - this.centermarker.getLatLng().utm().x;
        var y = this.EO.Yc - this.centermarker.getLatLng().utm().y;
        var z = this.EO.Zc - 0;

        var rho = Math.sqrt(x**2 + y**2 + z**2);
        var phi = Math.atan2(y, x) + Math.PI/2;
        var theta = Math.acos(z/rho);

        this.EO.roll = theta + Math.PI;
        this.EO.yaw = phi;
        updateInputFields();
        this.redraw();

    }
    // Methods
    addtomap(mapname) {
        this.centermarker.addTo(mapname);
        this.uasmarker.addTo(mapname);
        this.footprintpolygon.addTo(mapname);
    }
    redraw() {
        this.redrawmarkers();
        this.redrawfootprint();
    }
    redrawmarkers() {
        this.uasmarker.setLatLng([this.EO.lat,this.EO.lon]);
        this.uasmarker.update();

        this.centerpoint = this.calcCenterPoint();
        this.centermarker.setLatLng(this.centerpoint);
        this.centermarker.update();
    }
    redrawfootprint() {
        this.footprint = this.calcfootprint();
        this.footprintpolygon.setLatLngs(this.footprint);
        this.footprintpolygon.redraw();
    }

    calcfootprint() {
        var MAX_D = 5000;
        // Calc Pixel corners
        var horizonangle = Math.atan(MAX_D/this.EO.Zc);
        var ifov = Math.atan2(1,this.IO.f);
        var vfov = ifov * this.IO.totpixy;
        var hfov = ifov * this.IO.totpixx;

        var pix_of_corners = [[this.IO.totpixx, this.IO.totpixy],
            [this.IO.totpixx, 1],
            [1, 1],
            [1, this.IO.totpixy]];

        var az_center = this.EO.yaw;
        var el_center = this.EO.roll + Math.PI;
        while (el_center>(2*Math.PI)){
            el_center = el_center - 2 * Math.PI;
        }
        var cornerazel =  [[hfov/2,  vfov/2],
                       [hfov/2, -vfov/2],
                       [-hfov/2, -vfov/2],
                       [-hfov/2,  vfov/2]];

        var R = [[Math.cos(this.EO.pitch), -Math.sin(this.EO.pitch)], [Math.sin(this.EO.pitch), Math.cos(this.EO.pitch)]];

        var rotazel = math.multiply(cornerazel, R);
        var i;
        var azel_of_corners = Array(4);

        for(i=0;i<4;i++){
            var newazel = [math.add(rotazel[i][0],az_center), math.add(rotazel[i][1],el_center)];
            azel_of_corners[i] = newazel;
        }

        var cornerpixraw = Array(8);
        var cornerpixfinal = Array(8);
        for(i=0;i<4;i++){
            var val = [1, azel_of_corners[i][0], azel_of_corners[i][1], pix_of_corners[i][0],pix_of_corners[i][1]];
            cornerpixraw[2*i] = val;
            cornerpixraw[2*i+1] = [0, 0, 0, 0, 0];
            cornerpixfinal[2*i] = val;
            cornerpixfinal[2*i+1] = [0, 0, 0, 0, 0];
        }

        for(i=0;i<7;i+=2){
            var i1 = i;
            var i2 = i+2;
            if(i2>7) {
                i2 = 0;
            }
            var az1 = cornerpixraw[i1][1];
            var el1 = cornerpixraw[i1][2];
            var az2 = cornerpixraw[i2][1];
            var el2 = cornerpixraw[i2][2];

            var T = (horizonangle-el1)/(el2-el1);
            console.log(T);
            if(T>0 && T<1)
            {
                if (el1 > el2){
                    cornerpixfinal[i1]=[0, 0, 0, 0, 0];
                }
                else {
                    cornerpixfinal[i2]=[0, 0, 0, 0, 0];
                }
                var x1 = cornerpixraw[i1][3];
                var y1 = cornerpixraw[i1][4];
                var x2 = cornerpixraw[i2][3];
                var y2 = cornerpixraw[i2][4];

                var seg_xpix = x1 + (x2 - x1) * T;
                var seg_ypix = y1 + (y2 - y1) * T;
                var seg_az = az1 + (az2 - az1) * T;
                var seg_el = el1 + (el2 - el1) * T;
                cornerpixfinal[i1+1] = [1, seg_az, seg_el, seg_xpix, seg_ypix];
            }
        }

        var finalcoords = Array();
        console.log('NEW CAMERA ORIENTATION')
        for(i=0;i<8;i++){
            if (cornerpixfinal[i][0]==1 && cornerpixfinal[i][2]<=horizonangle) {
                var goodpixelcoords = [cornerpixfinal[i][3],this.IO.totpixy - cornerpixfinal[i][4]];
                console.log(goodpixelcoords);
                finalcoords.push(this.calcutm2ll(this.calcSpaceIntersection(goodpixelcoords[0], goodpixelcoords[1])));
            }
        }

        return finalcoords;
    }
    calcCenterPoint() {
        return this.calcutm2ll(this.calcSpaceIntersection(this.IO.cx, this.IO.cy));
    }
    calcSpaceIntersection(pixx, pixy) {

        var Xw = -(this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw) - this.EO.Xc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw) + this.EO.Xc*this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll)**2 + this.EO.Zc*this.IO.cy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Xc*pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll)**2 - this.EO.Zc*pixy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) + this.EO.Xc*this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.cy*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.cos(this.EO.pitch)**2*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Zc*pixy*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.EO.Xc*pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - this.EO.Xc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - this.EO.Xc*this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.EO.Xc*pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.EO.Xc*pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - this.EO.Xc*this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.EO.Xc*pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.f*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch) - this.EO.Zc*this.IO.cy*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll) + this.EO.Zc*pixy*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll))/(this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2);

        var Yw = (this.EO.Zc*this.IO.cy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) + this.EO.Yc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.EO.Zc*pixy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) - this.EO.Yc*this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.cy*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2 + this.EO.Yc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.f*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) + this.EO.Yc*pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.sin(this.EO.yaw) - this.EO.Zc*pixy*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2 - this.EO.Yc*this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.roll) + this.EO.Yc*pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Yc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - this.EO.Yc*pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.EO.Yc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.EO.Yc*this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - this.EO.Yc*pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - this.EO.Yc*pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.EO.Yc*this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - this.EO.Yc*pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - this.EO.Zc*this.IO.f*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.cy*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Zc*pixy*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw))/(this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2);

        return [Xw, Yw];
    }

    calcutm2ll(xy) {
        var coordLatLng = L.utm({x: xy[0], y: xy[1], zone: this.EO.zone, band: this.EO.band}).latLng();
        if (coordLatLng!=null) {
            return [coordLatLng.lat, coordLatLng.lng];
        }
        return [0, 0]
    }
    // uv2gsd
}