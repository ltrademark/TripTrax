<template>
  <span class="icon" v-html="svgContent"></span>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      svgContent: ''
    }
  },
  watch: {
    name: {
      immediate: true,
      handler: 'loadIcon'
    }
  },
  methods: {
    async loadIcon() {
      try {
        const icon = await import(`../Icons/${this.name}.svg?raw`);
        this.svgContent = icon.default;
      } catch (error) {
        console.error(`Failed to load icon: ${this.name}`, error);
        this.svgContent = '';
      }
    }
  }
}
</script>

<style>
.icon {
  display: block;
  width: auto;
  height: 1em;
  color: inherit;
  font-size: inherit;
  line-height: 1;
  
  & svg {
    width: 100%;
    height: 100%;

    & .ltm-st {
      stroke: currentColor;
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    & .ltm-fl {
      fill: currentColor;
    }
  }
}
</style>