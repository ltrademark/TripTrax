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
import L from 'leaflet'

export default {
  name: 'App',
  components: { Sidebar, Icon },
  
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
    // ... existing mounted ...
    // Initialize Map
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

  computed: {
    songSearchResults() {
      if (this.songQuery.length < 2) return [];
      
      const query = this.songQuery.toLowerCase();
      return this.mockSongs.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
      );
    }
  },

  watch: {
    // Watcher for destination input
    destinationQuery(query) {
      this.destSearchResults = []; // Clear results on new input
      if (query.length < 3) {
        return;
      }
      
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.searchNominatim(query);
      }, 300);
    },
    
    // Watcher for destination list changes
    destinations: {
      handler() {
        this.updateRoute();
        this.updateDurations(); // Update time summaries
        // This replaces the logic inside renderDestinations
        if (this.destinations.length >= 2) {
          // $summaryTripStart.textContent = this.destinations[0].name;
          // ... etc. We can move this to computed properties later
        }
      },
      deep: true // Watch for changes inside the array
    }
  },

  methods: {
    async searchNominatim(query) {
      const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
      try {
        const response = await fetch(endpoint, { headers: { 'Accept-Language': 'en' } });
        const data = await response.json();
        // Set data, Vue will handle rendering
        this.destSearchResults = data; 
      } catch (error) {
        console.error('Error fetching from Nominatim:', error);
        // this.showMessage('Error searching for location.', 'error');
      }
    },
    
    // New method to handle selection from reactive list
    selectDestination(result) {
      this.addDestination(result.display_name, result.lat, result.lon);
      this.destinationQuery = '';
      this.destSearchResults = [];
    },

    addDestination(name, lat, lon) {
      const simpleName = name.split(',')[0];
      // Just push to the data array. Watcher will handle the rest.
      this.destinations.push({ name: simpleName, lat: lat, lng: lon });
      // this.showMessage(`Added ${simpleName} to trip!`, 'success');
    },

    removeDestination(index) {
      // Just splice the data array. Watcher will handle the rest.
      const removed = this.destinations.splice(index, 1);
      // this.showMessage(`Removed ${removed[0].name}.`, 'info');
    },

    addSong(song) {
      // ... existing method (will be refactored next) ...
      songs.push(song);
      renderSongs();
      updateDurations();
      showMessage(`Added ${song.title}!`, 'success');
    },
    removeSong(index) {
      // ... existing method (will be refactored next) ...
      const removed = songs.splice(index, 1);
      renderSongs();
      updateDurations();
      showMessage(`Removed ${removed[0].title}.`, 'info');
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
    
    // ... all other methods ...
    formatTime(seconds) {
      if (seconds < 0) seconds = 0;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h} hour${h !== 1 ? 's' : ''} ${m} Minute${m !== 1 ? 's' : ''}`;
    },
    updateDurations() {
      // This method still has DOM manipulation, which we can refactor next
      // ...
      const $tripDuration = document.getElementById('trip-duration'); // temporary
      const $summaryTripDuration = document.getElementById('summary-trip-duration'); // temporary
      const $playlistRemaining = document.getElementById('playlist-remaining'); // temporary
      const $summaryTraxRemaining = document.getElementById('summary-trax-remaining'); // temporary
      const $createPlaylistBtn = document.getElementById('create-playlist-btn'); // temporary
      const $playlistNameInput = document.getElementById('playlist-name'); // temporary


      // Update Trip Duration
      const tripTimeFormatted = this.formatTime(this.totalTripTime);
      if ($tripDuration) $tripDuration.textContent = tripTimeFormatted;
      if ($summaryTripDuration) $summaryTripDuration.textContent = `Duration: ${tripTimeFormatted}`;

      // Update Playlist / Remaining Duration
      const totalPlaylistTime = this.songs.reduce((acc, song) => acc + song.duration, 0);
      const remainingTime = this.totalTripTime - totalPlaylistTime;

      const remainingTimeFormatted = this.formatTime(remainingTime);
      if ($playlistRemaining) $playlistRemaining.textContent = remainingTimeFormatted;
      if ($summaryTraxRemaining) $summaryTraxRemaining.textContent = remainingTimeFormatted;

      if (remainingTime < 0) {
        $playlistRemaining?.classList.remove('remaining-time', 'success');
        $playlistRemaining?.classList.add('danger');
        $summaryTraxRemaining?.classList.remove('remaining-time', 'success');
        $summaryTraxRemaining?.classList.add('danger');
      } else if (this.totalTripTime > 0 && remainingTime < (this.totalTripTime * 0.1)) { // Within 10%
        $playlistRemaining?.classList.remove('remaining-time', 'danger');
        $playlistRemaining?.classList.add('success');
        $summaryTraxRemaining?.classList.remove('remaining-time', 'danger');
        $summaryTraxRemaining?.classList.add('success');
      } else {
        $playlistRemaining?.classList.remove('success', 'danger');
        $playlistRemaining?.classList.add('remaining-time');
        $summaryTraxRemaining?.classList.remove('success', 'danger');
        $summaryTraxRemaining?.classList.add('remaining-time');
      }

      // Update create button state
      if ($createPlaylistBtn) $createPlaylistBtn.disabled = !this.activeSource || this.songs.length === 0 || !$playlistNameInput.value;
    },
    toggleCollapse(section) {
      switch(section) {
        case 'trip':
          this.collapseTrips = !this.collapseTrips;
          break;
        case 'trax':
          this.collapseTrax = !this.collapseTrax;
          break;
        case 'sidebar':
          this.collapseSidebar = !this.collapseSidebar;
          break;
      }
    },
    mockAuth(source) {
      // ... existing method (will be refactored) ...
      const $authSpotify = document.getElementById('auth-spotify');
      const $authApple = document.getElementById('auth-apple');
      const $authYoutube = document.getElementById('auth-youtube');
      const $songInput = document.getElementById('song-input');
      
      $authSpotify?.classList.remove('bg-green-500', 'text-white');
      $authSpotify?.classList.add('bg-gray-100', 'text-green-500');

      $authApple?.classList.remove('bg-black', 'text-white');
      $authApple?.classList.add('bg-gray-100', 'text-gray-800');

      $authYoutube?.classList.remove('bg-red-500', 'text-white');
      $authYoutube?.classList.add('bg-gray-100', 'text-red-500');

      if (source === 'spotify') {
        $authSpotify?.classList.remove('bg-gray-100', 'text-green-500');
        $authSpotify?.classList.add('bg-green-500', 'text-white');
      } else if (source === 'apple') {
        $authApple?.classList.remove('bg-gray-100', 'text-gray-800');
        $authApple?.classList.add('bg-black', 'text-white');
      } else if (source === 'youtube') {
        $authYoutube?.classList.remove('bg-gray-100', 'text-red-500');
        $authYoutube?.classList.add('bg-red-500', 'text-white');
      }

      this.activeSource = source;

      $songInput.disabled = false;
      $songInput.placeholder = `Search ${source.charAt(0).toUpperCase() + source.slice(1)}...`;
      // showMessage(`Connected to ${source}! You can now search for songs.`, 'success');
      this.toggleCollapse('trax', true);
    },
    createPlaylist() {
      // ... existing method (will be refactored) ...
    },
    signout() {
      // ... existing method (will be refactored) ...
    },
    showMessage(message, type = 'info') {
      // ... existing method (will be refactored) ...
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

/* Sidebar Styling */
#sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  background: var(--color-bg-elevated);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease-in-out;
  color: var(--color-fg);
  
  /* Sidebar inputs */
  input[type="text"] {
    background: var(--color-bg-offset);
    color: var(--color-fg);
  }

  input::placeholder {
    color: var(--color-fg-offset);
  }
 }
 
 /* Semantic classes replacing utility classes */
 .sidebar {
   display: flex;
   flex-direction: column;
   padding: 1.5rem; /* matches previous p-6 */
   overflow-y: auto;
 }
 
 .sidebar-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding-bottom: 1rem;
   border-bottom: 1px solid rgba(2,36,86,0.06);
   & .sidebar-header--btn {
     border: none;
     padding: 0.25rem;
     border-radius: 9999px;
     font-size: 1.4rem;
     background: transparent;
   }
 }
 
 .branding-wrap {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   font-size: 2.5em;
 }
  
 .app-title {
   font-size: 1.25rem;
   font-weight: 700;
   color: var(--color-fg);
 }
 
 .icon-btn {
   border-radius: 9999px;
   padding: 0.25rem;
   background: transparent;
   border: none;
 }
 
 /* .icon { color: var(--color-fg-offset); font-size: 1.125rem; } */
 
 .sidebar-content { flex: 1 1 auto; padding-top: 1.5rem; display: block; gap: 1.5rem; }
 
 .section { margin-bottom: 1rem; }
 
 .section-header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   cursor: pointer;
   & .is-collapsed {
     transform: rotate(180deg);
   }
 }

 .section-title {
   font-size: 1rem;
   font-weight: 700;
   color: var(--color-fg);
 }
 
 .collapsed-summary { 
   display: none; 
   font-size: 0.875rem; 
   padding-left: 0.25rem; 
   margin-top: 0.5rem;

   .summary-row {
     display: flex;
     align-items: center;
     gap: 0.5rem;
   }

   .start-icon {
     color: var(--tone-play);
     font-size: 1rem;
   }

   .end-icon {
     color: var(--tone-delete);
     font-size: 1rem;
   }

   .summary-text {
     font-weight: 500;
     color: var(--color-fg);
   }

   .summary-indent {
     padding-left: 0.25rem;
   }

   .summary-stops {
     font-size: 0.75rem;
     font-weight: 500;
     color: var(--color-fg-offset);
   }

   .summary-duration {
     font-weight: 500;
     color: var(--tone-trip);
   }
 }

 .search-wrap {
   position: relative;
 }

 .search-icon {
   position: absolute;
   left: 0.75rem;
   top: 50%;
   transform: translateY(-50%);
   color: var(--color-fg-offset);
 }

 .search-input {
   width: 100%;
   padding: 0.625rem 1rem 0.625rem 2.5rem;
   border-radius: 0.75rem;
   border: none;
   background: var(--color-bg-offset);
   color: var(--color-fg);
 }

 .destination-list {
   list-style: none;
   padding: 0;
   margin: 0;
   display: block;
   gap: 0.5rem;
 }

 .trip-summary {
   display: none;
   font-size: 0.875rem;
   font-weight: 600;
   color: var(--tone-trip);
   padding-left: 0.25rem;
 }

 .trip-duration-pill {
   background: var(--tone-trip);
   color: #fff;
   font-size: 0.75rem;
   font-weight: 700;
   padding: 0.25rem 0.5rem;
   border-radius: 999px;
   margin-left: 0.5rem;
 }

 .muted {
   color: var(--color-fg-offset);
   font-size: 0.9rem;
 }

 .auth-row {
   display: flex;
   gap: 0.5rem;
 }

 .auth-btn {
   background: var(--color-bg-offset);
   border-radius: 0.75rem;
   padding: 0.5rem;
   border: 1px solid rgba(2, 36, 86, 0.06);
 }

 .auth-btn .logo {
   font-size: 1.25rem;
 }

 .auth-spotify {
   color: var(--tone-play);
 }

 .auth-apple {
   color: var(--color-fg);
 }

 .auth-youtube {
   color: var(--tone-delete);
 }

 .song-list {
   list-style: none;
   padding: 0;
   margin: 0;
 }

 .trax-summary {
   display: none;
   font-size: 0.875rem;
   font-weight: 500;
   padding-left: 0.25rem;

   .remaining-time {
     color: var(--tone-trax);

     &.success {
       color: var(--tone-play);
     }
     &.danger {
       color: var(--tone-delete);
     }
   }
 }
 .playlist-creator {
   display: none;
   padding-top: 1rem;
   border-top: 1px solid rgba(2, 36, 86, 0.06);
   gap: 0.75rem;
 }

 .btn-primary {
   background: var(--tone-play);
   color: #fff;
   border: none;
   padding: 0.625rem 1rem;
   border-radius: 0.75rem;
   font-weight: 600;
 }

 .btn-primary.wide {
   width: 100%;
 }
.leaflet-routing-container {
  display: none;
}

/* Autocomplete dropdown */
.autocomplete-results {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: var(--color-bg-elevated);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  font-size: .85rem;
  z-index: 1000;

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  & li {
    cursor: pointer;
    padding: 1rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover {
      background: var(--color-bg-offset);
    }
  }
}

/* Collapsible Section Styling (nested) */
.collapsible-content {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
  /* Add spacing */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;


  &.collapsed {
    grid-template-rows: 0fr;
    opacity: 0;
    pointer-events: none;
  }
}

/* Destination list visuals (grouped and cascading) */
/* Destination list visuals (nested) */
.destination-list-item {
  position: relative;
  /* padding-left: calc(var(--dot-left) + var(--dot-size) + 12px); */ /* space for dot + gap */
  min-height: 48px;
  background: var(--color-bg-offset);
  color: var(--color-fg);
  border-radius: 0.5rem;
  padding: 0.75rem;
  padding-left: 36px; /* 12px dot + 12px gap + 12px padding */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* pseudo elements grouped under the item */
  &::after,
  &:not(:last-child)::before {
    content: '';
    position: absolute;
  }

  /* vertical dotted line */
  &:not(:last-child)::before {
    left: var(--dot-line-left);
    top: 32px; /* Needs to be more dynamic */
    top: 50%;
    bottom: -8px;
    height: 100%;
    width: 2px;
    background: repeating-linear-gradient(
      to bottom,
      var(--dot-color-default),
      var(--dot-color-default) 4px,
      transparent 4px,
      transparent 8px
    );
  }

  /* the dot */
  &::after {
    left: var(--dot-left);
    top: 50%; /* Center vertically */
    transform: translateY(-50%);
    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    background-color: var(--dot-color-default);
    border: 2px solid var(--color-bg-elevated);
    box-shadow: 0 0 0 2px var(--dot-color-default);
    z-index: 1;
  }

  /* modifiers */
  &.is-start::after {
    background-color: var(--tone-play);
    box-shadow: 0 0 0 2px var(--tone-play);
  }
  &.is-start:not(:last-child)::before {
    top: 50%;
    height: 50%;
  }

  &.is-end::after {
    background-color: var(--tone-delete);
    box-shadow: 0 0 0 2px var(--tone-delete);
  }

  /* Remove dotted line from the end item when not last-child */
  &.is-end:not(:last-child)::before {
    display: none;
  }
}

/* New semantic styles for generated content */
.destination-main {
  display: flex;
  align-items: center;
}

.destination-name {
  font-weight: 600;
  color: var(--color-fg);
}

.remove-btn {
  background: transparent;
  border: none;
  border-radius: 999px;
  padding: 0.25rem;
  cursor: pointer;

  & .remove-icon {
    color: var(--tone-delete);
    font-size: 1.25rem;
  }
}


.song-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-offset);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.song-main .song-title {
  font-weight: 600;
  color: var(--color-fg);
  margin: 0;
}

.song-main .song-artist {
  margin: 0;
  color: var(--color-fg-offset);
  font-size: 0.9rem;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.song-duration {
  color: var(--color-fg-offset);
}

.btn-danger {
  background: rgba(255, 0, 0, 0.06);
  color: var(--tone-delete);
  border: none;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
}

.wide {
  width: 100%;
}

/* Toast Notification grouped styles */
#message-box {
  position: fixed;
  top: -100px; /* Start off-screen */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  transition: top 0.4s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &.show {
    top: 20px; /* Slide in */
  }
}
</style>