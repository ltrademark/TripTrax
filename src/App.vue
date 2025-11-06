<template>
  <div>
    <Sidebar 
      @update:destinations="onDestinationsChange" 
      :total-trip-time="totalTripTime"
    />
    <!-- Map Container -->
    <div id="map" style="height:100vh;width:100%;z-index:10"></div>
  </div>
</template>

<script>
import Icon from './components/Icon.vue'
import Sidebar from './components/parts/sidebar.vue' 
import Toast from './components/parts/toast.vue'
import L from 'leaflet'

export default {
  name: 'App',
  components: { Sidebar, Icon, Toast },
  
  data() {
    return {
      map: null,
      routingControl: null,
      collapseTrips: false,
      collapseTrax: false,
      collapseSidebar: false,
      
      // Trip Data
      destinationQuery: '',
      destSearchResults: [],
      searchDebounce: null,
      destinations: [], // { name: 'City, ST', lat: 123, lng: 123 }
      totalTripTime: 0,

      // Trax Data
      songs: [], // { title: 'Song', artist: 'Artist', duration: 180 (seconds) }
      activeSource: null,
      songQuery: '',
      
      // Other State
      playlistName: '',
      messageVisible: false,
      messageType: 'info',
      messageText: '',

      mockSongs: [
        // ... existing mock songs ...
        { title: 'Take Me Home, Country Roads', artist: 'John Denver', duration: 188 },
        { title: 'Hotel California', artist: 'Eagles', duration: 391 },
        { title: 'Bohemian Rhapsody', artist: 'Queen', duration: 354 },
        { title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: 482 },
        { title: 'Running on Empty', artist: 'Jackson Browne', duration: 299 },
        { title: 'Life is a Highway', artist: 'Tom Cochrane', duration: 266 },
        { title: 'Here I Go Again', artist: 'Whitesnake', duration: 275 },
      ]
    }
  },

  mounted() {
    this.map = L.map('map').setView([38.9072, -77.0369], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Initialize Routing Control
    this.routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: 'var(--tone-trip)', opacity: 0.8, weight: 6 }]
      }
    }).addTo(this.map);

    // Listen for route updates
    this.routingControl.on('routesfound', (e) => {
      this.totalTripTime = e.routes[0].summary.totalTime;
      this.updateDurations();
    });
  },
  methods: {
    showToast({ message, type }) {
      this.$refs.toast.show(message, type);
    },
    onDestinationsChange(newDestinations) {
      this.destinations = newDestinations;
      this.updateRoute();
    },
    updateRoute() {
      if (this.destinations.length < 2) {
        this.routingControl.setWaypoints([]);
        this.totalTripTime = 0; // Reset time
        return;
      }
      const waypoints = this.destinations.map(d => L.latLng(d.lat, d.lng));
      this.routingControl.setWaypoints(waypoints);
    },
  }
}
</script>

<style>
/* ... existing style ... */
@import './corevar.css';

*, *:before, *:after { box-sizing: border-box; }
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
/* Basic layout */
body {
  font-family: 'Inter', sans-serif;
  overflow: hidden; /* Prevent body scroll */
  background: var(--color-bg);
  color: var(--color-fg);
}

#map {
  height: 100vh;
  width: 100%;
  z-index: 10;
}
</style>