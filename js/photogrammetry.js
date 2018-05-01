class IO {
    constructor(f,totpixx,totpixy, name) {
        this.f = f;
        this.cx = totpixx/2;
        this.cy = totpixy/2;
        this.totpixx = totpixx;
        this.totpixy = totpixy;
        this.name = name;
        this.recalc();
    }
    recalc() {
        this.K = [[this.f,0,this.cx],[0,this.f,this.cy],[0,0,1]];
        this.ifov = Math.atan2(1,this.f);
        this.vfov = this.ifov * this.totpixy;
        this.hfov = this.ifov * this.totpixx;
    }
    // SETTERS
    set setf(x) {
        this.f = x;
        this.recalc();
    }
    set setcx(x) {
        this.cx = x;
        this.recalc();
    }
    set setcy(x) {
        this.cy = x;
        this.recalc();
    }
    set settotpixx(x) {
        this.totpixx = x;
        this.recalc();
    }
    set settotpixy(x) {
        this.totpixy = x;
        this.recalc();
    }
}

class EO {
    constructor(lat,lng,Zc,roll,pitch,yaw) {
        this.lat     = lat;
        this.lng     = lng;
        this.Zc     = Zc;
        this.calcUTM();
        this.roll   = roll;
        this.pitch  = pitch;
        this.yaw    = yaw;
        this.calcRT();
        this.projstr = '';
    }
    calcUTM(){
        this.Xc     = L.latLng(this.lat, this.lng).utm().x;
        this.Yc     = L.latLng(this.lat, this.lng).utm().y;
        this.zone   = L.latLng(this.lat, this.lng).utm().zone;
        this.band   = L.latLng(this.lat, this.lng).utm().band;
    }
    calcLL(){
        var ll = calcUTM2LL(this.Xc, this.Yc, this.zone, this.band);
        this.lat = ll.lat;
        this.lng = ll.lng;
    }
    calcRT(){
        var Rx = 0;
        var Ry = 0;
        var Rz = 0;
        var T = 0;
        this.RT = 0;
    }

    // SETTERS
    set setXc(x){
        this.Xc = x;
        this.calcLL();
        this.calcRT();
    }
    set setYc(x){
        this.Yc = x;
        this.calcLL();
        this.calcRT();
    }
    set setZc(x){
        this.Zc = x;
        this.calcRT();
    }
    set setXcYc(xy){
        this.Xc = xy[0];
        this.Yc = xy[1];
        this.calcLL();
        this.calcRT();
    }
    set setXcYcZc(xyz){
        this.Xc = xyz[0];
        this.Yc = xyz[1];
        this.Yc = xyz[2];
        this.calcLL();
        this.calcRT();
    }
    set setLat(x){
        this.lat = x;
        this.calcUTM();
        this.calcRT();
    }
    set setUTMBandZone(bz){
        this.band = bz[0];
        this.zone = bz[1];
        this.calcLL();
    }
    set setLng(x){
        this.lng = x;
        this.calcUTM();
        this.calcRT();
    }
    set setLatLng(ll){
        this.lat = ll[0];
        this.lng = ll[1];
        this.calcUTM();
        this.calcRT();
    }
    set setRoll(x){
        this.roll = x;
        this.calcRT();
    }
    set setRollDeg(x){
        this.roll = deg2rad(x);
        this.calcRT();
    }
    set setPitch(x){
        this.pitch = x;
        this.calcRT();
    }
    set setPitchDeg(x){
        this.pitch = deg2rad(x);
        this.calcRT();
    }
    set setYaw(x){
        this.yaw = x;
        this.calcRT();
    }
    set setYawDeg(x){
        this.yaw = deg2rad(x);
        this.calcRT();
    }
    set setRollPitchYaw(rpy){
        this.roll  = rpy[0];
        this.pitch = rpy[1];
        this.yaw   = rpy[2];
        this.calcRT();
    }
    set setRollPitchYawDeg(rpy){
        this.roll  = deg2rad(rpy[0]);
        this.pitch = deg2rad(rpy[1]);
        this.yaw   = deg2rad(rpy[2]);
        this.calcRT();
    }

    // GETTERS
    get getXYZ(){
        return [this.Xc, this.Yc, this.Zc, this.zone, this.band];
    }
    get getLatLng(){
        return [this.lat, this.lng];
    }
    get getRollPitchYaw(){
        return [this.roll, this.pitch, this.yaw];
    }
    get getRollPitchDeg(){
        return [rad2deg(this.roll), rad2deg(this.pitch), rad2deg(this.yaw)];
    }
}

