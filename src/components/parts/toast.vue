<template>
  <div class="toast"
    v-if="visible"
    :class="{ 
      'success': type === 'success',
      'error': type === 'error',
      'info': type === 'info'
    }"
  >
    <span>{{ message }}</span>
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

      console.log('toast triggered', message, type);

      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.visible = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
@import '../../corevar.css';

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: top 0.4s ease-in-out;
  z-index: 9999;

  &.success {
    background-color: #38a169; /* Green */
  }
  &.error {
    background-color: #e53e3e; /* Red */
  }
  &.info {
    background-color: #3182ce; /* Blue */
  }
}

</style>