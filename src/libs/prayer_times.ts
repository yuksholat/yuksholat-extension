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


// --------------------- Help and Manual ----------------------
/*

   User's Manual:
http://praytimes.org/manual

Calculation Formulas:
http://praytimes.org/calculation



//------------------------ User Interface -------------------------


getTimes (date, coordinates [, timeZone [, dst [, timeFormat]]])

setMethod (method)       // set calculation method
adjust (parameters)      // adjust calculation parameters
tune (offsets)           // tune times by given offsets

getMethod ()             // get calculation method
getSetting ()            // get current calculation parameters
getOffsets ()            // get current time offsets


//------------------------- Sample Usage --------------------------


var PT = new PrayTimes('ISNA');
var times = PT.getTimes(new Date(), [43, -80], -5);
document.write('Sunrise = '+ times.sunrise)


 */


// ----------------------- PrayTimes Class ------------------------

import {
  IMethod, IMethods, IParams, ITimeNames, ITimes,
  ITimesFormatted,
} from "../interface/common";
import DMath from "./dmath";



// ------------------------ Constants --------------------------

// Time Names
const timeNames: ITimeNames = {
  imsak    : "Imsak",
  fajr     : "Fajr",
  sunrise  : "Sunrise",
  dhuhr    : "Dhuhr",
  asr      : "Asr",
  sunset   : "Sunset",
  maghrib  : "Maghrib",
  isha     : "Isha",
  midnight : "Midnight",
};


// Calculation Methods
const methods: IMethods = {
  MWL: {
    name: "Muslim World League",
    params: { fajr: 18, isha: 17 },
  },
  ISNA: {
    name: "Islamic Society of North America (ISNA)",
    params: { fajr: 15, isha: 15 },
  },
  Egypt: {
    name: "Egyptian General Authority of Survey",
    params: { fajr: 19.5, isha: 17.5 },
  },
  Makkah: {
    name: "Umm Al-Qura University, Makkah",
    params: { fajr: 18.5, isha: "90 min" },
  },  // fajr was 19 degrees before 1430 hijri
  Karachi: {
    name: "University of Islamic Sciences, Karachi",
    params: { fajr: 18, isha: 18 },
  },
  Tehran: {
    name: "Institute of Geophysics, University of Tehran",
    params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "Jafari" },
  },  // isha is not explicitly specified in this method
  Kemenag: {
    name: "Kementrian Agama Indonesia",
    params: { fajr: 20, isha: 18 },
  },
  Jafari: {
    name: "Shia Ithna-Ashari, Leva Institute, Qum",
    params: { fajr: 16, isha: 14, maghrib: 4, midnight: "Jafari" },
  },
};