class Camera {
    constructor(myIO, myEO) {
        this.IO = myIO;
        this.EO = myEO;

        this.calcP();
        this.calccenterpoint();
        this.calcfootprint();
        this.gsdPixelResolution = 0;


        this.uasmarker=new L.marker(this.EO.getLatLng, {draggable: true, icon: L.divIcon({className: 'fa fa-circle'})});
        this.uasmarker.on("drag",this.uasmarkermoved,this);

        this.centermarker=new L.marker(this.centerpoint, {draggable: true, icon: L.divIcon({className: 'fa fa-plus-circle'})});
        this.centermarker.on("drag",this.uastargetmoved,this);

        this.footprintpolygon=new L.Polygon(this.footprint,{color:'orange', weight: 5});
        //this.gsdResolutionPolygons=0;
        //this.cameraHorizonView=0;

    }
    //SETTER
    set setXYZ(xyz){
        this.EO.setXcYcZc(xyz);
    }

    set setLL(latlng){
        this.EO.setLatLng = latlng;
        this.updateAll();
    }

    set setRPYdeg(rpy){
        this.EO.setRollPitchYawDeg = rpy;
        this.updateAll();
    }

    set setIO(val){
        this.IO.setf = val[0];
        this.IO.settotpixx = val[1];
        this.IO.settotpixy = val[2];
    }

    //GETTER
    get getXYZ(){
        return this.EO.getXYZ;
    }

    get getLL(){
        return this.EO.getLatLng;
    }

    get getRPYdeg(){
        return this.EO.getRollPitchDeg;
    }

    // MANUAL MARKER MOVEMENT FUNCTIONS
    uasmarkermoved() {
        // for moved marker
        this.setLL = [this.uasmarker.getLatLng().lat, this.uasmarker.getLatLng().lng];
    }

    uastargetmoved() {
        var x = this.EO.Xc - this.centermarker.getLatLng().utm().x;
        var y = this.EO.Yc - this.centermarker.getLatLng().utm().y;
        var z = this.EO.Zc - 0;

        var rho_phi_theta = cart2sph(x,y,z);

        this.EO.setPitch = rho_phi_theta[2];
        this.EO.setYaw = -rho_phi_theta[1];

        this.updateAll();
    }
    calcAzEl(pixx,pixy){
        var fullP = this.P.slice(0);
        fullP.push([0, 0, 0, 1]);
        var iP = math.inv(fullP);
        var uvs1 = [pixx,pixy,1,1];
        var xyz1 = math.multiply(iP,uvs1);
        var XcYcZc = this.getXYZ;
        var xyz_norm = math.add(xyz1,[-XcYcZc[0],-XcYcZc[1],-XcYcZc[2], -1]);

        var rho_phi_theta = cart2sph(xyz_norm[0],xyz_norm[1],xyz_norm[2]);

        return [-rho_phi_theta[1], rho_phi_theta[2]];
    }
    // CALC FUNCTIONS
    calcCornerPixHorizonTrim() {
        // determine angle to not go over
        console.log('NEW CAMERA ORIENTATION');

        var MAX_D = 1500;
        var horizonangle = Math.atan(MAX_D/this.EO.Zc);

        // [ 4       1 ]
        // |           | Pixel corners in this order
        // |           |
        // [ 3       2 ]

        var pix_of_corners = [[this.IO.totpixx, this.IO.totpixy],
            [this.IO.totpixx, 1],
            [1, 1],
            [1, this.IO.totpixy]];

        var azel_of_corners = Array(4);

        var i;
        for(i=0;i<4;i++){
            azel_of_corners[i] = this.calcAzEl(pix_of_corners[i][0],pix_of_corners[i][1]);
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
            if(T>0 && T<1)
            {
                console.log('Break Between: ' + i.toString() + ' - ' + (i+2).toString())
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
        console.log(cornerpixraw);
        console.log(cornerpixfinal);

        var goodpixels = Array();
        for(i=0;i<8;i++){
            if (cornerpixfinal[i][0]==1 && cornerpixfinal[i][2]<=horizonangle) {
                var goodpixelcoords = [cornerpixfinal[i][3], cornerpixfinal[i][4]];
                goodpixels.push(goodpixelcoords);
            }
        }


        var goodpixels = [[this.IO.totpixx, 1],
                      [this.IO.totpixx, this.IO.totpixy],
                      [1, this.IO.totpixy],
                      [1, 1]];

        return goodpixels;
    }

    calcfootprint() {
        var band = this.EO.band;
        var zone = this.EO.zone;

        var footprintpixels = this.calcCornerPixHorizonTrim();

        var i;
        var LLcorners = Array();
        for(i=0;i<footprintpixels.length;i++){
            var Putm = uv2xyconstz(footprintpixels[i][0],footprintpixels[i][1],this.P);
            console.log(Putm);
            LLcorners.push(calcUTM2LL(Putm[0],Putm[1],zone,band));
        }

        var P1utm = uv2xyconstz(1,1,this.P);
        var P2utm = uv2xyconstz(this.IO.totpixx,1,this.P);
        var P3utm = uv2xyconstz(this.IO.totpixx,this.IO.totpixy,this.P);
        var P4utm = uv2xyconstz(1,this.IO.totpixy,this.P);

        var P1LL = calcUTM2LL(P1utm[0],P1utm[1],zone,band);
        var P2LL = calcUTM2LL(P2utm[0],P2utm[1],zone,band);
        var P3LL = calcUTM2LL(P3utm[0],P3utm[1],zone,band);
        var P4LL = calcUTM2LL(P4utm[0],P4utm[1],zone,band);

        this.footprint = LLcorners;
    }

    calccenterpoint() {
        var utmcenterpoint = uv2xyconstz(this.IO.cx,this.IO.cy,this.P);
        this.centerpoint = calcUTM2LL(utmcenterpoint[0],utmcenterpoint[1],this.EO.zone, this.EO.band);
    }

    calcP() {
        var P1 = [this.IO.f*(Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) + Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)) - this.IO.cx*(Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) - Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)),
            this.IO.cx*(Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)) - this.IO.f*(Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) - Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)),
            - this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll) - this.IO.f*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll),
            this.EO.Zc*(this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll) + this.IO.f*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)) + this.EO.Xc*(this.IO.cx*(Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) - Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)) - this.IO.f*(Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) + Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw))) - this.EO.Yc*(this.IO.cx*(Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)) - this.IO.f*(Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) - Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)))];
        var P2 = [- this.IO.cy*(Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) - Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)) - this.IO.f*Math.cos(this.EO.pitch)*Math.sin(this.EO.yaw),
            this.IO.cy*(Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)) - this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw),
            - this.IO.f*Math.sin(this.EO.pitch) - this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll),
            this.EO.Zc*(this.IO.f*Math.sin(this.EO.pitch) + this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)) - this.EO.Yc*(this.IO.cy*(Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)) - this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)) + this.EO.Xc*(this.IO.cy*(Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) - Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)) + this.IO.f*Math.cos(this.EO.pitch)*Math.sin(this.EO.yaw))];
        var P3 = [Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw) - Math.cos(this.EO.yaw)*Math.sin(this.EO.roll),
            Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch),
            -Math.cos(this.EO.pitch)*Math.cos(this.EO.roll),
            this.EO.Xc*(Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) - Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)) - this.EO.Yc*(Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) + Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)) + this.EO.Zc*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)];
        this.P = [P1,P2,P3];
    }
    // UPDATE Plotting FUNCTIONS
    addtomap(mapname){
        this.centermarker.addTo(mapname);
        this.uasmarker.addTo(mapname);
        this.footprintpolygon.addTo(mapname);
    }
    updateUasMarker() {
        this.uasmarker.setLatLng([this.EO.lat,this.EO.lng]);
        this.uasmarker.update();
    }

    updateCenterMarker(){
        this.calccenterpoint();
        this.centermarker.setLatLng(this.centerpoint);
        this.centermarker.update();
    }

    updateFootprintPolygon(){
        this.calcfootprint();
        this.footprintpolygon.setLatLngs(this.footprint);
        this.footprintpolygon.redraw();
    }

    updateCameraHorizonView(){
        return 0;
    }

    updateGsdResolutionPolygons(){
        return 0;
    }

    updateAll(){
        this.calcP();
        this.calcfootprint();
        this.updateUasMarker();
        this.updateCenterMarker();
        this.updateFootprintPolygon();
        this.updateCameraHorizonView();
        this.updateGsdResolutionPolygons();
    }
}

