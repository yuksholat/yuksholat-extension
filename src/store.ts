import { writable, get } from 'svelte/store';
import { parseUrlEncoded } from './prayer_times/utils';
import PrayerTimes from './prayer_times/prayer_times';
import moment from 'moment';
import * as hijr from 'hijri-js';
import type { PrayerResult } from './prayer_times/types';

const storage = localStorage.getItem('data');
const baseUrl = 'https://yuksholat-server-rust.vercel.app/api';

moment.locale('en-EN');
const hijrDate = hijr.initialize();

function createDataStore() {
	const defaults = {
		prayerTimes: [] as PrayerResult[],
		hijrCalendar: `${hijrDate.today().day} ${hijrDate.today().monthName}`,
		hijrYear: hijrDate.today().year,
		latitude: -5.7768256,
		longitude: 106.397789,
		tz: 7,
		city: 'Jakarta',
		theme: 'classic'
	};
	const data = writable(defaults);
	const { subscribe, set, update } = data;
	const PrayTimes = new PrayerTimes('Kemenag');

	const updateData = (data: any) => {
		update((n) => {
			return { ...n, ...data };
		});
	};

	const getPrayerTimes = () => {
		const $data = get(data);
		let times = PrayTimes.getTimes(new Date(), [$data.latitude, $data.longitude], 7);
		delete times.imsak;
		delete times.sunrise;
		delete times.sunset;
		delete times.midnight;

		let prays = [];

		for (const key in times) {
			prays.push({ name: key, value: times[key] });
		}

		updateData({ prayerTimes: prays });
	};

	const locate = (): Promise<{ latitude: number; longitude: number } | undefined> => {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				async function (position) {
					// locate success
					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;

					resolve({ latitude, longitude });
				},
				function (err) {
					console.error(err);
					resolve(undefined);
				}
			);
		});
	};

	const saveStorage = (data: any) => {
		localStorage.setItem('data', JSON.stringify(data));
	};

	const getCity = async (lat: number, long: number) => {
		const data = {
			lat,
			long
		};
		const url = `${baseUrl}/locate?${parseUrlEncoded(data)}`;
		const result = await fetch(url);
		const response = await result.json();
		const responseData = response.data;
		const city = responseData.city;

		return city;
	};

	const setUserLocationData = async (latitude: number, longitude: number) => {
		const $data = get(data);
		updateData({ latitude, longitude });
		getPrayerTimes();

		const city = await getCity(latitude, longitude);

		updateData({ city });
		saveStorage({ latitude, longitude, city, theme: $data.theme });
	};

	const search = async (q: string) => {
		const params = {
			q
		};
		const url = `${baseUrl}/search?${parseUrlEncoded(params)}`;
		const result = await fetch(url);
		const response = await result.json();

		if (response) {
			return response.data;
		}

		return null;
	};

	const changeTheme = (theme: string) => {
		const { latitude, longitude, city } = get(data);
		saveStorage({ latitude, longitude, city, theme });
		window.location.reload();
		updateData({ theme });
	};

	const init = async () => {
		try {
			const storage = localStorage.getItem('data');
			if (storage) {
				const data = JSON.parse(storage);
				updateData(data);
				getPrayerTimes();
			} else {
				getPrayerTimes();
				const position = await locate();
				if (position) {
					setUserLocationData(position.latitude, position.longitude);
				}
			}
		} catch (e) {
			localStorage.removeItem('data');
			const position = await locate();
			if (position?.latitude && position.longitude) {
				setUserLocationData(position.latitude, position.longitude);
			}
		}
	};

	const reset = () => set(defaults);

	return {
		subscribe,
		init,
		locate,
		setUserLocationData,
		getCity,
		getPrayerTimes,
		search,
		changeTheme,
		reset
	};
}

export const data = createDataStore();
