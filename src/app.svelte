<script>
    import Classic from "./themes/classic/classic.svelte"
    import { data } from "./store"
    import moment from 'moment';
    document.getElementsByClassName("body")[0].classList.add("classic");

    data.init()

    let now; updateClock();
    let activePrayer; updateActivePrayer();

    function updateClock() {
        now = moment().format("HH:mm:ss")
    }

    function updateActivePrayer() {
        if ($data.prayerTimes.length === 0) return;
        const nowTimestamp = moment().unix();
        for (const pray of $data.prayerTimes) {
            const prayerTimestamp = moment(pray.value, "HH:mm").unix();
            if (nowTimestamp <= prayerTimestamp) {
                activePrayer = pray.name;
                break;
            }
        }

        const isya = $data.prayerTimes.find((d) => d.name === "isha");

        const isyaTimestamp = moment(isya.value, "HH:mm").unix();
        if (nowTimestamp > isyaTimestamp) {
            activePrayer = "fajr"
        }
    }

    setInterval(updateClock, 1000)
    setInterval(updateActivePrayer, 60000)

</script>

<Classic now={now} activePrayer={activePrayer}/>
<!-- <Modern now={now} pray={pray} activePrayer={activePrayer} hijrCalendar={hijrCalendar} hijrYear={hijrYear} city={city}/> -->
