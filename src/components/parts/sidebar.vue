<template>
  <div id="sidebar" class="sidebar">
    <header class="sidebar-header">
      <div class="branding-wrap">
        <Icon name="logo_full" />
      </div>
      <button
        class="sidebar-header--btn"
        aria-label="collapse"
        @click="toggleSidebar"
      >
        <Icon name="Arrow-Left" class="icon" />
      </button>
    </header>

    <div class="sidebar-content">
      <!-- Trip Section -->
      <div class="section">
        <div class="section-header" @click="toggleCollapse('trip')">
          <h2 class="section-title">Trip</h2>
          <Icon
            name="Chevron-up"
            :class="{ 'is-collapsed': collapseTrips }"
          />
        </div>
        <!-- Trip Collapsed Summary -->
        <div v-if="collapseTrips" class="collapsed-summary">
          <p class="summary-row">
            <Icon name="Checkmark" class="start-icon" />
            <span class="summary-text">{{ tripStartLocation }}</span>
          </p>
          <p class="summary-row">
            <Icon name="Close" class="end-icon" />
            <span class="summary-text">{{ tripEndLocation }}</span>
          </p>
          <p class="summary-indent">
            <span class="summary-stops">{{ tripStopsText }}</span>
          </p>
          <p class="summary-indent">
            <span class="summary-duration">Duration: {{ formattedTripTime }}</span>
          </p>
        </div>

        <div v-show="!collapseTrips" class="collapsible-content">
          <div class="search-wrap">
            <Icon name="Search" class="search-icon" />
            <input
              v-model="destinationQuery"
              type="text"
              placeholder="Add Destination"
              class="search-input"
            />
            <div
              v-if="destSearchResults.length > 0"
              class="autocomplete-results"
            >
              <ul>
                <li
                  v-for="(result, index) in destSearchResults"
                  :key="index"
                  class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                  @mousedown="selectDestination(result)"
                >
                  {{ result.display_name }}
                </li>
              </ul>
            </div>
          </div>
          <ul class="destination-list">
            <li
              v-for="(dest, index) in destinations"
              :key="index"
              class="destination-list-item"
              :class="{
                'is-start': index === 0,
                'is-end': index === destinations.length - 1 && destinations.length > 1,
              }"
            >
              <div class="destination-main">
                <span class="destination-name">{{ dest.name }}</span>
              </div>
              <button
                @click="removeDestination(index)"
                class="remove-btn"
                aria-label="remove"
              >
                <Icon name="Close" class="remove-icon" />
              </button>
            </li>
          </ul>
          <div v-if="destinations.length >= 2" class="trip-summary">
            Total Trip duration
            <span class="trip-duration-pill">{{ formattedTripTime }}</span>
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
            <button
              @click="selectSource('spotify')"
              class="auth-btn auth-spotify"
              :class="{ 'is-active': activeSource === 'spotify' }"
            >
              <Icon name="Spotify" class="logo" />
            </button>
            <button
              @click="selectSource('apple')"
              class="auth-btn auth-apple"
              :class="{ 'is-active': activeSource === 'apple' }"
            >
              <Icon name="AppleMusic" class="logo" />
            </button>
            <button
              @click="selectSource('youtube')"
              class="auth-btn auth-youtube"
              :class="{ 'is-active': activeSource === 'youtube' }"
            >
              <Icon name="YouTube" class="logo" />
            </button>
          </div>
        </div>
      </div>

      <!-- Trax Section -->
      <div class="section">
        <div class="section-header" @click="toggleCollapse('trax')">
          <h2 class="section-title">Trax</h2>
          <Icon
            name="Chevron-up"
            :class="{ 'is-collapsed': collapseTrax }"
          />
        </div>

        <!-- Trax Collapsed Summary -->
        <div v-if="collapseTrax" class="collapsed-summary">
          <p>
            <span class="summary-text">{{ songs.length }} song{{ songs.length !== 1 ? 's' : '' }}</span>
          </p>
          <p>
            Remaining:
            <span class="remaining-time" :class="remainingTimeClass">{{ formattedRemainingTime }}</span>
          </p>
        </div>

        <div v-show="!collapseTrax" class="collapsible-content">
          <div class="search-wrap">
            <Icon name="Search" class="search-icon" />
            <input
              v-model="songQuery"
              type="text"
              :placeholder="songSearchPlaceholder"
              class="search-input"
              :disabled="!activeSource"
            />
            <div
              v-if="songSearchResults.length > 0"
              class="autocomplete-results"
            >
              <ul>
                <li
                  v-for="(song, index) in songSearchResults"
                  :key="index"
                  class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                  @mousedown="selectSong(song)"
                >
                  <p class="font-medium">{{ song.title }}</p>
                  <p class="text-sm text-gray-500">{{ song.artist }}</p>
                </li>
              </ul>
            </div>
          </div>
          <ul class="song-list">
            <li
              v-for="(song, index) in songs"
              :key="index"
              class="song-list-item"
            >
              <div class="song-main">
                <p class="song-title">{{ song.title }}</p>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <div class="song-meta">
                <span class="song-duration">{{
                  formatDuration(song.duration)
                }}</span>
                <button
                  @click="removeSong(index)"
                  class="remove-btn"
                  aria-label="remove-song"
                >
                  <Icon name="Close" class="remove-icon" />
                </button>
              </div>
            </li>
          </ul>
          <div v-if="songs.length > 0" class="trax-summary">
            Remaining Time
            <span class="remaining-time" :class="remainingTimeClass">{{ formattedRemainingTime }}</span>
          </div>
        </div>
      </div>

      <!-- Playlist Creation Section -->
      <div v-if="songs.length > 0" class="playlist-creator">
        <input
          v-model="playlistName"
          type="text"
          id="playlist-name"
          placeholder="Playlist Name"
          class="search-input"
        />
        <button
          id="create-playlist-btn"
          class="btn-primary wide"
          @click="createPlaylist"
          :disabled="!isPlaylistCreatable"
        >
          Create Playlist
        </button>
      </div>
    </div>
    <!-- /flex-grow -->

    <footer class="app-footer">
      <button class="btn-danger wide" @click="signout">
        Sign Out & Restart
      </button>
      <p class="footer-note">© 2025 TripTrax. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import Icon from '../Icon.vue'; // Adjusted path

