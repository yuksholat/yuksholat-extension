var prayTimes = new PrayTimes('Kemenag')
var times = prayTimes.getTimes(new Date(), [-6.2235414, 106.8398132], 7)

var SHUBUH = document.querySelector(".fajr h3")
var DZUHUR = document.querySelector(".dhuhr h3")
var ASHAR = document.querySelector(".asr h3")
var MAGHRIB = document.querySelector(".maghrib h3")
var ISHA = document.querySelector(".isha h3")

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

SHUBUH.innerHTML = times.fajr
DZUHUR.innerHTML = times.dhuhr
ASHAR.innerHTML = times.asr
MAGHRIB.innerHTML = times.maghrib
ISHA.innerHTML = times.isha

function fixtime(i) {
  if (i < 10) {
    return '0' + i
  }

  return i

}

var todayDate = moment().format("YYYY-MM-DD"),
tomorrowDate = moment().add(1, 'day').format("YYYY-MM-DD")

function printtime() {
  var today = new Date();
  var h = fixtime(today.getHours())
  var m = fixtime(today.getMinutes())
  var s = fixtime(today.getSeconds())

  var todayHour = `${h}:${m}`
  
  // subuh
  if(todayHour > times.isha && todayHour < times.fajr) {
    SHUBUH.style.color = "white"
    SHUBUH_TEXT.style.backgroundColor = "rgb(216, 177, 72)"
    SHUBUH_WRAPPER.style.backgroundColor = "rgb(226, 188, 93)"
  }

  // dhuhr
  if(todayHour > times.fajr && todayHour < times.dhuhr) {
    DZUHUR.style.color = "white"
    DZUHUR_TEXT.style.backgroundColor = "rgb(216, 177, 72)"
    DZUHUR_WRAPPER.style.backgroundColor = "rgb(226, 188, 93)"
  }

  // ashar 
  if(todayHour > times.dhuhr && todayHour < times.asr) {
    ASHAR.style.color = "white"
    ASHAR_TEXT.style.backgroundColor = "rgb(216, 177, 72)"
    ASHAR_WRAPPER.style.backgroundColor = "rgb(226, 188, 93)"
    
  }

  // maghrib
  if(todayHour > times.asr && todayHour < times.maghrib) {
    MAGHRIB.style.color = "white"
    MAGHRIB_TEXT.style.backgroundColor = "rgb(216, 177, 72)"
    MAGHRIB_WRAPPER.style.backgroundColor = "rgb(226, 188, 93)"
  }

  // isha
  if(todayHour > times.maghrib && todayHour < times.isha ) {
    ISHA.style.color = "white"
    ISHA_TEXT.style.backgroundColor = "rgb(216, 177, 72)"
    ISHA_WRAPPER.style.backgroundColor = "rgb(226, 188, 93)"
  }
  

  today = h + ':' + m + ':' + s
  document.querySelector('.timenow').innerHTML = today
  setTimeout(printtime, 1000)
}


printtime()

