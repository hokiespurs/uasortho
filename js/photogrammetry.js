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

        this.centermarker = new L.Marker(this.centerpoint);

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
        return [
            this.calcutm2ll(this.calcSpaceIntersection(1, 1)),
            this.calcutm2ll(this.calcSpaceIntersection(1, this.IO.totpixy)),
            this.calcutm2ll(this.calcSpaceIntersection(this.IO.totpixx, this.IO.totpixy)),
            this.calcutm2ll(this.calcSpaceIntersection(this.IO.totpixx, 1))];
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
        return [ L.utm({x: xy[0], y: xy[1], zone: this.EO.zone, band: this.EO.band}).latLng().lat,
            L.utm({x: xy[0], y: xy[1], zone: this.EO.zone, band: this.EO.band}).latLng().lng];
    }
    // uv2gsd
}