var moment = moment
var options = {
  type: 'basic', 
  title: 'Popup',
  message: 'asdfdsf',
  iconUrl: 'tab-icon.png'
}

// chrome.notifications.create(options, callback)

function callback() {
  console.log('is it')
}



function showNotification(timeName, msg){
    options.title = `${timeName} Time`
    options.message = msg
    chrome.notifications.create(options, callback)
}

function countDownNotification(timeName, prayTime){
        let formatTime = "HH:mm" ,
            parseToMoment = moment(prayTime, formatTime),
            tenMinutesBefore = parseToMoment.clone().subtract(10, "minute").format(formatTime),
            fiveMinutesBefore = parseToMoment.clone().subtract(5, "minute").format(formatTime),
            now = moment(new Date(), formatTime).format(formatTime)

    if(prayTime == now)
        showNotification(timeName, "Now Adzan")

    if(prayTime == fiveMinutesBefore)
        showNotification(timeName, "5 Minutes Again")

    if(prayTime == tenMinutesBefore)
        showNotification(timeName, "10 Minutes Again")
}
