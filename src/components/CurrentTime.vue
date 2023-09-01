<template>
    
    <div class="col-12">
        <div id="current-time-content">
            {{hours}} : {{minutes}} : {{seconds}}
        </div>
        <div id="current-time-timezone" class="p-3">
            <b>Time Zone Offset :</b>{{timezoneOffset >= 0 ? " + ": " - "}} {{ timezoneOffset }} hour(s)<br>
            <b>Time Zone : </b>{{ timezoneId }}
        </div>
        <div id="current-time-daylight" class="p-3">
            <i id="current-time-daylight-yes" v-if="daylightOffset > 0" style="color: green" class="pi pi-check"></i>
            <i id="current-time-daylight-no"  v-else style="color: red" class="pi pi-times"></i>
            <span> Daylight Saving Time </span>
        </div>
    </div>


</template>

<script setup>
    import axios from 'axios';
    import {defineComponent, reactive, ref, watch} from "vue";

    const props = defineProps(['marker']);
    
    const timestamp = new Date().getTime()
    const timezoneId = ref("");
    const timezoneOffset = ref(0);
    const daylightOffset = ref(0);

    const hours = ref("--")
    const minutes = ref("--")
    const seconds = ref("--")

    // if the front of the list is changed, calculate the current time
    watch(() => props.marker, async (v_new, v_old) => {
        var timestamp = new Date().getTime();

        if(Object.keys(v_new).length > 0){
            axios.get(
                "https://maps.googleapis.com/maps/api/timezone/json?location="+v_new.lat+"%2C"+v_new.lng+"&timestamp="+timestamp.toString().substring(0,timestamp.toString().length-3)+"&key="+import.meta.env.VITE_GOOGLE_MAP_API_KEY
                ).then(
                (response) => {
                    timezoneOffset.value = parseInt(response.data.rawOffset / 3600)
                    daylightOffset.value = parseInt(response.data.dstOffset / 3600)
                    timezoneId.value = response.data.timeZoneId;
                }
            )
        }
    
    })

    const timeString = ref("")


    const updateClock = ( timezone , daylight) => {
        const now = new Date();
        
        // Set the timezone offset
        const currentTimezone = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() + currentTimezone + (timezone + daylight) * 60);

        hours.value = String(now.getHours()).padStart(2, '0');
        minutes.value = String(now.getMinutes()).padStart(2, '0');
        seconds.value = String(now.getSeconds()).padStart(2, '0');
        
    }

    // Update the clock every second
    setInterval(() => {
        if(Object.keys(props.marker).length > 0){
            updateClock(timezoneOffset.value,daylightOffset.value);
        }
    }, 1000);
    </script>

<style scoped>
    #current-time-card{
        background: #fff;
        border-radius: 6px;
        box-shadow: 2px 4px 6px;
    }
    #current-time-content{
        font-size: 48px;
        text-align: center;
    }



</style>