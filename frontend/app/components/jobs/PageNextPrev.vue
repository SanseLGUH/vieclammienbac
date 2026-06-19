<template>
  <div class="pagenextprev-container">
    <button
      class="nav-btn"
      :disabled="current === 1"
      @click="current > 1 && current--"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline points="10,3 5,8 10,13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="pages">
		<button
		  v-for="page in visiblePages"
		  :key="page"
		  class="page-btn"
		  :class="{ active: page === current, dots: page === '...' }"
		  :disabled="page === '...'"
		  @click="page !== '...' && (current = page)"
		>
		  <template v-if="page === '...'">
		    <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
		      <circle cx="2" cy="2" r="1.5" :fill="dotsColor"/>
		      <circle cx="8" cy="2" r="1.5" :fill="dotsColor"/>
		      <circle cx="14" cy="2" r="1.5" :fill="dotsColor"/>
		    </svg>
		  </template>
		  <template v-else>
		    {{ page }}
		  </template>
		</button>
    </div>

    <button
      class="nav-btn"
      :disabled="current === total"
      @click="current < total && current++"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline points="6,3 11,8 6,13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
	import { ref, computed, watch } from 'vue'

	const props = defineProps({
	  total: {
	    type: Number,
	    default: 1
	  },
	  modelValue: {
	    type: Number,
	    default: 1
	  },
	  activeColor: {
	    type: String,
	    default: '#3a3a3a'
	  },
	  color: {
	    type: String,
	    default: '#1d1d1d'
	  },
	  hoverColor: {
	    type: String,
	    default: '#fff'
	  },
	  hoverBg: {
	    type: String,
	    default: '#3a3a3a'
	  },
	  dotsColor: {
	    type: String,
	    default: '#aaaaaa'
	  },
	  navColor: {
	    type: String,
	    default: '#1d1d1d'
	  }
	})

	const emit = defineEmits(['update:modelValue'])

	const current = ref(props.modelValue)

	// emit to parent when current changes
	watch(current, (val) => emit('update:modelValue', val))

	// sync from parent when modelValue changes (fixes two components sharing same ref)
	watch(() => props.modelValue, (val) => {
	  if (val !== current.value) current.value = val
	})

	const visiblePages = computed(() => {
	  const pages = []
	  const t = props.total
	  const c = current.value

	  if (t <= 7) {
	    for (let i = 1; i <= t; i++) pages.push(i)
	    return pages
	  }

	  pages.push(1)
	  if (c > 3) pages.push('...')

	  const start = Math.max(2, c - 1)
	  const end = Math.min(t - 1, c + 1)
	  for (let i = start; i <= end; i++) pages.push(i)

	  if (c < t - 2) pages.push('...')
	  pages.push(t)

	  return pages
	})
</script>

<style scoped>
	.pagenextprev-container {
	  display: inline-flex;
	  align-items: center;
	  gap: 2px;
	  border-radius: 10px;
	  padding: 8px 10px;
	  user-select: none;
	}

	.pages {
	  display: flex;
	  align-items: center;
	  gap: 2px;
	}

	.page-btn {
	  min-width: 36px;
	  width: 36px;
	  height: 36px;
	  border-radius: 50%;
	  border: none;
	  background: transparent;
	  color: v-bind(color);
	  font-size: 0.85rem;
	  cursor: pointer;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}

	.page-btn:hover:not(.active):not(.dots) {
	  background: v-bind(hoverBg);
	  color: v-bind(hoverColor);
	  transition: background 0.15s, color 0.15s;
	}

	.page-btn.active {
	  background: v-bind(activeColor);
	  color: #fff;
	  font-weight: 700;
	  transition: background 0.15s, color 0.15s;
	}

	.page-btn.dots {
	  cursor: default;
	  color: v-bind(dotsColor);
	  min-width: 20px;
	  width: 20px;
	}

	.nav-btn {
	  width: 32px;
	  height: 32px;
	  border-radius: 8px;
	  border: none;
	  background: transparent;
	  color: v-bind(navColor);
	  cursor: pointer;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  transition: color 0.15s;
	}

	.nav-btn:hover:not(:disabled) {
	  color: v-bind(hoverColor);
	}

	.nav-btn:disabled {
	  opacity: 0.2;
	  cursor: not-allowed;
	}
</style>