// Default Parameters in Calculation Methods
const defaultParams = {
  maghrib: "0 min", midnight: "Standard",
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
let setting = {
imsak    : "10 min",
           dhuhr    : "0 min",
           asr      : "Standard",
           highLats : "NightMiddle",
};

const timeFormat = "24h";
const timeSuffixes = ["am", "pm"];
const invalidTime =  "-----";

const numIterations = 1;


// ----------------------- Local Variables ---------------------



// ---------------------- Initialization -----------------------



const dMath = new DMath();

export default class PrayerTimes {
  private calcMethod: string;
  private params: any;
  private setting: IParams;
  private offset: {[name: string]: number} = {};
  private timeFormat: string;
  private timeZone: number;
  private lat: number;
  private lng: number;
  private elv: number;
  private jDate: number;

  constructor(method: string) {
    this.calcMethod = method;
    this.params = methods[this.calcMethod].params;
    this.setting = {
      imsak    : "10 min",
      dhuhr    : "0 min",
      asr      : "Standard",
      highLats : "NightMiddle",
    };

    for (const i in timeNames) {
      if (i) {
        this.offset[i] = 2;
      }
    }
  }

  // ---------------------- Default Settings --------------------

  // ----------------------- Public Functions ------------------------

    // set calculation method
  public setMethod(method: string) {
    if (methods[method]) {
      this.adjust(methods[method].params);
      this.calcMethod = method;
    }
  }
    // set calculating parameters
  public adjust(parameters: any) {
    setting = parameters;
  }


    // set time offsets
  public tune(times: ITimes) {
    for (const i in times) {
      if (i) {
        times[i] = this.offset[i] / 60;
      }
    }
    return times;
  }


    // get current calculation method
  public getMethod() { return this.calcMethod; }

    // get current setting
  public getSetting() { return this.setting; }

    // get current time offsets
  public getOffsets() { return this.offset; }

    // get default calc parametrs
  public getDefaults() { return methods; }


    // return prayer times for a given date
  public getTimes(date: Date, coords: number[], timezone: number, dst?: number, format?: string) {
    this.lat = 1 * coords[0];
    this.lng = 1 * coords[1];
    this.elv = coords[2] ? 1 * coords[2] : 0;
    this.timeFormat = format || "24h";
    let dates: number[];
    if (date.constructor === Date) {
      dates = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    }
    if (typeof(timezone) === "undefined") {
      timezone = this.getTimeZone(dates);
    }
    if (typeof(dst) === "undefined") {
      dst = this.getDst(dates);
    }
    this.timeZone  = 1 * timezone + (1 * dst ? 1 : 0);
    this.jDate = this.julian(dates[0], dates[1], dates[2]) - this.lng / (15 * 24);


    return this.computeTimes();
  }


  // convert float time to the given format (see timeFormats)
  getFormattedTime(time: number, format: string) {
    if (isNaN(time)) {
      return invalidTime;
    }
    if (format === "Float") { return time + ""; }
    const suffixes = ["am", "pm"];

    time = dMath.fixHour(time + 0.5 / 60);  // add 0.5 minutes to round
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const suffix = (format === "12h") ? suffixes[hours < 12 ? 0 : 1] : "";
    const hour = (format === "24h") ? this.twoDigitsFormat(hours) : ((hours + 12 - 1) % 12 + 1);
    return hour + ":" + this.twoDigitsFormat(minutes) + (suffix ? " " + suffix : "");
  }


  // ---------------------- Calculation Functions -----------------------


    // compute mid-day time
    midDay(time: number) {
      const eqt = this.sunPosition(this.jDate + time).equation;
      const noon = dMath.fixHour(12 - eqt);
      return noon;
    }


    // compute the time at which sun reaches a specific angle below horizon
    sunAngleTime(angle: number, time: number, direction?: string) {
      const decl = this.sunPosition(this.jDate + time).declination;
      const noon = this.midDay(time);
      const t = 1 / 15 * dMath.arccos((-dMath.sin(angle) - dMath.sin(decl) * dMath.sin(this.lat)) /
                                    (dMath.cos(decl) * dMath.cos(this.lat)));
      return noon + (direction === "ccw" ? -t : t);
    }


    // compute asr time
    asrTime(factor: number, time: number) {
      const decl = this.sunPosition(this.jDate + time).declination;
      const angle = -dMath.arccot(factor + dMath.tan(Math.abs(this.lat - decl)));
      return this.sunAngleTime(angle, time);
    }


    // compute declination angle of sun and equation of time
    // Ref: http://aa.usno.navy.mil/faq/docs/SunApprox.php
    sunPosition(jd: number) {
      const D = jd - 2451545.0;
      const g = dMath.fixAngle(357.529 + 0.98560028 * D);
      const q = dMath.fixAngle(280.459 + 0.98564736 * D);
      const L = dMath.fixAngle(q + 1.915 * dMath.sin(g) + 0.020 * dMath.sin(2 * g));

      const R = 1.00014 - 0.01671 * dMath.cos(g) - 0.00014 * dMath.cos(2 * g);
      const e = 23.439 - 0.00000036 * D;

      const RA = dMath.arctan2(dMath.cos(e) * dMath.sin(L), dMath.cos(L)) / 15;
      const eqt = q / 15 - dMath.fixHour(RA);
      const decl = dMath.arcsin(dMath.sin(e) * dMath.sin(L));

      return {declination: decl, equation: eqt};
    }


    // convert Gregorian date to Julian day
    // Ref: Astronomical Algorithms by Jean Meeus
    julian(year: number, month: number, day: number) {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      const A = Math.floor(year / 100);
      const B = 2 - A + Math.floor(A / 4);

      const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
      return JD;
    }


    // ---------------------- Compute Prayer Times -----------------------


    // compute prayer times at given julian date
    computePrayerTimes(times: ITimes) {
      times = this.dayPortion(times);

      const imsak   = this.sunAngleTime(this.eval(this.params.imsak), times.imsak, "ccw");
      const fajr    = this.sunAngleTime(this.eval(this.params.fajr), times.fajr, "ccw");
      const sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise, "ccw");
      const dhuhr   = this.midDay(times.dhuhr);
      const asr     = this.asrTime(this.asrFactor(this.params.asr), times.asr);
      const sunset  = this.sunAngleTime(this.riseSetAngle(), times.sunset);
      const maghrib = this.sunAngleTime(this.eval(this.params.maghrib), times.maghrib);
      const isha    = this.sunAngleTime(this.eval(this.params.isha), times.isha);

      return {
        imsak, fajr, sunrise, dhuhr,
        asr, sunset, maghrib, isha,
      };
    }


    // compute prayer times
    computeTimes() {
      // default times
      let times: ITimes = {
        imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12,
        asr: 13, sunset: 18, maghrib: 18, isha: 18,
      };

      // main iterations
      for (let i = 1 ; i <= numIterations ; i++) {
        times = this.computePrayerTimes(times);
      }

      times = this.adjustTimes(times);

      // add midnight time
      times.midnight = (this.setting.midnight === "Jafari") ?
        times.sunset + this.timeDiff(times.sunset, times.fajr) / 2 :
        times.sunset + this.timeDiff(times.sunset, times.sunrise) / 2;

      times = this.tuneTimes(times);
      return this.modifyFormats(times);
    }


    // adjust times
    adjustTimes(times: ITimes) {
      for (const i in times) {
        if (i) {
          times[i] = this.timeZone - this.lng / 15;
        }
      }

      if (this.params.highLats !== "None") {
        times = this.adjustHighLats(times);
      }

      if (this.isMin(this.params.imsak)) {
        times.imsak = times.fajr - this.eval(this.params.imsak) / 60;
      }
      if (this.isMin(this.params.maghrib)) {
        times.maghrib = times.sunset + this.eval(this.params.maghrib) / 60;
      }
      if (this.isMin(this.params.isha)) {
        times.isha = times.maghrib + this.eval(this.params.isha) / 60;
      }
      times.dhuhr += this.eval(this.params.dhuhr) / 60;

      console.log("adjustTimes", times);

      return times;
    }


    // get asr shadow factor
    asrFactor(asrParam: number) {
      // Standard = 1, Hanafi = 2
      const factors = [1, 2];
      const factor = factors[asrParam];
      return factor || this.eval(asrParam + "");
    }


    // return sun angle for sunset/sunrise
    riseSetAngle() {
      // var earthRad = 6371009; // in meters
      // var angle = dMath.arccos(earthRad/(earthRad+ elv));
      const angle = 0.0347 * Math.sqrt(this.elv); // an approximation
      return 0.833 + angle;
    }


    // apply offsets to the times
    tuneTimes(times: ITimes) {
      for (const i in times) {
        if (i) {
          times[i] += this.offset[i] / 60;
        }
      }

      return times;
    }


    // convert times to given time format
    modifyFormats(times: ITimes) {
      const formattedTimes: ITimesFormatted = {};
      for (const i in times) {
        if (i) {
          formattedTimes[i] = this.getFormattedTime(times[i], timeFormat);
        }
      }
      return formattedTimes;
    }


    // adjust times for locations in higher latitudes
    adjustHighLats(times: ITimes) {
      const nightTime = this.timeDiff(times.sunset, times.sunrise);

      times.imsak = this.adjustHLTime(times.imsak, times.sunrise, this.eval(this.params.imsak), nightTime, "ccw");
      times.fajr  = this.adjustHLTime(times.fajr, times.sunrise, this.eval(this.params.fajr), nightTime, "ccw");
      times.isha  = this.adjustHLTime(times.isha, times.sunset, this.eval(this.params.isha), nightTime);
      times.maghrib = this.adjustHLTime(times.maghrib, times.sunset, this.eval(this.params.maghrib), nightTime);

      return times;
    }


    // adjust a time for higher latitudes
    adjustHLTime(time: number, base: number, angle: number, night: number, direction?: string) {
      const portion = this.nightPortion(angle, night);
      const timeDiff = (direction === "ccw") ?
        this.timeDiff(time, base) :
        this.timeDiff(base, time);
      if (isNaN(time) || timeDiff > portion) {
        time = base + (direction === "ccw" ? -portion : portion);
      }
      return time;
    }


    // the night portion used for adjusting times in higher latitudes
    nightPortion(angle: number, night: number) {
      const method = setting.highLats;
      let portion = 1 / 2; // MidNight
      if (method === "AngleBased") {
        portion = 1 / 60 * angle;
      }
      if (method === "OneSeventh") {
        portion = 1 / 7;
      }
      return portion * night;
    }


    // convert hours to day portions
    dayPortion(times: ITimes) {
      for (const i in times) {
        if (i) {
          times[i] /= 24;
        }
      }

      return times;
    }


    // ---------------------- Time Zone Functions -----------------------


    // get local time zone
    getTimeZone(date: number[]) {
      const year = date[0];
      const t1 = this.gmtOffset([year, 0, 1]);
      const t2 = this.gmtOffset([year, 6, 1]);
      return Math.min(t1, t2);
    }


    // get daylight saving for a given date
    getDst(date: number[]) {
      return (this.gmtOffset(date) !== this.getTimeZone(date)) ? 1 : 0;
    }


    // GMT offset for a given date
    gmtOffset(date: number[]) {
      const localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
      const GMTString = localDate.toUTCString();
      const GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(" ") - 1));
      const hoursDiff = (localDate.valueOf() - GMTDate.valueOf()) / (1000 * 60 * 60);
      return hoursDiff;
    }


    // ---------------------- Misc Functions -----------------------

    // convert given string into a number
    eval(str: string) {
      return (str + "").split(/[^0-9.+-]/)[0] ? 1 : 0;
    }


    // detect if input contains 'min'
    isMin(arg: string) {
      return (arg + "").indexOf("min") !== -1;
    }


    // compute the difference between two times
    timeDiff(time1: number, time2: number) {
      return dMath.fixHour(time2 - time1);
    }


    // add a leading 0 if necessary
    twoDigitsFormat(num: number) {
      return (num < 10) ? "0" + num : num;
    }

  }




  // ---------------------- Init Object -----------------------
  //

  // module.exports = PrayTimes



