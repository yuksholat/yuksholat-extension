<script>
    import Modal from "./modal.svelte";
    import moment from "moment";
    import { data } from "../../store"

    export let now;
    export let activePrayer;

    let modalActive = false;

    function handleLocationClick() {
        modalActive = !modalActive;
    }

    function handleModalLocationClose() {
        modalActive = false;
    }
</script>

<div class="main container">
    <section class="hero">
        <div class="hero-body hero-masjid">
            <div class="hijr">
                <span>{$data.hijrCalendar} {$data.hijrYear} <br> {moment().format("DD MMMM YYYY")}</span>
            </div>
            <div class="timenow">{now}</div>
            <div id="btn-location" on:click={handleLocationClick}>
                <img alt={$data.city} src="/themes/classic/images/loc.png" width="30" style="vertical-align: middle;-webkit-filter: drop-shadow(2px 1px 1px rgba(0,0,0,.5));filter: drop-shadow(2px 1px 1px rgba(0,0,0,.5));" >
                <h4 id="city">{$data.city}</h4>
            </div>
        </div>
    </section>
    <div class="columns is-desktop columns-pray-times is-marginless is-paddingless">
        {#each $data.prayerTimes as p}
            <div class="column column-pray-time {p.name}" active="{p.name === activePrayer.name}">
                <h2>{p.name}</h2>
                <h3>{p.value}</h3>
            </div>
        {/each}
    </div>
</div>
<Modal active={modalActive} onClose={handleModalLocationClose}/>

<style type="text/scss">
    .main {
        margin: auto;
        max-width: 800px;
        background: #fff;
        border-radius: 7px;
        box-shadow: 0px 1px 5px rgba(0,0,0,.5);
        opacity: .7;
    }

    .hero-body.hero-masjid {
        position: relative;
        border-radius: 7px 7px 0 0;
        background: url('/themes/classic/images/masjid.jpg');
        background-size: cover;
        height: 400px;

        .hijr{
            bottom: 38%;
            position: absolute;
            width: 100%;
            text-align: center;
            left:0;right:0;
        }

        .hijr span {
            font-size: 23px;
            font-weight: bold;
            color: #9c9789;
        }

    }

    .columns.columns-pray-times {
        border-radius: 0 0 7px 7px;
        overflow: hidden;
        background: #00A8A8;
        /* justify-content: center; */

        .column {
            text-transform: capitalize;
            border-left: 1px solid #1a7b78;
            padding: 30px 30px;
            /* display: inline-block; */
            /* text-align: center; */

            h2, h3 {
                text-align: center;
            }

            h2 {
                margin-bottom: 17px;
                border-radius: 17px;
                background: #069898;
                color: #fff;
                text-align: center;
                padding: 5px 20px;
                font-weight: normal;
                font-size: 20px;
            }

            h3 {
                color: #fff;
                font-size: 28px;
            }
        }

        .column[active=true]{
            background: rgb(226, 188, 93) !important
        }

        .column[active=true] h2{
            background: rgb(216, 177, 72) !important
        }

        .column[active=true] h3{
            color: white
        }
        .column:nth-child(1) {
            border-left: none;
        }
    }

    .timenow {
        display: inline-block;
        width: 100%;
        text-align: center;
        vertical-align: middle;
        /* top: 0; */
        bottom: 24%;
        left: 0;
        right: 0;
        /* margin-left: auto; */
        position: absolute;
        font-weight: bold;
        font-size: 40px;
        opacity: .5;
        margin: auto;
    }

    #btn-location {
        font-size: 18px;
        border-radius: 20px 0 0 20px;
        position: absolute;
        right: 0;
        color: #fff;
        top: 3%;
        padding: 10px 30px;
        cursor: pointer;
    }

    .icon-location {
        /* background: url(../loc.png); */
        width: 30px;
        height: 30px;
        background-size: cover;
        display: inline-block;
        vertical-align: middle;
        filter: drop-shadow(12px 12px 25px rgba(0,0,0,0.5));
    }

    h4#city {
        display: inline-block;
        vertical-align: middle;
        margin: 0;
        padding: 0;
        text-shadow: 2px 2px 2px rgba(0,0,0,.5);
    }

    @media only screen and (min-width: 800px){
        .columns.is-desktop.columns-pray-times {
            display: flex !important;
        }
    }

    @media only screen and (max-width: 800px) {
        .timenow {
            background: rgba(0,0,0,0.3);
            bottom: 0%;
            color:#fff;
            opacity:1;
        }
        .hero-body.hero-masjid {
            height: 300px;
            .hijr {
                background: rgba(0,0,0,.3);
                bottom: 19.6%;
                span {
                    color: #fff;
                }
            }
        }
        .columns.is-desktop.columns-pray-times {
            .column {
                padding: 0px 0px 15px 0;
                border:none;
                h2 {
                    border-radius:0;
                }

            }
        }
    }


</style>
