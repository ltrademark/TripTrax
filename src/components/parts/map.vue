<template>
  <div id="map" style="height: 100vh; width: 100%; z-index: 10"></div>
</template>

<script>
import L from 'leaflet';

export default {
  name: 'Map',
  props: {
    destinations: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:totalTripTime'],
  data() {
    return {
      map: null,
      routingControl: null,
    };
  },
  mounted() {
    this.map = L.map('map').setView([38.9072, -77.0369], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: 'var(--tone-trip)', opacity: 0.8, weight: 6 }],
      },
    }).addTo(this.map);

    this.routingControl.on('routesfound', (e) => {
      const routes = e.routes;
      if (routes.length > 0) {
        // Emit the total time up to the parent (App.vue)
        this.$emit('update:totalTripTime', routes[0].summary.totalTime);
      }
    });

    // Initial route update in case there's pre-loaded data (though unlikely here)
    this.updateRoute();
  },
  watch: {
    // Watch for changes to the destinations prop
    destinations: {
      handler() {
        this.updateRoute();
      },
      deep: true,
    },
  },
  methods: {
    updateRoute() {
      if (!this.routingControl) return;

      if (this.destinations.length < 2) {
        this.routingControl.setWaypoints([]);
        this.$emit('update:totalTripTime', 0); // Reset time
        return;
      }
      
      const waypoints = this.destinations.map((d) => L.latLng(d.lat, d.lng));
      this.routingControl.setWaypoints(waypoints);
    },
  },
};
</script>

<style>
#map {
  height: 100vh;
  width: 100%;
  z-index: 10;
}
.leaflet-routing-container {
  display: none;
}
</style>