import { writable, get } from 'svelte/store';
import { parseUrlEncoded } from "./libs/utils"
import PrayerTimes from "./libs/prayer_times";
import moment from "moment";
import momentHijr from "moment-hijri";

const storage = localStorage.getItem("data")
const baseUrl = "https://yuksholat-server.herokuapp.com"

moment.locale("en-EN");

function createDataStore() {
    const defaults = {
        prayerTimes: [],
        hijrCalendar: momentHijr().format("iD iMMMM"),
        hijrYear: momentHijr().format("iYYYY"),
        latitude: -5.7768256,
        longitude: 106.397789,
        tz: 7,
        city: "Jakarta",
        theme: "classic"
    }
    const data = writable(defaults);
    const { subscribe, set, update } = data;
    const PrayTimes = new PrayerTimes("Kemenag");

    const updateData = (data) => {
        update(n => { return { ...n, ...data } });
    }

    const getPrayerTimes = () =>  {
        const $data = get(data)
        let times = PrayTimes.getTimes(new Date(), [$data.latitude, $data.longitude], undefined);
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
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async function(position) {
                // locate success
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                resolve({ latitude, longitude });
            }, function(err) {
                console.error(err)
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
        const result = await fetch(url)
        const response = await result.json()
        const city = response.city;

        return city;
    }

    const setUserLocationData = async (latitude, longitude) => {
        const $data = get(data)
        updateData({ latitude, longitude })
        getPrayerTimes()

        const city = await getCity(latitude, longitude);

        updateData({ city })
        saveStorage({ latitude, longitude, city, theme: $data.theme });
    }

    const search = async (q) => {
        const params = {
            q
        };
        const url = `${baseUrl}/search?${parseUrlEncoded(params)}`;
        const result = await fetch(url)
        const response = await result.json()

        if (response) {
            return response;
        }

        return null

    }

    const changeTheme = (theme) => {
        const { latitude, longitude, city } = get(data)
        saveStorage({ latitude, longitude, city, theme });
        window.location.reload();
        updateData({ theme })
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
            const position = await locate()
            setUserLocationData(position.latitude, position.longitude)
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
        changeTheme,
        reset,
	};
}

export const data = createDataStore();
