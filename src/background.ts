import * as moment from "moment";

const options = {
  type: "basic",
  title: "Popup",
  message: "asdfdsf",
  iconUrl: "tab-icon.png",
};

function callback() {
  console.log("showed");
}

function showNotification(timeName: string, msg: string) {
  options.title = `${timeName} Time`;
  options.message = msg;
  chrome.notifications.create(options, callback);
}

function countDownNotification(timeName: string, prayTime: string) {
  const formatTime = "HH:mm";
  const parseToMoment = moment(prayTime, formatTime);
  const tenMinutesBefore = parseToMoment.clone().subtract(10, "minute").format(formatTime);
  const fiveMinutesBefore = parseToMoment.clone().subtract(5, "minute").format(formatTime);
  const now = moment(new Date(), formatTime).format(formatTime);

  if (prayTime === now) {
    showNotification(timeName, "Now Adzan");
  }

  if (prayTime === fiveMinutesBefore) {
    showNotification(timeName, "5 Minutes To Go");
  }

  if (prayTime === tenMinutesBefore) {
    showNotification(timeName, "10 Minutes To Go");
  }
}