function uv2xyconstz(pixx,pixy,P){
    //assumes Zw = 0;
    var Xw = (P[0][1]*P[1][3] - P[0][3]*P[1][1] - P[0][1]*P[2][3]*pixy + P[0][3]*P[2][1]*pixy + P[1][1]*P[2][3]*pixx - P[1][3]*P[2][1]*pixx)/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);
    var Yw = -(P[0][0]*P[1][3] - P[0][3]*P[1][0] - P[0][0]*P[2][3]*pixy + P[0][3]*P[2][0]*pixy + P[1][0]*P[2][3]*pixx - P[1][3]*P[2][0]*pixx)/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);
    var s = (P[0][0]*P[1][1]*P[2][3] - P[0][0]*P[1][3]*P[2][1] - P[0][1]*P[1][0]*P[2][3] + P[0][1]*P[1][3]*P[2][0] + P[0][3]*P[1][0]*P[2][1] - P[0][3]*P[1][1]*P[2][0])/(P[0][0]*P[1][1] - P[0][1]*P[1][0] - P[0][0]*P[2][1]*pixy + P[0][1]*P[2][0]*pixy + P[1][0]*P[2][1]*pixx - P[1][1]*P[2][0]*pixx);

    return [Xw, Yw, s];
}

function xyz2uvs(x,y,z,P){

}


function calcUTM2LL(x,y,zone,band){
    return L.utm({x: x, y: y, zone: zone, band: band}).latLng();
}

function calcLL2UTM(lat,lng){
    return L.latLng(lat, lng).utm();
}
function rad2deg(x){
    return x*180/Math.PI;
}
function deg2rad(x){
    return x*Math.PI/180;
}

function cart2sph(x,y,z){
    var rho = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    var phi = Math.atan2(y, x) + Math.PI / 2;
    var theta = Math.acos(z / rho);
    return [rho,phi,theta];

}