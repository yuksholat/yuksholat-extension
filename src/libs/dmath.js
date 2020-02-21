"use strict";
// ---------------------- Degree-Based Math Class -----------------------
exports.__esModule = true;
var DMath = /** @class */ (function () {
    function DMath() {
    }
    DMath.prototype.dtr = function (d) { return (d * Math.PI) / 180.0; };
    DMath.prototype.rtd = function (r) { return (r * 180.0) / Math.PI; };
    DMath.prototype.sin = function (d) { return Math.sin(this.dtr(d)); };
    DMath.prototype.cos = function (d) { return Math.cos(this.dtr(d)); };
    DMath.prototype.tan = function (d) { return Math.tan(this.dtr(d)); };
    DMath.prototype.arcsin = function (d) { return this.rtd(Math.asin(d)); };
    DMath.prototype.arccos = function (d) { return this.rtd(Math.acos(d)); };
    DMath.prototype.arctan = function (d) { return this.rtd(Math.atan(d)); };
    DMath.prototype.arccot = function (x) { return this.rtd(Math.atan(1 / x)); };
    DMath.prototype.arctan2 = function (y, x) { return this.rtd(Math.atan2(y, x)); };
    DMath.prototype.fixAngle = function (a) { return this.fix(a, 360); };
    DMath.prototype.fixHour = function (a) { return this.fix(a, 24); };
    DMath.prototype.fix = function (a, b) {
        a = a - b * (Math.floor(a / b));
        return (a < 0) ? a + b : a;
    };
    return DMath;
}());
exports["default"] = DMath;
