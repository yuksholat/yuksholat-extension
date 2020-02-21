<script>
    import { data } from "../../store"

    export let active
    export let onClose
    let inputQuery = "";

    $: city = $data.city;
    let savedPosition = null;

    async function handleLocate() {
        // isloading
        const position = await data.locate()
        if (position) {
            savedPosition = position;
            city = await data.getCity(position.latitude, position.longitude);
        }
        // isnotloading
    }

    async function saveLocation() {
        if (savedPosition) {
            await data.setUserLocationData(savedPosition.latitude, savedPosition.longitude);
        }
        window.location.reload()
        onClose()
    }

    async function search() {
        if (inputQuery) {
            const position = await data.search(inputQuery)
            console.log({position})
            city = position.city;
            savedPosition = position;
        }
    }

    function handleQueryKeydown(evt) {
        if (evt.key === "Enter") {
            search();
        }
    }


</script>

<div class="modal {active ? "is-active": ""}">
    <div class="modal-background" on:click={onClose}></div>
  <div class="modal-card">
    <header class="modal-card-head">
        <p class="modal-card-title">{city}</p>
        <button class="delete" aria-label="close" on:click={onClose}></button>
    </header>
    <section class="modal-card-body">
        <div class="field has-addons">
            <div class="control has-icons-left">
                <input class="input" type="text" placeholder="Masukkan kota anda" bind:value={inputQuery} on:keydown={handleQueryKeydown}>
                <span class="icon is-small is-left">
                    <i class="fas fa-map"></i>
                </span>
            </div>
            <div class="control">
                <a class="button is-info" on:click={search}>
                    Cari
                </a>
            </div>
        </div>
    </section>
    <footer class="modal-card-foot is-marginless">
                <button class="button is-primary" on:click={handleLocate}>Cari Lokasi Otomatis</button>
                <button class="button is-info is-right" on:click={saveLocation}>Simpan</button>
    </footer>
  </div>
</div>

<style>
    footer {
        justify-content: space-between;
    }

    .field.has-addons .control:not(:last-child) {
        width: 100%;
    }
</style>
