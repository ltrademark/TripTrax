<template>
  <div>
    <!-- Toast -->
    <div id="message-box" class="hidden px-4 py-3 rounded-lg text-white font-medium">
      <span id="message-text"></span>
    </div>

    <!-- Sidebar -->
    <div id="sidebar" class="sidebar">
      <header class="sidebar-header">
        <div class="branding-wrap">
          <Icon name="logo_full" />
        </div>
        <button class="sidebar-header--btn" aria-label="collapse">
          <Icon name="Arrow-Left" class="icon" />
        </button>
      </header>

      <div class="sidebar-content">
        <!-- Trip Section -->
        <div class="section">
          <div class="section-header" @click="toggleCollapse('trip')">
            <h2 class="section-title">Trip</h2>
            <Icon ref="tripChevron" name="Chevron-up" :class="{ 'is-collapsed': collapseTrips }" />
          </div> 
          <!-- Trip Collapsed Summary -->
          <div v-if="collapseTrips" class="collapsed-summary">
            <p class="summary-row">
              <Icon name="Checkmark" class="start-icon" />
              <span id="summary-trip-start" class="summary-text"></span>
            </p>
            <p class="summary-row">
              <Icon name="Close" class="end-icon" />
              <span id="summary-trip-end" class="summary-text"></span>
            </p>
            <p class="summary-indent"><span id="summary-trip-stops" class="summary-stops"></span></p>
            <p class="summary-indent"><span id="summary-trip-duration" class="summary-duration"></span></p>
          </div>

          <div v-if="!collapseTrips" class="collapsible-content">
            <div class="search-wrap">
              <Icon name="Search" class="search-icon" />
              <input v-model="destinationQuery" type="text" id="destination-input" placeholder="Add Destination" class="search-input">
              <div id="destination-results" class="autocomplete-results"></div>
            </div>
            <ul id="destination-list" class="destination-list"></ul>
            <div id="trip-summary" class="trip-summary">
              Total Trip duration <span id="trip-duration" class="trip-duration-pill">0 hours 0 Minutes</span>
            </div>
          </div>
        </div>

        <!-- Source Section -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Source</h2>
          </div>

          <div id="source-content">
            <p class="muted">Connect a music source to search for tracks.</p>
            <div class="auth-row">
              <button id="auth-spotify" onclick="mockAuth('spotify')" class="auth-btn auth-spotify">
                <Icon name="Spotify" class="logo" />
              </button>
              <button id="auth-apple" onclick="mockAuth('apple')" class="auth-btn auth-apple">
                <Icon name="AppleMusic" class="logo" />
              </button>
              <button id="auth-youtube" onclick="mockAuth('youtube')" class="auth-btn auth-youtube">
                <Icon name="YouTube" class="logo" />
              </button>
            </div>
          </div>
        </div>

        <!-- Trax Section -->
        <div class="section">
          <div class="section-header" @click="toggleCollapse('trax')">
            <h2 class="section-title">Trax</h2>
            <Icon name="Chevron-up" :class="{ 'is-collapsed': collapseTrax }" />
          </div>

          <!-- Trax Collapsed Summary -->
          <div v-if="collapseTrax" class="collapsed-summary">
            <p><span id="summary-trax-count" class="summary-text"></span></p>
            <p>Remaining: <span id="summary-trax-remaining" class="remaining-time"></span></p>
          </div>

          <div v-if="!collapseTrax" class="collapsible-content">
            <div class="search-wrap">
              <Icon name="Search" class="search-icon" />
              <input type="text" id="song-input" placeholder="Connect a source first..." class="search-input" disabled>
              <div id="song-results" class="autocomplete-results">
                <!-- Song results here -->
              </div>
            </div>
            <ul id="song-list" class="song-list">
              <!-- Songs will be added here -->
            </ul>
            <div id="trax-summary" class="trax-summary">
              Remaining Time <span id="playlist-remaining" class="remaining-time">0 hours 0 Minutes</span>
            </div>
          </div>
        </div>

        <!-- Playlist Creation Section -->
        <div id="playlist-creator" class="playlist-creator">
          <input type="text" id="playlist-name" placeholder="Playlist Name" class="search-input">
          <button id="create-playlist-btn" class="btn-primary wide" onclick="createPlaylist()">
            Create Playlist
          </button>
        </div>

      </div> <!-- /flex-grow -->

      <footer class="app-footer">
        <button class="btn-danger wide" onclick="signout()">
          Sign Out & Restart
        </button>
        <p class="footer-note">© 2025 TripTrax. All rights reserved.</p>
      </footer>
    </div>

    <!-- Map Container -->
    <div id="map" style="height:100vh;width:100%;z-index:10"></div>
  </div>
