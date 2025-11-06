<template>
  <div>
    <Toast ref="toast" />
    <Sidebar 
      @update:destinations="onDestinationsChange" 
      :total-trip-time="totalTripTime"
    />
    <Map
      :destinations="destinations"
      @update:totalTripTime="onTimeChange"
    />
  </div>
</template>

<script>
import Icon from './components/Icon.vue'
import Sidebar from './components/parts/sidebar.vue' 
import Toast from './components/parts/toast.vue'
import Map from './components/parts/map.vue'
import L from 'leaflet'

export default {
  name: 'App',
  components: { Sidebar, Icon, Toast, Map },
  
  data() {
    return {
      destinations: [],
      totalTripTime: 0,
    };
  },

  mounted() {},
  methods: {
    // Called by Sidebar
    showToast({ message, type }) {
      this.$refs.toast.show(message, type);
    },

    // Called by Sidebar
    onDestinationsChange(newDestinations) {
      this.destinations = newDestinations;
    },

    // Called by Map
    onTimeChange(newTime) {
      this.totalTripTime = newTime;
    },
  },
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

</style>