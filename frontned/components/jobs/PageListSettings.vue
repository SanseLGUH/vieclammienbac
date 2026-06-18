<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  sort: {
    type: String,
    default: 'recomendation'
  },
  view: {
    type: Number,
    default: 20
  },
  sortOptions: {
    type: Array,
    default: () => [
      { label: 'Relevance', value: 'relevance' },
      { label: 'Closest', value: 'closest' },
      { label: 'Recomendation', value: 'recomendation' },
      { label: 'Newest', value: 'newest' },
      { label: 'Oldest', value: 'oldest' }
    ]
  },
  viewOptions: {
    type: Array,
    default: () => [10, 20, 50]
  }
})

const emit = defineEmits(['update:sort', 'update:view'])

const sortOpen = ref(false)
const viewOpen = ref(false)

const selectedSort = ref(props.sort)
const selectedView = ref(props.view)

/* sync when parent changes */
watch(() => props.sort, v => selectedSort.value = v)
watch(() => props.view, v => selectedView.value = v)

/* update parent */
function selectSort(option) {
  selectedSort.value = option.value
  emit('update:sort', option.value)
  sortOpen.value = false
}

function selectView(option) {
  selectedView.value = option
  emit('update:view', option)
  viewOpen.value = false
}
</script>

<template>
  <div class="pagelistsettings-container">

    <div class="dropdown" @click="sortOpen = !sortOpen">
      <span>
        Sort by:
        {{ sortOptions.find(o => o.value === selectedSort)?.label }}
      </span>

      <div v-if="sortOpen" class="menu">
        <div
          v-for="option in sortOptions"
          :key="option.value"
          class="item"
          @click.stop="selectSort(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>

    <div class="dropdown" @click="viewOpen = !viewOpen">
      <span>
        View: {{ selectedView }}
      </span>

      <div v-if="viewOpen" class="menu">
        <div
          v-for="option in viewOptions"
          :key="option"
          class="item"
          @click.stop="selectView(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
	.pagelistsettings-container {
	  display: flex;
	  gap: 10px;
	  width: 100%;
	  height: 50px;
	}

	.dropdown {
	  position: relative;
	  display: flex;
	  align-items: center;
	  padding: 0 15px;
	  background: #fff;
	  border: 1px solid #e5e7eb;
	  border-radius: 12px;
	  cursor: pointer;
	  font-size: 14px;
	  color: #111827;
	  min-width: 140px;
	  transition: 0.2s;
	}

	.dropdown:hover {
	  background: #f9fafb;
	}

	.menu {
	  position: absolute;
	  top: 110%;
	  left: 0;
	  width: 100%;
	  background: white;
	  border: 1px solid #e5e7eb;
	  border-radius: 10px;
	  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
	  z-index: 10;
	}

	.item {
	  padding: 10px;
	  cursor: pointer;
	}

	.item:hover {
	  background: #f3f4f6;
	}

	@media (max-width: 960px) {
	  .dropdown:first-child {
	    width: 100%;
	  }

	  .dropdown:last-child {
	    width: 30%;
	  }	
	}
</style>
