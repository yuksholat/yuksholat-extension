
<script lang="ts">
    import { data } from "../../store"
    import moment from "moment"
    export let now: any;
    export let activePrayer: any;
    let prayer: any[] = [];
    let locationDropdownActive = false;
    let themeDropdownActive = false;

    function toggleLocationDropdown() {
        locationDropdownActive = !locationDropdownActive;
        if (themeDropdownActive && locationDropdownActive) {
            themeDropdownActive = false;
        }
    }

    function toggleThemeDropdown() {
        themeDropdownActive = !themeDropdownActive;
        if (themeDropdownActive && locationDropdownActive) {
            locationDropdownActive = false;
        }
    }

    function hideAllDropdown() {
        themeDropdownActive = false;
        locationDropdownActive = false;
    }

    function changeTheme(theme: string) {
        data.changeTheme(theme);
        themeDropdownActive = false;
    }

    $: {
        const nextPrayer = $data.prayerTimes.slice(activePrayer.index, 5);
        const prevPrayer = $data.prayerTimes.slice(0, activePrayer.index);

        prayer = [...nextPrayer, ...prevPrayer]
    }

    let inputQuery = "";
    $: city = $data.city;

    async function handleLocate() {
        // isloading
        const position = await data.locate()
        if (position && position.latitude && position.longitude) {
            city = await data.getCity(position.latitude, position.longitude);
            await data.setUserLocationData(position.latitude, position.longitude);
            window.location.reload()
        }
        // isnotloading
    }

    async function search() {
        if (inputQuery && inputQuery.length > 3) {
            const position = await data.search(inputQuery)
            city = position.city;
            await data.setUserLocationData(position.latitude, position.longitude);
            inputQuery = ""
            locationDropdownActive = false;
        }
    }

    function handleQueryKeydown(evt: any) {
        if (evt.key === "Enter") {
            search();
        }
    }