export default {
  name: 'Sidebar',
  components: { Icon },
  props: {
    totalTripTime: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:destinations', 'toggle-sidebar', 'show-toast'],

  data() {
    return {
      // Collapse state
      collapseTrips: false,
      collapseTrax: false,
      collapseSidebar: false,

      // Trip Data
      destinationQuery: '',
      destSearchResults: [],
      searchDebounce: null,
      destinations: [],

      // Trax Data
      songs: [],
      activeSource: null,
      songQuery: '',
      songSearchDebounce: null,
      songSearchResults: [],

      // Other State
      playlistName: '',

      mockSongs: [
        { title: 'Take Me Home, Country Roads', artist: 'John Denver', duration: 188 },
        { title: 'Hotel California', artist: 'Eagles', duration: 391 },
        { title: 'Bohemian Rhapsody', artist: 'Queen', duration: 354 },
        { title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: 482 },
        { title: 'Running on Empty', artist: 'Jackson Browne', duration: 299 },
        { title: 'Life is a Highway', artist: 'Tom Cochrane', duration: 266 },
        { title: 'Here I Go Again', artist: 'Whitesnake', duration: 275 },
      ],
    };
  },

  computed: {
    tripStartLocation() {
      return this.destinations.length > 0 ? this.destinations[0].name : 'None';
    },
    tripEndLocation() {
      return this.destinations.length > 1
        ? this.destinations[this.destinations.length - 1].name
        : '...';
    },
    tripStopsText() {
      const stops = this.destinations.length - 2;
      if (stops < 0) return 'No trip planned';
      if (stops === 0) return 'No intermediate stops';
      return `${stops} stop${stops > 1 ? 's' : ''}`;
    },
    formattedTripTime() {
      return this.formatTime(this.totalTripTime);
    },
    songSearchPlaceholder() {
      if (!this.activeSource) {
        return 'Connect a source first...';
      }
      return `Search ${
        this.activeSource.charAt(0).toUpperCase() + this.activeSource.slice(1)
      }...`;
    },
    totalSongTime() {
      return this.songs.reduce((acc, song) => acc + song.duration, 0);
    },
    remainingTime() {
      return this.totalTripTime - this.totalSongTime;
    },
    formattedRemainingTime() {
      return this.formatTime(this.remainingTime);
    },
    remainingTimeClass() {
      if (this.remainingTime < 0) {
        return 'danger';
      }
      if (
        this.totalTripTime > 0 &&
        this.remainingTime < this.totalTripTime * 0.1
      ) {
        return 'success';
      }
      return 'remaining-time';
    },
    isPlaylistCreatable() {
      return this.activeSource && this.songs.length > 0 && this.playlistName.length > 0;
    },
  },

  watch: {
    destinationQuery(query) {
      this.destSearchResults = [];
      if (query.length < 3) {
        return;
      }
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.searchNominatim(query);
      }, 300);
    },
    destinations: {
      handler() {
        this.$emit('update:destinations', this.destinations);
      },
      deep: true,
    },
    songQuery(query) {
      this.songSearchResults = [];
      if (query.length < 3 || !this.activeSource) {
        return;
      }
      clearTimeout(this.songSearchDebounce);
      this.songSearchDebounce = setTimeout(() => {
        this.searchSongs(query);
      }, 300);
    },
  },

  methods: {
    // --- Trip Methods ---
    async searchNominatim(query) {
      const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5`;
      try {
        const response = await fetch(endpoint, {
          headers: { 'Accept-Language': 'en' },
        });
        const data = await response.json();
        this.destSearchResults = data;
      } catch (error) {
        console.error('Error fetching from Nominatim:', error);
        this.$emit('show-toast', {
          message: 'Error searching for location.',
          type: 'error',
        });
      }
    },

    selectDestination(result) {
      // This is the key: we explicitly use the 'result' object
      this.addDestination(result.address, result.lat, result.lon);
      console.log(result)
      // Then we clear the query and results
      this.destinationQuery = '';
      this.destSearchResults = [];
    },

    addDestination(name, lat, lon) {
      // This method uses the 'name' passed from 'selectDestination'
      // const simpleName = name.split(',')[0];
      const listName = (name.house_number ? (name.house_number + ' ') : '') + (name.road || name.city || name.census || name.railway) + ', ' + name.state;
      this.destinations.push({
        name: listName,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      });
      console.log(name)
      console.log('showing toast from sidebar');
      this.$emit('show-toast', {
        message: `Added ${listName} to trip!`,
        type: 'success',
      });
    },

    removeDestination(index) {
      const removed = this.destinations.splice(index, 1);
      this.$emit('show-toast', {
        message: `Removed ${removed[0].name}.`,
        type: 'info',
      });
    },

    // --- Trax Methods ---
    searchSongs(query) {
      const lowerQuery = query.toLowerCase();
      this.songSearchResults = this.mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerQuery) ||
          song.artist.toLowerCase().includes(lowerQuery)
      );
    },

    selectSong(song) {
      this.addSong(song);
      this.songQuery = '';
      this.songSearchResults = [];
    },

    addSong(song) {
      this.songs.push(song);
      this.$emit('show-toast', {
        message: `Added ${song.title}!`,
        type: 'success',
      });
    },

    removeSong(index) {
      const removed = this.songs.splice(index, 1);
      this.$emit('show-toast', {
        message: `Removed ${removed[0].title}.`,
        type: 'info',
      });
    },

    // --- Source Methods ---
    selectSource(source) {
      if (this.activeSource === source) {
        this.activeSource = null;
      } else {
        this.activeSource = source;
        this.$emit('show-toast', {
          message: `Connected to ${source}! You can now search for songs.`,
          type: 'success',
        });
        this.collapseTrax = false;
      }
    },

    // --- General UI Methods ---
    toggleCollapse(section) {
      switch (section) {
        case 'trip':
          this.collapseTrips = !this.collapseTrips;
          break;
        case 'trax':
          this.collapseTrax = !this.collapseTrax;
          break;
      }
    },

    toggleSidebar() {
      this.collapseSidebar = !this.collapseSidebar;
      this.$emit('toggle-sidebar', this.collapseSidebar);
    },

    // --- Playlist & Signout ---
    createPlaylist() {
      if (!this.isPlaylistCreatable) return;

      console.log(
        `Creating playlist "${this.playlistName}" on ${this.activeSource} with ${this.songs.length} songs.`
      );
      this.$emit('show-toast', {
        message: `Successfully created playlist "${this.playlistName}"!`,
        type: 'success',
      });

      this.songs = [];
      this.playlistName = '';
    },

    signout() {
      this.destinations = [];
      this.songs = [];
      this.activeSource = null;
      this.playlistName = '';
      this.collapseTrips = false;
      this.collapseTrax = false;

      this.$emit('show-toast', {
        message: 'Signed out and reset applicaton.',
        type: 'info',
      });
    },

    // --- Utilities ---
    formatTime(seconds) {
      if (seconds < 0) seconds = 0;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    },

    formatDuration(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },
  },
};
</script>

<style>
@import '../../corevar.css';

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

</style>