</template>

<script>
import Icon from './components/Icon.vue'
import CloseIcon from './Icons/Close.svg?raw'
import L from 'leaflet'

export default {
  name: 'App',
  components: { Icon },
  
  data() {
    return {
      map: null,
      routingControl: null,
      collapseTrips: false,
      collapseTrax: false,
      collapseSidebar: false,
      destinationQuery:'',
      destinations: [], // { name: 'City, ST', lat: 123, lng: 123 }
      songs: [], // { title: 'Song', artist: 'Artist', duration: 180 (seconds) }
      activeSource: null,
      totalTripTime: 0,
      sections: {
        trip: { collapsed: false },
        source: { collapsed: false },
        trax: { collapsed: false }
      },
      searchQuery: '',
      songQuery: '',
      playlistName: '',
      messageVisible: false,
      messageType: 'info',
      messageText: '',
      songsQuery: '',
      mockSongs: [
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


    /* DOM manipulation replaced with Vue.js reactive state */

  mounted() {
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
    searchQuery: {
      handler(query) {
        if (query.length < 3) {
          this.searchResults = [];
          return;
        }
        
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => {
          this.searchNominatim();
        }, 300);
      }
    }
  },

  methods: {
    async searchNominatim() {
      const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
      try {
        const response = await fetch(endpoint, { headers: { 'Accept-Language': 'en' } });
        const data = await response.json();
        renderDestinationResults(data);
      } catch (error) {
        console.error('Error fetching from Nominatim:', error);
        showMessage('Error searching for location.', 'error');
      }
    },
    renderDestinationResults(results) {
      $destinationResults.innerHTML = '';
      if (results.length === 0) {
        $destinationResults.innerHTML = '<div class="p-3 text-gray-500">No results found.</div>';
      } else {
        results.forEach(result => {
          const li = document.createElement('div');
          li.className = 'p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100';
          li.textContent = result.display_name;
          // Use mousedown to register click before blur hides the box
          li.addEventListener('mousedown', () => {
            addDestination(result.display_name, result.lat, result.lon);
            $destinationInput.value = '';
            $destinationResults.classList.add('hidden');
          });
          $destinationResults.appendChild(li);
        });
      }
      $destinationResults.classList.remove('hidden');
    },
    renderSongResults(results) {
      $songResults.innerHTML = '';
      if (results.length === 0) {
        $songResults.innerHTML = '<div class="p-3 text-gray-500">No songs found.</div>';
      } else {
        results.forEach(song => {
          const li = document.createElement('div');
          li.className = 'p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100';
          li.innerHTML = `
            <p class="font-medium">${song.title}</p>
            <p class="text-sm text-gray-500">${song.artist}</p>
          `;
          // Use mousedown to register click before blur hides the box
          li.addEventListener('mousedown', () => {
            addSong(song);
            $songInput.value = '';
            $songResults.classList.add('hidden');
          });
          $songResults.appendChild(li);
        });
      }
      $songResults.classList.remove('hidden');
    },
    addDestination(name, lat, lon) {
      // Simplify name
      const simpleName = name.split(',')[0];
      destinations.push({ name: simpleName, lat: lat, lng: lon });
      renderDestinations();
      updateRoute();
      showMessage(`Added ${simpleName} to trip!`, 'success');
    },
    removeDestination(index) {
      const removed = destinations.splice(index, 1);
      renderDestinations();
      updateRoute();
      showMessage(`Removed ${removed[0].name}.`, 'info');
    },
    addSong(song) {
      songs.push(song);
      renderSongs();
      updateDurations();
      showMessage(`Added ${song.title}!`, 'success');
    },
    removeSong(index) {
      const removed = songs.splice(index, 1);
      renderSongs();
      updateDurations();
      showMessage(`Removed ${removed[0].title}.`, 'info');
    },
    renderDestinations() {
      $destinationList.innerHTML = '';
      destinations.forEach((dest, index) => {
        const li = document.createElement('li');
        li.className = 'destination-list-item';

        // Add start/end classes
        if (index === 0) li.classList.add('is-start');
        if (index === destinations.length - 1) li.classList.add('is-end');

        li.innerHTML = `
          <div class="destination-main">
            <span class="destination-name">${dest.name}</span>
          </div>
          <button onclick="removeDestination(${index})" class="remove-btn" aria-label="remove">
            ${CloseIcon}
          </button>
        `;
        $destinationList.appendChild(li);
      });

      // Summary Population
      if (destinations.length >= 2) {
        $summaryTripStart.textContent = destinations[0].name;
        $summaryTripEnd.textContent = destinations[destinations.length - 1].name;
        const stops = destinations.length - 2;
        $summaryTripStops.textContent = stops === 0 ? 'No intermediate stops' : `${stops} stop${stops > 1 ? 's' : ''}`;
      } else if (destinations.length === 1) {
        $summaryTripStart.textContent = destinations[0].name;
        $summaryTripEnd.textContent = '...';
        $summaryTripStops.textContent = 'Add destination';
      } else {
        // Clear summary if no destinations
        $summaryTripStart.textContent = 'None';
        $summaryTripEnd.textContent = 'None';
        $summaryTripStops.textContent = 'No trip planned';
        $summaryTripDuration.textContent = 'Duration: 0h 0m';
      }

      // Show trip summary
      if (destinations.length >= 2) {
        $tripSummary.classList.remove('hidden');
      } else {
        $tripSummary.classList.add('hidden');
        totalTripTime = 0; // Reset time if not enough points
        updateDurations();
      }

      // Update collapse state
      toggleCollapse('trip', true); // Force open on add
    },
    renderSongs() {
      $songList.innerHTML = '';
      songs.forEach((song, index) => {
      const li = document.createElement('li');
        li.className = 'song-list-item';
        li.innerHTML = `
          <div class="song-main">
            <p class="song-title">${song.title}</p>
            <p class="song-artist">${song.artist}</p>
          </div>
          <div class="song-meta">
            <span class="song-duration">${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</span>
            <button onclick="removeSong(${index})" class="remove-btn" aria-label="remove-song">
              ${CloseIcon}
            </button>
          </div>
        `;
        $songList.appendChild(li);
      });

      // Summary Population
      $summaryTraxCount.textContent = songs.length === 0 ? 'No songs added' : `${songs.length} song${songs.length > 1 ? 's' : ''}`;

      $traxSummary.classList.remove('hidden');
      $playlistCreator.classList.remove('hidden');
    },
    updateRoute() {
      if (destinations.length < 2) {
        routingControl.setWaypoints([]);
        return;
      }
      const waypoints = destinations.map(d => L.latLng(d.lat, d.lng));
      routingControl.setWaypoints(waypoints);
    },
    formatTime(seconds) {
      if (seconds < 0) seconds = 0;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h} hour${h !== 1 ? 's' : ''} ${m} Minute${m !== 1 ? 's' : ''}`;
    },
    updateDurations() {
      // Update Trip Duration
      const tripTimeFormatted = formatTime(totalTripTime);
      $tripDuration.textContent = tripTimeFormatted;
      $summaryTripDuration.textContent = `Duration: ${tripTimeFormatted}`;

      // Update Playlist / Remaining Duration
      const totalPlaylistTime = songs.reduce((acc, song) => acc + song.duration, 0);
      const remainingTime = totalTripTime - totalPlaylistTime;

      const remainingTimeFormatted = formatTime(remainingTime);
      $playlistRemaining.textContent = remainingTimeFormatted;
      $summaryTraxRemaining.textContent = remainingTimeFormatted;

      if (remainingTime < 0) {
        $playlistRemaining.classList.remove('remaining-time', 'success');
        $playlistRemaining.classList.add('danger');
        $summaryTraxRemaining.classList.remove('remaining-time', 'success');
        $summaryTraxRemaining.classList.add('danger');
      } else if (totalTripTime > 0 && remainingTime < (totalTripTime * 0.1)) { // Within 10%
        $playlistRemaining.classList.remove('remaining-time', 'danger');
        $playlistRemaining.classList.add('success');
        $summaryTraxRemaining.classList.remove('remaining-time', 'danger');
        $summaryTraxRemaining.classList.add('success');
      } else {
        $playlistRemaining.classList.remove('success', 'danger');
        $playlistRemaining.classList.add('remaining-time');
        $summaryTraxRemaining.classList.remove('success', 'danger');
        $summaryTraxRemaining.classList.add('remaining-time');
      }

      // Update create button state
      $createPlaylistBtn.disabled = !activeSource || songs.length === 0 || !$playlistNameInput.value;
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

      // const content = $(`#${section}-content`);
      // const chevron = $(`#${section}-chevron`);
      // const summary = $(`#${section}-collapsed-summary`);

      // let shouldBeOpen;

      // if (forceOpen !== null) {
      //   shouldBeOpen = forceOpen;
      // } else {
      //   shouldBeOpen = content.classList.contains('collapsed');
      // }

      // if (shouldBeOpen) {
      //   // Open it
      //   content.classList.remove('collapsed');
      //   chevron.style.transform = 'rotate(0deg)';
      //   if (summary) summary.classList.add('hidden'); // Hide summary
      // } else {
      //   // Close it
      //   content.classList.add('collapsed');
      //   chevron.style.transform = 'rotate(180deg)';

      //   // Show summary IF data exists
      //   if (summary) {
      //     let hasData = false;
      //     if (section === 'trip' && destinations.length > 0) hasData = true;
      //     if (section === 'trax' && songs.length > 0) hasData = true;
      //     if (section === 'source') hasData = false; // Never show summary for source

      //     if (hasData) {
      //       summary.classList.remove('hidden');
      //     }
      //   }
      // }
    },
    mockAuth(source) {
      // Reset all buttons to their default (inactive) state
      $(`#auth-spotify`).classList.remove('bg-green-500', 'text-white');
      $(`#auth-spotify`).classList.add('bg-gray-100', 'text-green-500');

      $(`#auth-apple`).classList.remove('bg-black', 'text-white');
      $(`#auth-apple`).classList.add('bg-gray-100', 'text-gray-800');

      $(`#auth-youtube`).classList.remove('bg-red-500', 'text-white');
      $(`#auth-youtube`).classList.add('bg-gray-100', 'text-red-500');

      // Set the clicked button to the active (brand color) state
      if (source === 'spotify') {
        $(`#auth-spotify`).classList.remove('bg-gray-100', 'text-green-500');
        $(`#auth-spotify`).classList.add('bg-green-500', 'text-white');
      } else if (source === 'apple') {
        $(`#auth-apple`).classList.remove('bg-gray-100', 'text-gray-800');
        $(`#auth-apple`).classList.add('bg-black', 'text-white');
      } else if (source === 'youtube') {
        $(`#auth-youtube`).classList.remove('bg-gray-100', 'text-red-500');
        $(`#auth-youtube`).classList.add('bg-red-500', 'text-white');
      }

      activeSource = source;

      $songInput.disabled = false;
      $songInput.placeholder = `Search ${source.charAt(0).toUpperCase() + source.slice(1)}...`;
      showMessage(`Connected to ${source}! You can now search for songs.`, 'success');
      toggleCollapse('trax', true);
    },
    createPlaylist() {
      const playlistName = $playlistNameInput.value;
      if (!playlistName) {
        showMessage('Please enter a playlist name.', 'error');
        return;
      }
      if (songs.length === 0) {
        showMessage('Add some songs to your playlist first.', 'error');
        return;
      }
      if (!activeSource) {
        showMessage('Please connect a music source first.', 'error');
        return;
      }

      // Mock success
      console.log(`Creating playlist "${playlistName}" on ${activeSource} with ${songs.length} songs.`);
      showMessage(`Successfully created playlist "${playlistName}"!`, 'success');

      // Optionally reset part of the state
      songs = [];
      renderSongs();
      updateDurations();
      $playlistNameInput.value = '';
    },
    signout() {
      // Reset state
      destinations = [];
      songs = [];
      activeSource = null;
      totalTripTime = 0;

      // Reset UI
      renderDestinations();
      renderSongs();
      updateDurations();
      $playlistCreator.classList.add('hidden');
      $traxSummary.classList.add('hidden');
      $tripSummary.classList.add('hidden');

      $songInput.disabled = true;
      $songInput.placeholder = 'Connect a source first...';

      // Reset auth buttons
      mockAuth(null);

      // Reset map
      routingControl.setWaypoints([]);
      map.setView([38.9072, -77.0369], 8);

      // Reset summaries
      $tripCollapsedSummary.classList.add('hidden');
      $traxCollapsedSummary.classList.add('hidden');

      showMessage('Signed out and reset applicaton.', 'info');
    },
    showMessage(message, type = 'info') {
      $messageText.textContent = message;

      // Remove all type classes
      $messageBox.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');

      // Add the correct type class
      if (type === 'success') {
        $messageBox.classList.add('bg-green-500');
      } else if (type === 'error') {
        $messageBox.classList.add('bg-red-500');
      } else {
        $messageBox.classList.add('bg-blue-500');
      }

      // Show and hide
      clearTimeout(messageTimer);
      $messageBox.classList.remove('hidden');
      $messageBox.classList.add('show');

      messageTimer = setTimeout(() => {
        $messageBox.classList.remove('show');
        // Wait for transition to finish before hiding
        setTimeout(() => $messageBox.classList.add('hidden'), 500);
      }, 3000);
    },
  }
}
</script>

<style>
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
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

/* Collapsible Section Styling (nested) */
.collapsible-content {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;

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
  padding-left: calc(var(--dot-left) + var(--dot-size) + 12px); /* space for dot + gap */
  min-height: 48px;
  background: var(--color-bg-offset);
  color: var(--color-fg);
  border-radius: 0.5rem;
  padding: 0.75rem;

  /* pseudo elements grouped under the item */
  &::after,
  &:not(:last-child)::before {
    content: '';
    position: absolute;
  }

  /* vertical dotted line */
  &:not(:last-child)::before {
    left: var(--dot-line-left);
    top: 32px;
    bottom: -8px;
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
    top: var(--dot-left);
    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    background-color: var(--dot-color-default);
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px var(--dot-color-default);
    z-index: 1;
  }

  /* modifiers */
  &.is-start::after {
    background-color: var(--tone-play);
    box-shadow: 0 0 0 2px var(--tone-play);
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
}

.remove-icon {
  color: var(--tone-delete);
  font-size: 1.25rem;
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
