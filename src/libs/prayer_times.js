"use strict";
// --------------------- Copyright Block ----------------------
/*

   PrayTimes.js: Prayer Times Calculator (ver 2.3)
   Copyright (C) 2007-2011 PrayTimes.org

Developer: Hamid Zarrabi-Zadeh
License: GNU LGPL v3.0

TERMS OF USE:
Permission is granted to use this code, with or
without modification, in any website or application
provided that credit is given to the original work
with a link back to PrayTimes.org.

This program is distributed in the hope that it will
be useful, but WITHOUT ANY WARRANTY.

PLEASE DO NOT REMOVE THIS COPYRIGHT BLOCK.

 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var dmath_1 = require("./dmath");
// ------------------------ Constants --------------------------
// Time Names
var timeNames = {
    imsak: "Imsak",
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    sunset: "Sunset",
    maghrib: "Maghrib",
    isha: "Isha",
    midnight: "Midnight"
};
// Calculation Methods
var methods = {
    MWL: {
        name: "Muslim World League",
        params: { fajr: 18, isha: 17 }
    },
    ISNA: {
        name: "Islamic Society of North America (ISNA)",
        params: { fajr: 15, isha: 15 }
    },
    Egypt: {
        name: "Egyptian General Authority of Survey",
        params: { fajr: 19.5, isha: 17.5 }
    },
    Makkah: {
        name: "Umm Al-Qura University, Makkah",
        params: { fajr: 18.5, isha: "90 min" }
    },
    Karachi: {
        name: "University of Islamic Sciences, Karachi",
        params: { fajr: 18, isha: 18 }
    },
    Tehran: {
        name: "Institute of Geophysics, University of Tehran",
        params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "Jafari" }
    },
    Kemenag: {
        name: "Kementrian Agama Indonesia",
        params: { fajr: 20, isha: 18 }
    },
    Jafari: {
        name: "Shia Ithna-Ashari, Leva Institute, Qum",
        params: { fajr: 16, isha: 14, maghrib: 4, midnight: "Jafari" }
    }
};
// Default Parameters in Calculation Methods
var defaultParams = {
    maghrib: "0 min", midnight: "Standard"
};
// ----------------------- Parameter Values ----------------------
/*

// Asr Juristic Methods
asrJuristics = [
'Standard',    // Shafi`i, Maliki, Ja`fari, Hanbali
'Hanafi'       // Hanafi
],


// Midnight Mode
midnightMethods = [
'Standard',    // Mid Sunset to Sunrise
'Jafari'       // Mid Sunset to Fajr
],


// Adjust Methods for Higher Latitudes
highLatMethods = [
'NightMiddle', // middle of night
'AngleBased',  // angle/60th of night
'OneSeventh',  // 1/7th of night
'None'         // No adjustment
],


// Time Formats
timeFormats = [
'24h',         // 24-hour format
'12h',         // 12-hour format
'12hNS',       // 12-hour format with no suffix
'Float'        // floating point number
],
 */
