  // ---------------------- Degree-Based Math Class -----------------------

export  default class DMath {

  public dtr(d: number) { return (d * Math.PI) / 180.0; }
  public rtd(r: number) { return (r * 180.0) / Math.PI; }

  public sin(d: number) { return Math.sin(this.dtr(d)); }
  public cos(d: number) { return Math.cos(this.dtr(d)); }
  public tan(d: number) { return Math.tan(this.dtr(d)); }

  public arcsin(d: number) { return this.rtd(Math.asin(d)); }
  public arccos(d: number) { return this.rtd(Math.acos(d)); }
  public arctan(d: number) { return this.rtd(Math.atan(d)); }

  public arccot(x: number) { return this.rtd(Math.atan(1 / x)); }
  public arctan2(y: number, x: number) { return this.rtd(Math.atan2(y, x)); }

  public fixAngle(a: number) { return this.fix(a, 360); }
  public fixHour(a: number) { return this.fix(a, 24 ); }

  public fix(a: number, b: number) {
    a = a - b * (Math.floor(a / b));
    return (a < 0) ? a + b : a;
  }

}
