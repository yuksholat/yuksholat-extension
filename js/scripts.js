var prayTimes = new PrayTimes('Kemenag')
var times = prayTimes.getTimes(new Date(), [-6.2235414, 106.8398132], 7)

document.querySelector(".fajr h3").innerHTML = times.fajr
document.querySelector(".dhuhr h3").innerHTML = times.dhuhr
document.querySelector(".asr h3").innerHTML = times.asr
document.querySelector(".maghrib h3").innerHTML = times.maghrib
document.querySelector(".isha h3").innerHTML = times.isha

function fixtime(i) {
  if (i < 10) {
    return '0' + i
  }

  return i

}

function printtime() {
  var today = new Date();
  var h = fixtime(today.getHours())
  var m = fixtime(today.getMinutes())
  var s = fixtime(today.getSeconds())
  document.querySelector('.timenow').innerHTML = h + ':' + m + ':' + s
  setTimeout(printtime, 1000)
}

printtime()

