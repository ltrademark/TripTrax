<template>
  <div 
    id="message-box" 
    class="px-4 py-3 rounded-lg text-white font-medium"
    :class="{ 
      'show': visible,
      'bg-green-500': type === 'success',
      'bg-red-500': type === 'error',
      'bg-blue-500': type === 'info'
    }"
  >
    <span id="message-text">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      message: '',
      type: 'info',
      timer: null,
    };
  },
  methods: {
    show(message, type = 'info') {
      this.message = message;
      this.type = type;
      this.visible = true;

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.visible = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the Toast component */
#message-box {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  transition: top 0.4s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

#message-box.show {
  top: 20px;
}
</style>