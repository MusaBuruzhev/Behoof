<template>
  <div v-if="message" class="toast" :class="`toast-${type}`">
    <div class="toast-content">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
    <button @click="close" class="toast-close">✕</button>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info', 'warning', 'heart'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      timeout: null
    };
  },
  computed: {
    icon() {
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
        heart: '❤️'
      };
      return icons[this.type] || '✓';
    }
  },
  watch: {
    message(newVal) {
      if (newVal) {
        this.startTimer();
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
      clearTimeout(this.timeout);
    },
    startTimer() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  mounted() {
    if (this.message) {
      this.startTimer();
    }
  },
  beforeUnmount() {
    clearTimeout(this.timeout);
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  min-width: 300px;
  max-width: 500px;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.toast-success {
  background-color: #4caf50;
  color: white;
}

.toast-error {
  background-color: #f44336;
  color: white;
}

.toast-info {
  background-color: #2196f3;
  color: white;
}

.toast-warning {
  background-color: #ff9800;
  color: white;
}

.toast-heart {
  background-color: #e91e63;
  color: white;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}
</style>
