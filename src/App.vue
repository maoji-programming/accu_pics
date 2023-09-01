<template>
  <div class="grid nested-grid">
    <div class="col-12">
      <Message :sticky="false" :life="4000" v-for="msg of msgList" :key="msg.uuid" :severity="msg.severity">{{ msg.content }}</Message>
    </div>
    <div class="col-12 lg:col-8">  
      <div class="grid my-3">
          <div class="col-fixed">
            <Button id="text-local-btn" label="Get My Location" @click="handleUserLocation()" severity="warning"/>
            <Button id="icon-local-btn" icon="pi pi-map-marker" aria-label="Get My Location" @click="handleUserLocation()" severity="warning"/>
          </div>
          <div class="col p-fluid">
            <AutoComplete id="search-input"  v-model="userInput" :suggestions="autocompleteShow" @complete="suggestLocation" @keyup.enter="searchLocation(userInput)"></AutoComplete>
          </div>
          <div class="col-fixed">
            <Button id="search-btn" class="px-3" icon="pi pi-search" aria-label="Search" @click="searchLocation(userInput)" severity="warning"/>
          </div>

      </div>
      <div id="gmap"/>
    </div>
    <current-time-table :markers="markers" @delete="deleteMarkersOnMap" />
    <!-- <div class="col-12 lg:col-4">
      <div class="card my-3">
        <current-time :marker="latestMarker"/>
      </div>
      <div class="card my-3 p-3">
        <Button id="delete-btn" class="full-width" icon="pi pi-trash" label="Delete Selected" @click="deleteMarkers()" severity="warning"/>
        <DataTable id="place-table" :value="markers" v-model:selection="selectedMarkers" dataKey="uuid" :rows="10" paginator paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}">
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column header="Place title" field="title"></Column>
        </DataTable>
      </div>
    </div> -->
  </div>
</template>
<script setup>
import { ref, watch, computed, reactive  } from "vue";
import axios from 'axios';

import AutoComplete from 'primevue/autocomplete';
import InputText from "primevue/inputtext"
import Button from 'primevue/button';
import Message from 'primevue/message';

import { Loader } from "@googlemaps/js-api-loader"

//import CurrentTimeTable from "src/components/CurrentTimeTable.vue"
import DataTable from 'primevue/datatable'
import Column from 'primevue/column';
/* Map */
var map;
var isLocationUsed = false;

const userInput = ref("");
const autocomplete = ref([]);
const autocompleteShow = computed(()=>{return autocomplete.value.map((record) => {return record.description})});

const msgList = ref([]);

var loader;
const initMap = () => {

  loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    version: "weekly",
  });

  loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary("maps");
    

    map = new Map(document.getElementById("gmap"), {
      center: { lat: 43.6, lng: -79.3 },
      zoom: 10,
      
    });
  });
}
initMap();

/* Markers */
const markers = ref([]);
var markersOnMap = [];
const selectedMarkers = ref();
//Latest marker for showing the position on the map 
const latestMarker = computed(()=>{
  return markers.value.length > 0 ? markers.value[0]:{}
});
watch(latestMarker, async (v_new, v_old) => {
  if(Object.keys(v_new).length > 0)
  map.setCenter(new google.maps.LatLng(v_new.lat, v_new.lng), 9)

})


const createMarkers = (loc) => {
  
    if (!loc.geometry || !loc.geometry.location) return;
    let marker = new google.maps.Marker({
      position: loc.geometry.location, 
      map,
      title: loc.name
    })
    const timestamp = new Date().getTime();
    axios.get(
      "https://maps.googleapis.com/maps/api/timezone/json?location="+marker.getPosition().lat()+"%2C"+marker.getPosition().lng()+"&timestamp="+timestamp.toString().substring(0,timestamp.toString().length-3)+"&key="+import.meta.env.VITE_GOOGLE_MAP_API_KEY
    ).then(
      (response) => {
        if(response.data.status === "OK") {
          markers.value.unshift(
            {
              uuid: crypto.randomUUID(),
              title: marker.title,
              lat: marker.getPosition().lat(),
              lng: marker.getPosition().lng(),
              timezoneOffset: parseInt(response.data.rawOffset / 3600),
              daylightOffset: parseInt(response.data.dstOffset / 3600),
              timezoneId: response.data.timeZoneId
            }
          );
        }else{
          msgList.value.unshift(
            { severity: 'error', content: 'Google service is not connected. Please check the API Key.' , uuid:crypto.randomUUID()}
          )
        }
        
      }
    )
    
    markersOnMap.unshift(marker)
  
}

const deleteMarkersOnMap = (j) => {
  markersOnMap[j].setMap(null);
  markersOnMap.splice(j, 1);
  markers.value.splice(j, 1);
}

/* Location */
const location = ref(null);
/**
 * zoom to user location
 */
const handleUserLocation = () => {
  navigator.permissions.query({ name: "geolocation" }).then((res) => {
    switch (res.state){
      case "granted":
      case "prompt":
        navigator.geolocation.getCurrentPosition(pos => {
          map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude) , 9);
          if (!isLocationUsed){
            new google.maps.Marker({
              position: {lat:pos.coords.latitude, lng:pos.coords.longitude}, 
              map,
              title: "Your current location",
              icon:"src/assets/current_marker.png"
            })
            isLocationUsed = true;
          }else{
            msgList.value.unshift(
              { severity: 'info', content: 'The current location is marked. Please check the blue marker.' , uuid:crypto.randomUUID()}
            )
          }
          
        })
        break;
      case "denied":
        msgList.value.unshift(
          { severity: 'error', content: 'Geolocation service is denied. Please grant the permission in your browser' , uuid:crypto.randomUUID()}
        )
        break;
    }
    
  })

}
/**
 * Search the place given the prompt
 */
const searchLocation = async (v) => {
  const request = {
    query: v,
    fields: ["name", "geometry"],
  };
  const { PlacesService ,PlacesServiceStatus } = await google.maps.importLibrary("places")
  const service = new PlacesService(map);
  service.findPlaceFromQuery(request, (results, status) => {
    if (status === PlacesServiceStatus.OK) {
      if(results || results.length > 0) {
        createMarkers(results[0]);
        userInput.value="";
      }
    }else{
      msgList.value.unshift(
        { severity: 'error', content: 'No Searching Result...' , uuid:crypto.randomUUID()}
      )
    }
  });
}
/**
 * Autocomplete while user typing
 */
const suggestLocation = async (event) => {

    const { AutocompleteService } = await google.maps.importLibrary("places")
    const service = new AutocompleteService()
    return service.getPlacePredictions({ input: event.query }).then((res) => {
      autocomplete.value = res.predictions
    });
    
  }
</script>

<style scoped>
#gmap {
  min-height: 300px;
}
.full-width {
  width: 100%;
}

.card{
  background: #fff;
  border-radius: 10px;
  box-shadow: 2px 4px 6px;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  #gmap {
    min-height: 600px;
  }
}
@media (max-width: 846px) {
  #text-local-btn{
    display: none;
  }
}
@media (min-width: 847px) {
  #icon-local-btn{
    display: none;
  }
}
</style>
