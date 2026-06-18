<!-- RollContainer.vue -->
<template>
  <div class="roll-container" :style="containerStyle" :class="{ ready: isMounted }">
    <div
      class="roll-header"
      :style="{ color: color }"
      :class="{ pressing }"
      @click="toggle"
      @mousedown="pressing = true"
      @mouseup="pressing = false"
      @mouseleave="pressing = false"
      @touchstart="pressing = true"
      @touchend="pressing = false"
    >
      <slot name="header" />
      <svg style="margin-right: 15px;" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline
          :points="isCollapsed ? '3,6 9,12 15,6' : '3,12 9,6 15,12'"
          :stroke="chevronColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="roll-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  height: {
    type: String,
    default: '700px'
  },
  headerHeight: {
    type: String,
    default: '48px'
  },
  background: {
    type: String,
    default: '#fff'
  },
  borderRadius: {
    type: String,
    default: '20px'
  },
  borderColor: {
    type: String,
    default: 'rgba(0,0,0,0.07)'
  },
  color: {
    type: String,
    default: '#3a3a3a'
  },
  chevronColor: {
    type: String,
    default: '#888'
  },
  breakpoint: {
    type: Number,
    default: 1295
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'collapse', 'expand'])

const isCollapsed = ref(false)
const isMounted = ref(false)
const pressing = ref(false)
let wasSmall = false

if (props.modelValue !== null) {
  isCollapsed.value = props.modelValue
} else {
  isCollapsed.value = props.defaultCollapsed
}

const containerStyle = computed(() => ({
  height: isCollapsed.value ? props.headerHeight : props.height,
  backgroundColor: props.background,
  borderRadius: props.borderRadius,
  border: `1px solid ${props.borderColor}`,
}))

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
  emit('update:modelValue', isCollapsed.value)
  emit(isCollapsed.value ? 'collapse' : 'expand')
}

const checkMedia = () => {
  const isSmall = window.innerWidth <= props.breakpoint
  if (isSmall && !wasSmall) {
    isCollapsed.value = true
    emit('update:modelValue', true)
    emit('collapse')
  } else if (!isSmall && wasSmall) {
    isCollapsed.value = false
    emit('update:modelValue', false)
    emit('expand')
  }
  wasSmall = isSmall
}

onMounted(async () => {
  wasSmall = window.innerWidth <= props.breakpoint
  if (props.modelValue === null) {
    isCollapsed.value = wasSmall || props.defaultCollapsed
  }
  window.addEventListener('resize', checkMedia)
  await nextTick()
  setTimeout(() => {
    isMounted.value = true
  }, 50)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMedia)
})
</script>

<style scoped>
  .roll-container {
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .roll-container.ready {
    transition: height 0.4s ease;
  }

  .roll-header {
    font-family: 'Bungee', sans-serif;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    user-select: none;
    height: v-bind(headerHeight);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    cursor: pointer;
    padding: 0 10px;
    gap: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    transition: background 0.15s ease, font-size 0.12s ease, opacity 0.12s ease;
  }

  .roll-header:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .roll-header.pressing {
    font-size: 0.9em;
    background: rgba(0, 0, 0, 0.04);
  }

  .roll-header.pressing svg {
    width: 14px;
    height: 14px;
  }

  .roll-body {
    width: 100%;
    padding: 20px;
    height: calc(100% - v-bind(headerHeight));
    overflow: hidden;
  }
</style>