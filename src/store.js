import { writable, get } from 'svelte/store';
import { formatCity, parseUrlEncoded } from "./libs/utils"
import PrayerTimes from "./libs/prayer_times";
import moment from "moment";
import momentHijr from "moment-hijri";

const storage = localStorage.getItem("data")
const baseUrl = "https://yuksholat.rizkifuad.com"

moment.locale("en-EN");

function createDataStore() {
    const defaults = {
        prayerTimes: [],
        hijrCalendar: momentHijr().format("iD iMMMM"),
        hijrYear: momentHijr().format("iYYYY"),
        latitude: -5.7768256,
        longitude: 106.397789,
        tz: 7,
        city: "Jakarta"
    }
    const data = writable(defaults);
    const { subscribe, set, update } = data;
    const PrayTimes = new PrayerTimes("Kemenag");

    const updateData = (data) => {
        update(n => { return { ...n, ...data } });
    }

    const getPrayerTimes = () =>  {
        const $data = get(data)
        let times = PrayTimes.getTimes(new Date(), [$data.latitude, $data.longitude], $data.tz);
        delete times.imsak;
        delete times.sunrise;
        delete times.sunset;
        delete times.midnight;

        let prays = [];

        for (const key in times) {
            prays.push({ name: key, value: times[key] });
        }

        updateData({ prayerTimes: prays });
    }

    const locate = () => {
        const $data = get(data)
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async function(position) {
                // locate success
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                resolve({ latitude, longitude });
            }, function(err) {
                resolve(false);
            });
        })
    }

    const saveStorage = (data) => {
        localStorage.setItem("data", JSON.stringify(data))
    }

    const getCity = async (lat, long) => {
        const data = {
            lat, long
        };
        const url = `${baseUrl}/locate?${parseUrlEncoded(data)}`;
        const response = await fetch(url)
        const address = await response.json()
        const city = formatCity(address.results);

        return city;
    }

    const setUserLocationData = async (latitude, longitude) => {
        updateData({ latitude, longitude })
        getPrayerTimes()

        const city = await getCity(latitude, longitude);

        updateData({ city })
        saveStorage({ latitude, longitude, city });
    }

    const search = async (q) => {
        const params = {
            q
        };
        const url = `${baseUrl}/search?${parseUrlEncoded(params)}`;
        const response = await fetch(url)
        const data = await response.json()

        if (data.results && data.results.length > 0) {
            const city = formatCity(data.results);
            const latitude = data.results[0].geometry.location.lat;
            const longitude = data.results[0].geometry.location.lng;
            return { city, latitude, longitude };
        }

        return null

    }

    const init = async () => {
        try {
            const storage = localStorage.getItem("data")
            if (storage) {
                const data = JSON.parse(storage);
                updateData(data);
                getPrayerTimes()
            } else {
                getPrayerTimes()
                // saveStorage(get(data))
                const position = await locate();
                if (position) {
                    setUserLocationData(position.latitude, position.longitude)
                }
            }
        } catch (e) {
            localStorage.removeItem("data")
            setUserLocationData()
        }
    }

    const reset = () => set(defaults)

	return {
		subscribe,
        init,
        locate,
        setUserLocationData,
        getCity,
        getPrayerTimes,
        search,
        reset,
	};
}

export const data = createDataStore();