// do not change anything here; use adjust method instead
var setting = {
    imsak: "10 min",
    dhuhr: "0 min",
    asr: "Standard",
    highLats: "NightMiddle"
};
var timeFormat = "24h";
var timeSuffixes = ["am", "pm"];
var invalidTime = "-----";
var numIterations = 1;
// ----------------------- Local Variables ---------------------
// ---------------------- Initialization -----------------------
var dMath = new dmath_1["default"]();
var PrayerTimes = /** @class */ (function () {
    function PrayerTimes(method) {
        this.offset = {};
        this.calcMethod = method;
        this.setting = {
            imsak: 10,
            dhuhr: 0,
            asr: "Standard",
            highLats: "NightMiddle",
            maghrib: 0,
            midnight: "Standard"
        };
        this.params = __assign(__assign({}, methods[this.calcMethod].params), this.setting);
        for (var i in timeNames) {
            if (i) {
                this.offset[i] = 2;
            }
        }
    }
    // ---------------------- Default Settings --------------------
    // ----------------------- Public Functions ------------------------
    // set calculation method
    PrayerTimes.prototype.setMethod = function (method) {
        if (methods[method]) {
            this.adjust(methods[method].params);
            this.calcMethod = method;
        }
    };
    // set calculating parameters
    PrayerTimes.prototype.adjust = function (parameters) {
        setting = parameters;
    };
    // set time offsets
    PrayerTimes.prototype.tune = function (times) {
        for (var i in times) {
            if (i) {
                times[i] = this.offset[i] / 60;
            }
        }
        return times;
    };
    // get current calculation method
    PrayerTimes.prototype.getMethod = function () { return this.calcMethod; };
    // get current setting
    PrayerTimes.prototype.getSetting = function () { return this.setting; };
    // get current time offsets
    PrayerTimes.prototype.getOffsets = function () { return this.offset; };
    // get default calc parametrs
    PrayerTimes.prototype.getDefaults = function () { return methods; };
    // return prayer times for a given date
    PrayerTimes.prototype.getTimes = function (date, coords, timezone, dst, format) {
        this.lat = 1 * coords[0];
        this.lng = 1 * coords[1];
        this.elv = coords[2] ? 1 * coords[2] : 0;
        this.timeFormat = format || "24h";
        var dates;
        if (date.constructor === Date) {
            dates = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        }
        if (typeof (timezone) === "undefined") {
            timezone = this.getTimeZone(dates);
        }
        if (typeof (dst) === "undefined") {
            dst = this.getDst(dates);
        }
        this.timeZone = 1 * timezone + (1 * dst ? 1 : 0);
        this.jDate = this.julian(dates[0], dates[1], dates[2]) - this.lng / (15 * 24);
        return this.computeTimes();
    };
    // convert float time to the given format (see timeFormats)
    PrayerTimes.prototype.getFormattedTime = function (time, format) {
        if (isNaN(time)) {
            return invalidTime;
        }
        if (format === "Float") {
            return time + "";
        }
        var suffixes = ["am", "pm"];
        time = dMath.fixHour(time + 0.5 / 60); // add 0.5 minutes to round
        var hours = Math.floor(time);
        var minutes = Math.floor((time - hours) * 60);
        var suffix = (format === "12h") ? suffixes[hours < 12 ? 0 : 1] : "";
        var hour = (format === "24h") ? this.twoDigitsFormat(hours) : ((hours + 12 - 1) % 12 + 1);
        return hour + ":" + this.twoDigitsFormat(minutes) + (suffix ? " " + suffix : "");
    };
    // ---------------------- Calculation Functions -----------------------
    // compute mid-day time
    PrayerTimes.prototype.midDay = function (time) {
        var eqt = this.sunPosition(this.jDate + time).equation;
        var noon = dMath.fixHour(12 - eqt);
        return noon;
    };
    // compute the time at which sun reaches a specific angle below horizon
    PrayerTimes.prototype.sunAngleTime = function (angle, time, direction) {
        var decl = this.sunPosition(this.jDate + time).declination;
        var noon = this.midDay(time);
        var t = 1 / 15 * dMath.arccos((-dMath.sin(angle) - dMath.sin(decl) * dMath.sin(this.lat)) /
            (dMath.cos(decl) * dMath.cos(this.lat)));
        return noon + (direction === "ccw" ? -t : t);
    };
    // compute asr time
    PrayerTimes.prototype.asrTime = function (factor, time) {
        var decl = this.sunPosition(this.jDate + time).declination;
        var angle = -dMath.arccot(factor + dMath.tan(Math.abs(this.lat - decl)));
        return this.sunAngleTime(angle, time);
    };
    // compute declination angle of sun and equation of time
    // Ref: http://aa.usno.navy.mil/faq/docs/SunApprox.php
    PrayerTimes.prototype.sunPosition = function (jd) {
        var D = jd - 2451545.0;
        var g = dMath.fixAngle(357.529 + 0.98560028 * D);
        var q = dMath.fixAngle(280.459 + 0.98564736 * D);
        var L = dMath.fixAngle(q + 1.915 * dMath.sin(g) + 0.020 * dMath.sin(2 * g));
        var R = 1.00014 - 0.01671 * dMath.cos(g) - 0.00014 * dMath.cos(2 * g);
        var e = 23.439 - 0.00000036 * D;
        var RA = dMath.arctan2(dMath.cos(e) * dMath.sin(L), dMath.cos(L)) / 15;
        var eqt = q / 15 - dMath.fixHour(RA);
        var decl = dMath.arcsin(dMath.sin(e) * dMath.sin(L));
        return { declination: decl, equation: eqt };
    };
    // convert Gregorian date to Julian day
    // Ref: Astronomical Algorithms by Jean Meeus
    PrayerTimes.prototype.julian = function (year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        var A = Math.floor(year / 100);
        var B = 2 - A + Math.floor(A / 4);
        var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
        return JD;
    };
    // ---------------------- Compute Prayer Times -----------------------
    // compute prayer times at given julian date
    PrayerTimes.prototype.computePrayerTimes = function (times) {
        times = this.dayPortion(times);
        var imsak = this.sunAngleTime(this.params.imsak, times.imsak, "ccw");
        var fajr = this.sunAngleTime(this.params.fajr, times.fajr, "ccw");
        var sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise, "ccw");
        var dhuhr = this.midDay(times.dhuhr);
        var asr = this.asrTime(this.asrFactor(this.params.asr), times.asr);
        var sunset = this.sunAngleTime(this.riseSetAngle(), times.sunset);
        var maghrib = this.sunAngleTime(this.params.maghrib, times.maghrib);
        var isha = this.sunAngleTime(this.params.isha, times.isha);
        return {
            imsak: imsak, fajr: fajr, sunrise: sunrise, dhuhr: dhuhr,
            asr: asr, sunset: sunset, maghrib: maghrib, isha: isha
        };
    };
    // compute prayer times
    PrayerTimes.prototype.computeTimes = function () {
        // default times
        var times = {
            imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12,
            asr: 13, sunset: 18, maghrib: 18, isha: 18
        };
        // main iterations
        for (var i = 1; i <= numIterations; i++) {
            times = this.computePrayerTimes(times);
        }
        times = this.adjustTimes(times);
        times.midnight = (this.setting.midnight === "Jafari") ?
            times.sunset + this.timeDiff(times.sunset, times.fajr) / 2 :
            times.sunset + this.timeDiff(times.sunset, times.sunrise) / 2;
        times = this.tuneTimes(times);
        return this.modifyFormats(times);
    };
    // adjust times
    PrayerTimes.prototype.adjustTimes = function (times) {
        for (var i in times) {
            if (i) {
                times[i] += this.timeZone - this.lng / 15;
            }
        }
        if (this.params.highLats !== "None") {
            times = this.adjustHighLats(times);
        }
        if (this.isMin(this.params.imsak)) {
            times.imsak = times.fajr - this.params.imsak / 60;
        }
        times.maghrib = times.sunset + this.params.maghrib / 60;
        if (this.isMin(this.params.isha)) {
            times.isha = times.maghrib + this.params.isha / 60;
        }
        times.dhuhr += this.params.dhuhr / 60;
        return times;
    };
    // get asr shadow factor
    PrayerTimes.prototype.asrFactor = function (asrParam) {
        // Standard = 1, Hanafi = 2
        var factors = { Standard: 1, Hanafi: 2 };
        return factors[asrParam];
    };
    // return sun angle for sunset/sunrise
    PrayerTimes.prototype.riseSetAngle = function () {
        // var earthRad = 6371009; // in meters
        // var angle = dMath.arccos(earthRad/(earthRad+ elv));
        var angle = 0.0347 * Math.sqrt(this.elv); // an approximation
        return 0.833 + angle;
    };
    // apply offsets to the times
    PrayerTimes.prototype.tuneTimes = function (times) {
        for (var i in times) {
            if (i) {
                times[i] += this.offset[i] / 60;
            }
        }
        return times;
    };
    // convert times to given time format
    PrayerTimes.prototype.modifyFormats = function (times) {
        var formattedTimes = {};
        for (var i in times) {
            if (i) {
                formattedTimes[i] = this.getFormattedTime(times[i], timeFormat);
            }
        }
        return formattedTimes;
    };
    // adjust times for locations in higher latitudes
    PrayerTimes.prototype.adjustHighLats = function (times) {
        var nightTime = this.timeDiff(times.sunset, times.sunrise);
        times.imsak = this.adjustHLTime(times.imsak, times.sunrise, this.params.imsak, nightTime, "ccw");
        times.fajr = this.adjustHLTime(times.fajr, times.sunrise, this.params.fajr, nightTime, "ccw");
        times.isha = this.adjustHLTime(times.isha, times.sunset, this.params.isha, nightTime);
        times.maghrib = this.adjustHLTime(times.maghrib, times.sunset, this.params.maghrib, nightTime);
        return times;
    };
    // adjust a time for higher latitudes
    PrayerTimes.prototype.adjustHLTime = function (time, base, angle, night, direction) {
        var portion = this.nightPortion(angle, night);
        var timeDiff = (direction === "ccw") ?
            this.timeDiff(time, base) :
            this.timeDiff(base, time);
        if (isNaN(time) || timeDiff > portion) {
            time = base + (direction === "ccw" ? -portion : portion);
        }
        return time;
    };
    // the night portion used for adjusting times in higher latitudes
    PrayerTimes.prototype.nightPortion = function (angle, night) {
        var method = setting.highLats;
        var portion = 1 / 2; // MidNight
        if (method === "AngleBased") {
            portion = 1 / 60 * angle;
        }
        if (method === "OneSeventh") {
            portion = 1 / 7;
        }
        return portion * night;
    };
    // convert hours to day portions
    PrayerTimes.prototype.dayPortion = function (times) {
        for (var i in times) {
            if (i) {
                times[i] /= 24;
            }
        }
        return times;
    };
    // ---------------------- Time Zone Functions -----------------------
    // get local time zone
    PrayerTimes.prototype.getTimeZone = function (date) {
        var year = date[0];
        var t1 = this.gmtOffset([year, 0, 1]);
        var t2 = this.gmtOffset([year, 6, 1]);
        return Math.min(t1, t2);
    };
    // get daylight saving for a given date
    PrayerTimes.prototype.getDst = function (date) {
        return (this.gmtOffset(date) !== this.getTimeZone(date)) ? 1 : 0;
    };
    // GMT offset for a given date
    PrayerTimes.prototype.gmtOffset = function (date) {
        var localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
        var GMTString = localDate.toUTCString();
        var GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(" ") - 1));
        var hoursDiff = (localDate.valueOf() - GMTDate.valueOf()) / (1000 * 60 * 60);
        return hoursDiff;
    };
    // ---------------------- Misc Functions -----------------------
    // convert given string into a number
    PrayerTimes.prototype.eval = function (str) {
        return (str + "").split(/[^0-9.+-]/)[0] ? 1 : 0;
    };
    // detect if input contains 'min'
    PrayerTimes.prototype.isMin = function (arg) {
        return (arg + "").indexOf("min") !== -1;
    };
    // compute the difference between two times
    PrayerTimes.prototype.timeDiff = function (time1, time2) {
        return dMath.fixHour(time2 - time1);
    };
    // add a leading 0 if necessary
    PrayerTimes.prototype.twoDigitsFormat = function (num) {
        return (num < 10) ? "0" + num : num;
    };
    return PrayerTimes;
}());
exports["default"] = PrayerTimes;
// ---------------------- Init Object -----------------------
//
// module.exports = PrayTimes