</script>
<style lang="scss">
    .container {
        max-width: 1216px;
        display: flex;
    }
    .navbar {
        background:none;
        border-bottom: 1px solid rgba(106, 111, 128, .2);
        z-index: 201;

        .container {
            display: flex;
            justify-content: space-between;
        }

        .navbar-setting {
            display: flex;

            .dropdown {
                margin:auto;
                vertical-align: middle;
                .button:focus{
                    box-shadow: none;
                }
                .dropdown-menu {
                    width: 295px;
                    box-shadow: 0px 12px 24px #1E2025;
                    right: -20px;
                }
                .dropdown-menu:after {
                    background: url(../themes/modern/images/poparrow.svg) no-repeat;
                    background-size: 40px;
                    width: 40px;
                    height: 50px;
                    position: absolute;
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 80%;
                    margin-top: -8px;
                }

                .dropdown-content {
                    background-color: #363A43;
                    color: #fff;
                    padding: .75rem !important;

                    figure {
                        margin: 1rem auto;
                    }

                    h4 {
                        font-size: .9rem;
                        font-weight: bold;
                        text-align: center;
                    }

                    p {
                        margin-top: .5rem;
                        text-align: center;
                        font-size: .75rem;
                    }
                    input {
                        margin: 1rem auto;
                        width: 80%;
                        display: block;
                        background: none;
                        border: none;
                        border-bottom: 1px solid #21242c;
                        text-align: center;
                        color: #fff;
                    }
                    input:focus {
                        outline: none;
                        box-shadow: none;
                    }

                    .button-wrap {
                        display:flex;
                        justify-content: space-between;
                    }

                    
                }
            }

            .dropdown .dropdown-trigger button, .dropdown .dropdown-trigger button:hover {
                background: none;
                border: none;
                color: #fff;

                img { 
                    margin-right: .5rem;
                }

            }

        }

    }

    .navbar-brand {
        h1 {
            color: #fff;
            padding-left: .75rem;
            font-weight: 500;

        }

        a:hover {
            text-decoration: none;
        }

    }

    .curtain {
        display: none;
    }
    .curtain.is-active {
        display: block;
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 200;
    }
    div.oval {
        background-color: #2A2D35;
        width: 120%;
        left: -10%;
        position: absolute;
        height: 70%;
        border-radius: 50% / 100%;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .top-section {
        .container {
            justify-content: space-between;
        }
        div.now {
            .time {
                font-size: 5rem;
                color: #fff;
            }

            .date, .date strong {
                color: #B5B7BC;
                font-size: 1.2rem;
            }
        }
        div.quote{
            margin: auto 0;
            color: #fff;
            font-size: 1.1rem;
            text-align: right;

            strong {
                color: #fff;
                font-size: 1.2rem;
                font-weight: bolder;
            }

        }
    }
    .content {
        padding:0;
        figure img {
            display: block;
        }
    }

    .tile.is-ancestor {
        height: 440px;
        margin: -0.45rem;
    }
    .tile.is-parent {
        padding: .4rem;
    }
    .tile .tile.is-child {
        margin-bottom: 0.58rem!important;
    }

    .tile.active.is-vertical>.tile.is-child:first-child {
        margin-bottom: 0rem!important;
    }
    .notification {
        border-radius: 0;
    }

    .tile.is-child {
        margin: 0!important;
    }
    .pray-text {
        padding: 4px 16px;
        background: #FFFFFF;
        border-radius: 4px;
        color: #000;
        text-align: center;
        position: absolute;
        bottom: 35%;
        right: 10%;
        font-size: 1rem;
        text-transform: capitalize;
    }

    .pray-time {
        font-size: 3rem;
        position: absolute;
        bottom: 3%;
        right: 10%;
    }

    .active {
        .pray-text {
            bottom: 30%;
            right: 5%;
            font-size: 1.5rem;
            text-transform: uppercase;
        }
        .pray-time {
            bottom: 3%;
            right: 5%;
            font-size: 5rem;
        }
    }

    .top-section {
        display: flex;
        align-items: stretch;
    }


    @media only screen and (max-width: 800px){
        .tile .tile.is-child {
            margin-bottom:0 !important;
        }
        .tile.is-parent {
            padding:0;
        }

        .pray-text {
            bottom: 30%;
            right: 5%;
            font-size: 1.5rem;
            text-transform: uppercase;
        }
        .pray-time {
            bottom: 3%;
            right: 5%;
            font-size: 5rem;
        }
    }
    @media only screen and (max-width: 430px){
        .pray-text{
            bottom: 38% !important;
        }
    }
    @media only screen and (max-width: 600px){
        .top-section {
            display: none;
        }
    }

    main {
        background: #21242c;
        width: 100%;
        height: 100%;
    }

</style>
<main>
<div class="oval"></div>
<div class="curtain {locationDropdownActive || themeDropdownActive ? "is-active" : ""}" on:click={hideAllDropdown}></div>
<nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="container">
        <div class="navbar-brand">
            <a class="navbar-item" href="">
                <img src="themes/modern/images/logo.svg" alt="Yuk Sholat!">
                <h1>Yuk Sholat!</h1>
            </a>
        </div>
        <div class="navbar-setting">
            <div class="dropdown is-right {themeDropdownActive ? "is-active" : ""}">
                <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" on:click={toggleThemeDropdown}>
                        <span class="icon is-small">
                            <i class="fas fa-palette"></i>
                        </span>
                        <span>Tema</span>
                    </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content is-paddingless">
                        <h4 style="margin-top:5px;">Ingin kembali ke tema yang lama?</h4>
                        <div class="button-wrap" style="justify-content:center; margin-top:5px;">
                            <button class="button is-primary is-center" on:click={() => changeTheme("classic")}>Klik disini</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dropdown is-right {locationDropdownActive ? "is-active" : ""}">
                <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" on:click={toggleLocationDropdown}>
                        <img src="/themes/modern/images/pin.svg" alt="open dropdown">
                        <span>{$data.city}</span>
                        <span class="icon is-small">
                            {#if locationDropdownActive}
                                <i class="fas fa-angle-up" aria-hidden="true"></i>
                            {:else}
                                <i class="fas fa-angle-down" aria-hidden="true"></i>
                            {/if}
                        </span>
                    </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <figure class="image is-128x128">
                            <img src="/themes/modern/images/pinmap.svg" alt="">
                        </figure>
                        <h4>Astagfirullah, lokasi tidak sesuai?</h4>
                        <p>Jangan kawatir, Alhamdulillah kamu bisa mencari lokasi manual dengan input kota dibawah ini.</p>
                        <input type="text" placeholder="Masukkan lokasi kamu" bind:value={inputQuery} on:keydown={handleQueryKeydown}>
                        <div class="button-wrap">
                            <button class="button is-primary is-outlined" on:click={handleLocate}>
                                <span class="icon is-small">
                                    <i class="fas fa-map"></i>
                                </span>
                                <span>Lokasi saya</span>
                            </button>
                            <button class="button is-info is-outlined" on:click={search}>
                                <span class="icon is-small">
                                    <i class="fas fa-search"></i>
                                </span>
                                <span>Cari lokasi</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</nav>

<section class="section top-section">
    <div class="container">
        <div class="now">
            <div class="time">{now}</div>
            <div class="date"><strong>{$data.hijrCalendar} {$data.hijrYear}</strong> / {moment().format("DD MMMM YYYY")}</div>
        </div>
        <div class="quote">
            <p>“Apakah yang memasukkan kamu ke dalam <strong>Saqar (neraka)?</strong>” <br>
            Mereka menjawab: “Kami dahulu <strong>tidak</strong> termasuk orang-orang yang <strong>mengerjakan shalat.</strong>”<br>
            <br>
            Al Muddaththir,42-43
            </p>
        </div>
    </div>
</section>
<section class="section content">
    <div class="container">
        {#if prayer}
            <div class="tile is-ancestor">
                <div class="tile is-vertical is-12">
                    <div class="tile">
                        <div class="tile is-parent is-6">
                            <article class="tile is-child notification is-info {prayer[0].name} active is-paddingless">
                                <figure class="image is-marginless">
                                    <img src="themes/modern/images/{prayer[0].name}.svg">
                                </figure>
                                <span class="pray-text">{prayer[0].name}</span>
                                <span class="pray-time">{prayer[0].value}</span>
                            </article>
                        </div>
                        <div class="tile is-parent is-vertical">
                            <article class="tile is-child notification is-info {prayer[1].name} is-paddingless">
                                <figure class="image is-marginless">
                                    <img src="themes/modern/images/{prayer[1].name}.svg">
                                </figure>
                                <span class="pray-text">{prayer[1].name}</span>
                                <span class="pray-time">{prayer[1].value}</span>
                            </article>
                            <article class="tile is-child notification is-info {prayer[2].name} is-paddingless">
                                <figure class="image is-marginless">
                                    <img src="themes/modern/images/{prayer[2].name}.svg">
                                </figure>
                                <span class="pray-text">{prayer[2].name}</span>
                                <span class="pray-time">{prayer[2].value}</span>
                            </article>
                        </div>
                        <div class="tile is-parent is-vertical">
                            <article class="tile is-child notification is-info {prayer[3].name} is-paddingless">
                                <figure class="image is-marginless">
                                    <img src="themes/modern/images/{prayer[3].name}.svg">
                                </figure>
                                <span class="pray-text">{prayer[3].name}</span>
                                <span class="pray-time">{prayer[3].value}</span>
                            </article>
                            <article class="tile is-child notification is-info {prayer[4].name} is-paddingless">
                                <figure class="image is-marginless">
                                    <img src="themes/modern/images/{prayer[4].name}.svg">
                                </figure>
                                <span class="pray-text">{prayer[4].name}</span>
                                <span class="pray-time">{prayer[4].value}</span>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
            <!-- tile -->
        {/if}
    </div>
</section>
</main>
