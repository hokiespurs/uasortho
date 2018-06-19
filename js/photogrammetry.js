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


        this.uasmarker=new L.marker(this.EO.getLatLng, {
            draggable: true,
            icon: L.divIcon({
                html: '<i class="fa fa-circle"></i>',
                iconSize: [20, 20],
                className: 'camera'
            })
        });
        this.uasmarker.on("drag",this.uasmarkermoved,this);

        this.uasmarker.on("dragstart",function(e){
            this.NYhold = this.NY;
            this.NY = 0;
        },this);
        this.uasmarker.on("dragend",function(e){
            this.NY = this.NYhold;
            this.redoPolygons();
            this.colorPolygons();
        },this);

        this.centermarker=new L.marker(this.centerpoint, {
            draggable: true,
            icon: L.divIcon({
                html: '<i class="fa fa-plus"></i>',
                iconSize: [20, 20],
                className: 'target'
            })
        });
        this.centermarker.on("drag",this.uastargetmoved,this);
        this.centermarker.on("dragstart",function(e){
            this.NYhold = this.NY;
            this.NY = 0;
        },this);
        this.centermarker.on("dragend",function(e){
            this.NY = this.NYhold;
            this.redoPolygons();
            this.colorPolygons();
        },this);

        this.footprintpolygon=new L.Polygon(this.footprint,{color:'#5cb85c', weight: 5});

        this.NY = 9;
        this.NYhold = 9;
        this.gsdpix = 100;

        this.scalar = Array();
        this.scalar.minval = 0;
        this.scalar.maxval = 1;
        this.scalar.scalarfield = 'gsdy';
        this.scalar.cmap2use = 'jet';
        this.scalar.opacity = 0.75;
        this.gsdpolygons = this.makeGSDpolygons(9,100);


        this.calcGSDscalar();
        //this.gsdResolutionPolygons=0;
        //this.cameraHorizonView=0;

    }
    //SETTER
    set setgsdNY(NY){
        this.NY = NY;
        this.redoPolygons();
        this.colorPolygons();
    }
    set setgsdPix(pix){
        this.gsdpix = pix;
        this.redoPolygons();
        this.colorPolygons();
    }
    set setgsdminmax(minmax){
        this.scalar.minval = minmax[0];
        this.scalar.maxval = minmax[1];
        this.colorPolygons();
    }
    set setgsdcmap(cmap2use){
        this.scalar.cmap2use = cmap2use;
        this.colorPolygons();
    }
    set setgsdscalar(scalar2use){
        this.scalar.scalarfield = scalar2use;
        this.colorPolygons();
    }
    set setgsdopacity(opacity2use){
        this.scalar.opacity = opacity2use;
        this.colorPolygons();
    }
    set setXYZ(xyz){
        this.EO.setXcYcZc(xyz);
        this.updateAll();
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
        this.EO.setRoll = 0;

        this.updateAll();
    }
    calcEl(pixx,pixy){
        var fullP = this.P.slice(0);
        var iP = math.inv([[fullP[0][0], fullP[0][1], fullP[0][2]],
                           [fullP[1][0], fullP[1][1], fullP[1][2]],
                           [fullP[2][0], fullP[2][1], fullP[2][2]]]);
        var uvs1 = [pixx,pixy,1];
        var xyz1 = math.multiply(iP,uvs1);

        var r = Math.sqrt((xyz1[0])**2+(xyz1[1])**2);
        var el = Math.PI/2 + Math.atan2(xyz1[2],r);

        return el;
    }
    calcSegmentInterp(pix1, pix2, el1, el2, horizonangle, pixellist){
        // TODO FIX THIS CLUNKY CODE

        // Null Case: both points are above the horizon angle
        if (el1>=horizonangle && el2>=horizonangle){return pixellist;}

        // If first below horizon, push that point to pixellist
        if (el1<horizonangle){
            pixellist.push(pix1);
            if (el2<horizonangle) {return pixellist;}
        }

        // Interpolate along segment
         // find whether xpix or ypix are varying
        var xvarying = false;
        if (pix1[1]==pix2[1]){xvarying=true;}
        // interpolate
        var T = (horizonangle-el1)/(el2-el1);
        if (xvarying){
            var ypix = pix1[1];
            var xpix = pix1[0] + (pix2[0] - pix1[0]) * T;
        }
        else {
            var xpix = pix1[0];
            var ypix = pix1[1] + (pix2[1] - pix1[1]) * T;
        }
        if (this.calcEl(xpix,ypix)>horizonangle){
            el2 = this.calcEl(xpix,ypix);
            pix2 = [xpix, ypix];
            T = (horizonangle-el1)/(el2-el1);
            if (xvarying){
                ypix = pix1[1];
                xpix = pix1[0] + (pix2[0] - pix1[0]) * T;
            }
            else {
                xpix = pix1[0];
                ypix = pix1[1] + (pix2[1] - pix1[1]) * T;
            }
        }
        pixellist.push([xpix, ypix]);

        return pixellist;
    }
    // CALC FUNCTIONS
    calcCornerPixHorizonTrim() {
        // determine angle to not go over

        let horizonangle = 89*Math.PI/180;
        // [ 4       1 ]
        // |           | Pixel corners in this order
        // |           |
        // [ 3       2 ]

        var pix_of_corners = [[this.IO.totpixx+0.5, 0.5],
            [this.IO.totpixx+0.5, this.IO.totpixy+0.5],
            [0.5, this.IO.totpixy+0.5],
            [0.5, 0.5]];

        var el_of_corners = Array(4);

        var i;
        for(i=0;i<4;i++){
            el_of_corners[i] = this.calcEl(pix_of_corners[i][0],pix_of_corners[i][1]);
        }

        var pixellist = Array();
        for(i=0;i<4;i++){
            var i1 = i;
            var i2 = i+1;if (i2==4){i2=0;}
            pixellist = this.calcSegmentInterp(pix_of_corners[i],pix_of_corners[i2],el_of_corners[i1],el_of_corners[i2],horizonangle,pixellist);
        }

        return pixellist;
    }

    calcLLpt(pixx,pixy) {
        var xys = uv2xyconstz(pixx,pixy,this.P);
        if (xys[2]>0) {
            var LL = calcUTM2LL(xys[0],xys[1],this.EO.zone,this.EO.band);
            if (LL==null){LL=[0,0];}
            return LL;
        }
        return [0,0];
    }

    calcfootprint() {
        var band = this.EO.band;
        var zone = this.EO.zone;

        var footprintpixels = this.calcCornerPixHorizonTrim();

        if (footprintpixels.length==0){
            return([[0,0],[0,0],[0,0],[0,0]])
        }

        var i;
        var LLcorners = Array();
        for(i=0;i<footprintpixels.length;i++){
            var Putm = uv2xyconstz(footprintpixels[i][0],footprintpixels[i][1],this.P);
            LLcorners.push(calcUTM2LL(Putm[0],Putm[1],zone,band));
        }

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
        for(var i=0;i<this.gsdpolygons.length;i++){
            this.gsdpolygons[i].addTo(mapname);
        }
        this.colorPolygons();
        this.mapname = mapname;
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

    sameK(K){
        var isgood = true;
        isgood = isgood && K[0][0]===this.IO.K[0][0];
        isgood = isgood && K[0][2]===this.IO.K[0][2];
        isgood = isgood && K[1][2]===this.IO.K[1][2];

        return isgood
    }
    redoPolygons(){
        // remove polygons from map
        for(var i=0;i<this.gsdpolygons.length;i++){
            this.mapname.removeLayer(this.gsdpolygons[i]);
        }
        this.gsdpolygons.length = 0;
        // make new polygons
        let NY = this.gsdpolygons.NY;
        let pixplot = this.gsdpolygons.pixplot;
        this.gsdpolygons = this.makeGSDpolygons(this.NY,this.gsdpix);
        // add them to map
        for(var i=0;i<this.gsdpolygons.length;i++){
            this.gsdpolygons[i].addTo(this.mapname);
        }
        this.calcGSDscalar();
    }

    updateGsdResolutionPolygons(){
        // determine if needs redoing

        if (!this.sameK(this.gsdpolygons.K) || this.gsdpolygons.NY !== this.NY || this.gsdpolygons.pixplot !== this.gsdpix) {
            this.redoPolygons();
        }

        var padval = this.gsdpolygons.padval;
        for (var i = 0; i < this.gsdpolygons.length; i++) {
            var xpix = this.gsdpolygons[i].xpix;
            var ypix = this.gsdpolygons[i].ypix;
            this.gsdpolygons[i].setLatLngs(this.getCoords(xpix, ypix, padval));
            this.gsdpolygons[i].redraw();
            this.calcGSDscalar();
        }
        this.colorPolygons();
    }

    updateAll(){
        this.calcP();
        this.calcfootprint();
        this.updateUasMarker();
        this.updateCenterMarker();
        this.updateFootprintPolygon();
        this.updateGsdResolutionPolygons();
        updateSettings();
    }
    colorPolygons(){
        for(var i=0;i<this.gsdpolygons.length;i++){

            var val;
            var mycolor;
            var myopacity = this.scalar.opacity;
            if (this.scalar.scalarfield === 'gsdx'){
                val = this.gsdpolygons[i].scalars.gsdx;
                mycolor = colorval(val,this.scalar.minval,this.scalar.maxval,this.scalar.cmap2use);
            }
            else if (this.scalar.scalarfield === 'gsdy'){
                val = this.gsdpolygons[i].scalars.gsdy;
                mycolor = colorval(val,this.scalar.minval,this.scalar.maxval,this.scalar.cmap2use);
            }
            else if (this.scalar.scalarfield === 'stretch'){
                val = this.gsdpolygons[i].scalars.stretch;
                mycolor = colorval(val,this.scalar.minval,this.scalar.maxval,this.scalar.cmap2use);
            }
            else {
                mycolor = '#000000';
            }


            this.gsdpolygons[i].setStyle({fillColor: mycolor, fillOpacity: myopacity});

        }
    }
    calcGSDscalar(){
        // [ 4       1 ]
        // |           | Pixel corners in this order
        // |           |
        // [ 3       2 ]
        let padval = this.gsdpolygons.padval;
        for (var i = 0; i < this.gsdpolygons.length; i++) {
            var xpix = this.gsdpolygons[i].xpix;
            var ypix = this.gsdpolygons[i].ypix;

            var XY1 = uv2xyconstz(xpix + padval + 0.5, ypix - padval - 0.5, this.P);
            var XY2 = uv2xyconstz(xpix + padval + 0.5, ypix + padval + 0.5, this.P);
            var XY3 = uv2xyconstz(xpix - padval - 0.5, ypix + padval + 0.5, this.P);
            var XY4 = uv2xyconstz(xpix - padval - 0.5, ypix - padval - 0.5, this.P);

            this.gsdpolygons[i].scalars = Array();

            let gsdx = Math.max(calcDist(XY1,XY4),calcDist(XY2,XY3)) / (1 + 2 * padval);
            let gsdy = Math.max(calcDist(XY1,XY2),calcDist(XY3,XY4)) / (1 + 2 * padval);
            let stretch = Math.max(gsdx/gsdy, gsdy/gsdx);

            this.gsdpolygons[i].scalars.gsdx    = gsdx;
            this.gsdpolygons[i].scalars.gsdy    = gsdy;
            this.gsdpolygons[i].scalars.stretch = stretch;

            var popupstr = "<table border=\"1\" style='width:100%'";
            popupstr = popupstr + "<tr><td>Pixels: </td><td align=\"right\">" + padval.toFixed(0) + " x " + padval.toFixed(0) + "</td></tr>";
            popupstr = popupstr + "<tr><td>Center Pixel: </td><td align=\"right\">(" + xpix.toFixed(0) + "," + ypix.toFixed(0) + ")</td></tr>";
            popupstr = popupstr + "<tr><td>Avg Horizontal GSD: </td><td align=\"right\">" + gsdx.toFixed(2) + "m</td></tr>";
            popupstr = popupstr + "<tr><td>Avg Vertical GSD: </td><td align=\"right\">" + gsdy.toFixed(2) + "m</td></tr>";
            popupstr = popupstr + "<tr><td>Avg Pixel Stretch: </td><td align=\"right\">" + stretch.toFixed(2) + "</td></tr>";

            this.gsdpolygons[i]._popup.setContent(popupstr);
            this.gsdpolygons[i]._popup._close()
        }
    }

    makeGSDpolygons(NY,pixplot){
        let XPIX = this.IO.cx*2;
        let YPIX = this.IO.cy*2;

        let pixsize = (YPIX-1)/NY;
        let pixsizex = (XPIX-1)/(Math.floor((XPIX-1)/pixsize));

        var xpix = Array();
        var ypix = Array();
        for (var j = 1+pixsize/2; j-0.5 <= YPIX-pixsize/2; j+=pixsize) {
            // add that -0.5 because of rounding errors, and this should catch it pretty robustly
            for (var i = 1+pixsizex/2; i-0.5 <= XPIX-pixsizex/2; i+=pixsizex) {

                xpix.push(i);
                ypix.push(j);
            }
        }
        var polygons = this.leafletgrid(xpix,ypix,pixplot);
        polygons.NY = NY;
        polygons.pixplot = pixplot;
        return polygons
    }

    getCoords(xpix,ypix,padval){
        var LL1 = this.calcLLpt(xpix - padval, ypix - padval);
        var LL2 = this.calcLLpt(xpix + padval, ypix - padval);
        var LL3 = this.calcLLpt(xpix + padval, ypix + padval);
        var LL4 = this.calcLLpt(xpix - padval, ypix + padval);

        if (LL1[0]===0 || LL1[1]===0 || LL1[2]===0 || LL1[3]===0){
            return [[0,0], [0,0], [0,0], [0,0]];
        }
        return [LL1, LL2, LL3, LL4];
    }

    leafletgrid(xpix,ypix,npix){
        // mymap._initPathRoot();
        //
        // /* We simply pick up the SVG from the map object */
        // var svg = d3.select("#mapid").select("svg"),
        //     g = svg.append("g");
        let padval = 0.5 + npix-1;
        var mypolygon = Array();
        var i;
        for(i=0;i<xpix.length;i++) {
            var coords = this.getCoords(xpix[i],ypix[i],padval);
            mypolygon[i] = new L.Polygon(coords, {color: 'black', weight: 1,zIndexOffset: 1000});
            mypolygon[i].xpix = xpix[i];
            mypolygon[i].ypix = ypix[i];
            mypolygon[i].on({
                mouseover: function(e){
                    var layer = e.target;
                    layer.setStyle({
                        //color: 'magenta',
                        weight: 2,
                    })
                },
                mouseout: function(e){
                    var layer = e.target;
                    layer.setStyle({
                        //color: 'magenta',
                        weight: 1,
                    })
                }
            });
            let popup = L.popup({
                closeOnClick: false,
                autoClose: false
            })
            mypolygon[i].bindPopup(popup);
        }
        mypolygon.padval = padval;
        mypolygon.K = this.IO.K;
        return mypolygon
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
const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function deg_to_dms (deg) {
    var d = Math.floor (deg);
    var minfloat = (deg-d)*60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat-m)*60;
    var s = Math.round(secfloat);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    if (s==60) {
        m++;
        s=0;
    }
    if (m==60) {
        d++;
        m=0;
    }
    return ("" + d + "&#176; " + m + "'" + s + '"');
}

function colorval(x,minval,maxval,cmapname){
    var cmap;
    if (cmapname ==='jet'){
        cmap = ["#0000BF","#0000FF","#0040FF","#0080FF","#00BFFF","#00FFFF","#40FFBF","#80FF80","#BFFF40","#FFFF00","#FFBF00","#FF8000","#FF4000","#FF0000","#BF0000","#BF0000"];
    }
    else {
        cmap = ["#3E26A8","#4538D7","#484FF2","#4367FD","#2F80FA","#2797EB","#1CAADF","#00B9C7","#29C3AA","#48CB86","#81CC59","#BBC42F","#EABA30","#FEC735","#F5E128","#F5E128"];
    }

    var m = (cmap.length)/(maxval-minval);
    var b = -minval*m;

    var y = m*x + b;

    let ind = Math.round(y);
    if (ind<0){
        ind=0;
    }
    if (ind>cmap.length-1){
        ind=cmap.length-1;
    }

    return cmap[ind];
}
function calcDist(P1,P2){
    return ((P1[0]-P2[0])**2+(P1[1]-P2[1])**2)**0.5
}