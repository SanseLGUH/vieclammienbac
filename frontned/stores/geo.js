// stores/geo.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGeoStore = defineStore('geo', () => {
  const address = ref('')
  const location = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let abortController = null

  const getLocation = () => {
    if (!import.meta.client) return
    if (loading.value) return

    if (!navigator.geolocation) {
      error.value = 'Geolocation not supported'
      return
    }

    loading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        location.value = { lat: latitude, lng: longitude }

        try {
          abortController = new AbortController()
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { signal: abortController.signal }
          )
          const data = await res.json()
          address.value = data?.display_name || 'Unknown'
        } catch {
          error.value = 'Failed to fetch address'
        } finally {
          loading.value = false
        }
      },
      (err) => {
        error.value = err.message
        loading.value = false
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  return { address, location, loading, error, getLocation }
})