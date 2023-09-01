<template>
    <div class="col-12 lg:col-4">
      <div class="card my-3">
        <div id="current-time-content">
            {{ props.markers.length > 0 ? props.markers[0].clock : "--:--:--" }}
        </div>
        <div id="current-time-timezone" class="p-3">
            <b>Time Zone Offset :</b>{{props.markers.length > 0 ? (markers[0].timezoneOffset >= 0 ? " + ": "") : ""}} {{ props.markers.length > 0 ? markers[0].timezoneOffset : "" }} hour(s)<br>
            <b>Time Zone : </b>{{ props.markers.length > 0 ? markers[0].timezoneId : "" }}
        </div>
        <div id="current-time-daylight" class="p-3">
            <i id="current-time-daylight-yes" v-if="props.markers.length > 0 && props.markers[0].daylightOffset > 0" style="color: green" class="pi pi-check"></i>
            <i id="current-time-daylight-no"  v-else style="color: red" class="pi pi-times"></i>
            <span> Daylight Saving Time </span>
        </div>
      </div>
      <div class="card my-3 p-3">
        <Button id="delete-btn" class="full-width" icon="pi pi-trash" label="Delete Selected" @click="deleteMarkers()" severity="warning"/>
        <DataTable id="place-table" class="p-datatable-sm" :value="props.markers" v-model:selection="selectedMarkers" dataKey="uuid" :rows="10" paginator paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}">
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column header="Place title" field="title"></Column>
          <Column header="Place current time" field="clock"></Column>
        </DataTable>
      </div>
    </div>
</template>

<script setup>
    
    import {defineComponent, reactive, ref, watch} from "vue";

    const props = defineProps(['markers']);
    const emits = defineEmits(['delete'])
    const selectedMarkers = ref();

    import DataTable from 'primevue/datatable'
    import Column from 'primevue/column';

    import Button from 'primevue/button';

    const updateClock = ( plist ) => {
        
        for(let i = 0; i < plist.length; i++){
            const now = new Date();
            const currentTimezone = now.getTimezoneOffset();
            now.setMinutes(now.getMinutes() + currentTimezone + (plist[i].timezoneOffset + plist[i].daylightOffset) * 60);
            let timeString = String(now.getHours()).padStart(2, '0')
                +":"+ String(now.getMinutes()).padStart(2, '0')
                +":"+ String(now.getSeconds()).padStart(2, '0');
                props.markers[i].clock = timeString;
        }
    

        
    }
    // when user click delete selected button
    const deleteMarkers = ()=>{
        try{
            for(let i = 0; i < selectedMarkers.value.length; i++){
                for(let j = 0; j < props.markers.length; j++){
                    // remove records in table and the markers
                    if(selectedMarkers.value[i] === props.markers[j]){
                        emits('delete',j)
                        break;
                    }
                }
            }
            selectedMarkers.value = [];
        }catch(err){
            console.log(err)
        }
        
    }

    setInterval(() => {
        if(props.markers.length > 0){
            updateClock(props.markers);
        }
    }, 1000);

</script>

<style scoped>
    .card{
        background: #fff;
        border-radius: 10px;
        box-shadow: 2px 4px 6px;
    }
    #current-time-card{
        background: #fff;
        border-radius: 6px;
        box-shadow: 2px 4px 6px;
    }
    #current-time-content{
        font-size: 48px;
        text-align: center;
    }
    .full-width {
        width: 100%;
    }
</style>