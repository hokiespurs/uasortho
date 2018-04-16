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
    constructor(Xc,Yc,Zc,roll,pitch,yaw) {
        this.Xc    = Xc;
        this.Yc    = Yc;
        this.Zc    = Zc;
        this.roll  = roll;
        this.pitch = pitch;
        this.yaw   = yaw;
    }
}
class Camera {
    constructor(iIO, iEO) {
        this.IO = iIO;
        this.EO = iEO;
    }
    // footprint
    // readrawfootprint
    // polygon
    // calcfootprint
    // marker
    // redrawmarker


    // Getters

    // Setters

    // Methods
    calcSpaceIntersection(pixx, pixy) {

        var Xw = -(this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw) - this.EO.Xc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw) + this.EO.Xc*this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll)**2 + this.EO.Zc*this.IO.cy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Xc*pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll)**2 - this.EO.Zc*pixy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw) + this.EO.Xc*this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.cy*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.cos(this.EO.pitch)**2*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Zc*pixy*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Xc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.EO.Xc*pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - this.EO.Xc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - this.EO.Xc*this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.EO.Xc*pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.EO.Xc*pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - this.EO.Xc*this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.EO.Xc*pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.f*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch) - this.EO.Zc*this.IO.cy*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll) + this.EO.Zc*pixy*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll))/(this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2);

        var Yw = (this.EO.Zc*this.IO.cy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) + this.EO.Yc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.EO.Zc*pixy*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw) - this.EO.Yc*this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.cy*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2 + this.EO.Yc*this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.f*Math.cos(this.EO.pitch)**2*Math.cos(this.EO.yaw)*Math.sin(this.EO.roll) + this.EO.Yc*pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)**2*Math.sin(this.EO.yaw) - this.EO.Zc*pixy*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2 - this.EO.Yc*this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + this.EO.Zc*this.IO.cx*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.f*Math.cos(this.EO.yaw)*Math.sin(this.EO.pitch)**2*Math.sin(this.EO.roll) + this.EO.Yc*pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 - this.EO.Zc*pixx*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw) + this.EO.Yc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - this.EO.Yc*pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.EO.Yc*this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.EO.Yc*this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - this.EO.Yc*pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - this.EO.Yc*pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.EO.Yc*this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - this.EO.Yc*pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - this.EO.Zc*this.IO.f*Math.cos(this.EO.roll)*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw) + this.EO.Zc*this.IO.cy*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw) - this.EO.Zc*pixy*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw))/(this.IO.cx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) - pixx*Math.cos(this.EO.roll)**2*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch) + this.IO.cx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 + this.IO.cx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 - pixx*Math.cos(this.EO.roll)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.yaw)**2 - pixx*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2 + this.IO.cx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 - pixx*Math.sin(this.EO.pitch)*Math.sin(this.EO.roll)**2*Math.sin(this.EO.yaw)**2 + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.cos(this.EO.yaw)**2 - this.IO.cy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) + this.IO.f*Math.cos(this.EO.pitch)*Math.cos(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.cos(this.EO.yaw)**2*Math.sin(this.EO.roll) - this.IO.cy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2 + pixy*Math.cos(this.EO.pitch)*Math.sin(this.EO.roll)*Math.sin(this.EO.yaw)**2);

        return [Xw, Yw];
    }
    // uv2gsd
}