<script lang="ts">
	import '@/routes/styles.css';
	import 'bulma/css/bulma.css';
	import Classic from '@/themes/classic/classic.svelte';
	import Modern from '@/themes/modern/modern.svelte';
	import { data } from '@/store';
	import moment from 'moment';

	data.init();

	let now: any;
	updateClock();
	let activePrayer: any;
	updateActivePrayer();

	function updateClock() {
		now = moment().format('HH:mm');
	}

	function updateActivePrayer() {
		if ($data.prayerTimes.length === 0) return;
		const nowTimestamp = moment().unix();
		for (const key in $data.prayerTimes) {
			const pray = $data.prayerTimes[key];
			const prayerTimestamp = moment(pray.value, 'HH:mm').unix();
			if (nowTimestamp <= prayerTimestamp) {
				activePrayer = pray;
				activePrayer.index = key;
				break;
			}
		}

		const isya = $data.prayerTimes.find((d) => d.name === 'isha');

		const isyaTimestamp = moment(isya?.value, 'HH:mm').unix();
		if (nowTimestamp > isyaTimestamp) {
			activePrayer = $data.prayerTimes[0];
		}
	}

	setInterval(updateClock, 60000);
	setInterval(updateActivePrayer, 60000);
</script>

{#if $data.theme == 'modern'}
	<Modern {now} {activePrayer} />
{:else}
	<Classic {now} {activePrayer} />
{/if}
