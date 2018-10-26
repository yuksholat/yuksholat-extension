var DEFAULT_LATITUDE = -5.7768256
var DEFAULT_LONGITUDE = 106.397789
var DEFAULT_TIMEZONE = 7

var SHUBUH = document.querySelector(".fajr h3")
var DZUHUR = document.querySelector(".dhuhr h3")
var ASHAR = document.querySelector(".asr h3")
var MAGHRIB = document.querySelector(".maghrib h3")
var ISHA = document.querySelector(".isha h3")

var cityText = document.querySelector("h4#city")
var hijrCal = document.querySelector(".hijr span")

var SHUBUH_WRAPPER = document.querySelector(".fajr")
var DZUHUR_WRAPPER = document.querySelector(".dhuhr")
var ASHAR_WRAPPER = document.querySelector(".asr")
var MAGHRIB_WRAPPER = document.querySelector(".maghrib")
var ISHA_WRAPPER = document.querySelector(".isha")

var MAGHRIB_TEXT = document.querySelector(".maghrib h2")
var SHUBUH_TEXT = document.querySelector(".fajr h2")
var ASHAR_TEXT = document.querySelector(".asr h2")
var DZUHUR_TEXT = document.querySelector(".dhuhr h2")
var ISHA_TEXT = document.querySelector(".isha h2")


// set hijr cal
moment.locale('en-EN')
hijrCal.innerHTML = moment().format('dddd, iD iMMMM iYYYY ') + 'H';

var prayTimes = new PrayTimes('Kemenag')
var times
reloadPrayerTimes({latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE}, DEFAULT_TIMEZONE)

function fixtime(i) {
  if (i < 10) {
    return '0' + i
  }

  return i

}

function printtime() {
  if (!times) {
    setTimeout(printtime, 1000)
  }
  var today = new Date();
  var h = fixtime(today.getHours())
  var m = fixtime(today.getMinutes())
  var s = fixtime(today.getSeconds())

  var todayHour = `${h}:${m}`

  // subuh
  if(todayHour > times.isha && todayHour < times.fajr) {
    ISHA.classList.remove('active')
    ISHA_TEXT.classList.remove('activeText')
    ISHA_WRAPPER.classList.remove('activeWrapper')

    SHUBUH.classList.add('active')
    SHUBUH_TEXT.classList.add('activeText')
    SHUBUH_WRAPPER.classList.add('activeWrapper')

	countDownNotification("Shubuh", times.fajr)
  }

  // dhuhr
  if(todayHour > times.fajr && todayHour < times.dhuhr) {
    SHUBUH.classList.remove('active')
    SHUBUH_TEXT.classList.remove('activeText')
    SHUBUH_WRAPPER.classList.remove('activeWrapper')

    DZUHUR.classList.add('active')
    DZUHUR_TEXT.classList.add('activeText')
    DZUHUR_WRAPPER.classList.add('activeWrapper')
	
	countDownNotification("Dhuhr", times.dhuhr)
	
  }

  // ashar 
  if(todayHour > times.dhuhr && todayHour < times.asr) {
    DZUHUR.classList.remove('active')
    DZUHUR_TEXT.classList.remove('activeText')
    DZUHUR_WRAPPER.classList.remove('activeWrapper')

    ASHAR.classList.add('active')
    ASHAR_TEXT.classList.add('activeText')
    ASHAR_WRAPPER.classList.add('activeWrapper')

	countDownNotification("Asr", times.asr)
  }

  // maghrib
  if(todayHour > times.asr && todayHour < times.maghrib) {
    ASHAR.classList.remove('active')
    ASHAR_TEXT.classList.remove('activeText')
    ASHAR_WRAPPER.classList.remove('activeWrapper')

    MAGHRIB.classList.add('active')
    MAGHRIB_TEXT.classList.add('activeText')
    MAGHRIB_WRAPPER.classList.add('activeWrapper')

    countDownNotification("Maghrib", times.maghrib)
  }

  // isha
  if(todayHour > times.maghrib && todayHour < times.isha ) {
    MAGHRIB.classList.remove('active')
    MAGHRIB_TEXT.classList.remove('activeText')
    MAGHRIB_WRAPPER.classList.remove('activeWrapper')

    ISHA.classList.add('active')
    ISHA_TEXT.classList.add('activeText')
    ISHA_WRAPPER.classList.add('activeWrapper')

    countDownNotification("Isha", "18:32")
  }

  
                                       

  today = h + ':' + m + ':' + s
  document.querySelector('.timenow').innerHTML = today
  setTimeout(printtime, 1000)
}


printtime()

var db = new PouchDB('yuksholat_db');

function geoError(error) {
  console.log(error)
}

function fetchLocation() {
  navigator.geolocation.getCurrentPosition(saveLocation, geoError);
}

function reloadPrayerTimes(location, tz) {
  times = prayTimes.getTimes(new Date(), [location.latitude, location.longitude], tz)

  SHUBUH.innerHTML = times.fajr
  DZUHUR.innerHTML = times.dhuhr
  ASHAR.innerHTML = times.asr
  MAGHRIB.innerHTML = times.maghrib
  ISHA.innerHTML = times.isha

  cityText.innerHTML = location.city
}

function getLocation() {
  db.get('location').then(function(location) {
    if (!location || !location.version) return fetchLocation()
    reloadPrayerTimes(location, 7)
  }).catch(function(e) {
    console.error(e)
    fetchLocation()
  })
}

function saveLocation(position) {
  btnLocateMe.classList.add("hide");
  var location = {
    _id: 'location',
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }


  var data = {
    key: 'AIzaSyA3UliJJ2Pni6qpL6BG2vlzpZWxip6zADg',
    latlng: `${location.latitude}\,${location.longitude}`,
    lang: 'id'
  }

  var url = 'https://maps.googleapis.com/maps/api/geocode/json?' + parseUrlEncoded(data)
  var _loc
  axios.get(url).then(function(resp) {
    var formatted_city = formatCity(resp.data.results)
    db.get('location').then(function(loc) {
      loc.city = formatted_city
      loc.version = 2
      _loc = loc
      return db.put(loc)
    }).then(function() {
      reloadPrayerTimes(_loc, 7)
    }).catch(function(e) {
      location.city = formatted_city
      db.put(location)
      reloadPrayerTimes(location, 7)
    })
  })


}

function formatCity(results) {
  var index = 0
  for (var i in results) {
    if (results[i].types && results[i].types[0] === 'administrative_area_level_3') {
      index = i
      break;
    }

  }

  var path =  results[index].formatted_address.split(',').splice(0, 2).join(',')

  return path
}


function parseUrlEncoded (data) {
  var params = new URLSearchParams()
  for (key in data) {
    params.append(key, data[key])
  }
  return params
}

getLocation()

var btnLocateMe = document.getElementById("btn-locate-me")

document.getElementById("btn-location").addEventListener("click", function(){
  btnLocateMe.classList.toggle("hide");
});

btnLocateMe.addEventListener("click", function(){
  fetchLocation()
});



