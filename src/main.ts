import axios from "axios";
import * as moment from "moment";
import * as PouchDB from "pouchdb";
import {
  ILocation, IMethod, IMethods, IParams, ITimeNames,
  ITimes, ITimesFormatted,
} from "./interface/common";
import PrayerTimes from "./libs/prayer_times";


const DEFAULT_LATITUDE = -5.7768256;
const DEFAULT_LONGITUDE = 106.397789;
const DEFAULT_TIMEZONE = 7;

const SHUBUH = document.querySelector(".fajr h3");
const DZUHUR = document.querySelector(".dhuhr h3");
const ASHAR = document.querySelector(".asr h3");
const MAGHRIB = document.querySelector(".maghrib h3");
const ISHA = document.querySelector(".isha h3");

const cityText = document.querySelector("h4#city");
const hijrCal = document.querySelector(".hijr span");

const SHUBUH_WRAPPER = document.querySelector(".fajr");
const DZUHUR_WRAPPER = document.querySelector(".dhuhr");
const ASHAR_WRAPPER = document.querySelector(".asr");
const MAGHRIB_WRAPPER = document.querySelector(".maghrib");
const ISHA_WRAPPER = document.querySelector(".isha");

const MAGHRIB_TEXT = document.querySelector(".maghrib h2");
const SHUBUH_TEXT = document.querySelector(".fajr h2");
const ASHAR_TEXT = document.querySelector(".asr h2");
const DZUHUR_TEXT = document.querySelector(".dhuhr h2");
const ISHA_TEXT = document.querySelector(".isha h2");


// set hijr cal
moment.locale("en-EN");
hijrCal.innerHTML = moment().format("dddd, iD iMMMM iYYYY ") + "H";

const prayTimes = new PrayerTimes("Kemenag");
let times: ITimesFormatted = {};
reloadPrayerTimes({latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE}, DEFAULT_TIMEZONE);

function fixtime(i: number) {
  if (i < 10) {
    return "0" + i;
  }

  return i;

}

function printtime() {
  if (!times) {
    setTimeout(printtime, 1000);
  }
  const today = new Date();
  const h = fixtime(today.getHours());
  const m = fixtime(today.getMinutes());
  const s = fixtime(today.getSeconds());

  const todayHour = `${h}:${m}`;

  // subuh
  if (todayHour > times.isha && todayHour < times.fajr) {
    ISHA.classList.remove("active");
    ISHA_TEXT.classList.remove("activeText");
    ISHA_WRAPPER.classList.remove("activeWrapper");

    SHUBUH.classList.add("active");
    SHUBUH_TEXT.classList.add("activeText");
    SHUBUH_WRAPPER.classList.add("activeWrapper");


  }

  // dhuhr
  if (todayHour > times.fajr && todayHour < times.dhuhr) {
    SHUBUH.classList.remove("active");
    SHUBUH_TEXT.classList.remove("activeText");
    SHUBUH_WRAPPER.classList.remove("activeWrapper");

    DZUHUR.classList.add("active");
    DZUHUR_TEXT.classList.add("activeText");
    DZUHUR_WRAPPER.classList.add("activeWrapper");



  }

  // ashar
  if (todayHour > times.dhuhr && todayHour < times.asr) {
    DZUHUR.classList.remove("active");
    DZUHUR_TEXT.classList.remove("activeText");
    DZUHUR_WRAPPER.classList.remove("activeWrapper");

    ASHAR.classList.add("active");
    ASHAR_TEXT.classList.add("activeText");
    ASHAR_WRAPPER.classList.add("activeWrapper");


  }

  // maghrib
  if (todayHour > times.asr && todayHour < times.maghrib) {
    ASHAR.classList.remove("active");
    ASHAR_TEXT.classList.remove("activeText");
    ASHAR_WRAPPER.classList.remove("activeWrapper");

    MAGHRIB.classList.add("active");
    MAGHRIB_TEXT.classList.add("activeText");
    MAGHRIB_WRAPPER.classList.add("activeWrapper");


  }

  // isha
  if (todayHour > times.maghrib && todayHour < times.isha ) {
    MAGHRIB.classList.remove("active");
    MAGHRIB_TEXT.classList.remove("activeText");
    MAGHRIB_WRAPPER.classList.remove("activeWrapper");

    ISHA.classList.add("active");
    ISHA_TEXT.classList.add("activeText");
    ISHA_WRAPPER.classList.add("activeWrapper");

  }




  const nowTime = h + ":" + m + ":" + s;
  document.querySelector(".timenow").innerHTML = nowTime;
  setTimeout(printtime, 1000);
}


printtime();

const db = new PouchDB("yuksholat_db");

function geoError(error: any) {
  console.log(error);
}

function fetchLocation() {
  navigator.geolocation.getCurrentPosition(saveLocation, geoError);
}

function reloadPrayerTimes(location: {latitude: number, longitude: number, city?: string}, tz: number) {
  times = prayTimes.getTimes(new Date(), [location.latitude, location.longitude], tz);
  console.log({times, location, tz});

  SHUBUH.innerHTML = times.fajr;
  DZUHUR.innerHTML = times.dhuhr;
  ASHAR.innerHTML = times.asr;
  MAGHRIB.innerHTML = times.maghrib;
  ISHA.innerHTML = times.isha;

  cityText.innerHTML = location.city;
}


async function getLocation() {
  try {
    const location: any = await db.get("location");
    if (!location || !location.version) {
      return fetchLocation();
    }
    reloadPrayerTimes(location, 7);

  } catch (e) {
    console.log(e);
    fetchLocation();
  }
}

async function saveLocation(position: any) {
  btnLocateMe.classList.add("hide");
  const location = {
    _id: "location",
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    city: "",
  };


  const data = {
    key: "AIzaSyA3UliJJ2Pni6qpL6BG2vlzpZWxip6zADg",
    latlng: `${location.latitude}\,${location.longitude}`,
    lang: "id",
  };

  const url = "https://maps.googleapis.com/maps/api/geocode/json?" + parseUrlEncoded(data);
  let formattedCity = "";
  try {
    const resp = await axios.get(url);
    formattedCity = formatCity(resp.data.results);
  } catch (e) {
    console.log("failed to fetch from google api");
    return;
  }

  try {
    const loc: any = await db.get("location");
    loc.city = formattedCity;
    loc.version = 2;
    await db.put(loc);
    reloadPrayerTimes(loc, 7);
  } catch (e) {
    location.city = formattedCity;
    db.put(location);
    reloadPrayerTimes(location, 7);
  }


}

function formatCity(results: any) {
  let index = 0;
  for (const i in results) {
    if (results[i].types && results[i].types[0] === "administrative_area_level_3") {
      index = parseInt(i, 0);
      break;
    }

  }

  const path =  results[index].formatted_address.split(",").splice(0, 2).join(",");

  return path;
}


function parseUrlEncoded(data: {[key: string]: string}) {
  const params: any = new URLSearchParams();
  for (const key in data) {
    if (key) {
      params.append(key, data[key]);
    }
  }
  return params;
}

getLocation();

const btnLocateMe = document.getElementById("btn-locate-me");

document.getElementById("btn-location").addEventListener("click", () => {
  btnLocateMe.classList.toggle("hide");
});

btnLocateMe.addEventListener("click", () => {
  fetchLocation();
});



