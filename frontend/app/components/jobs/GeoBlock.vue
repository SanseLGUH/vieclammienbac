<script setup>
  import { useGeoStore } from '~/stores/geo'

  const props = defineProps({
    defaultLat: { type: Number, default: 21.0285 },
    defaultLng: { type: Number, default: 105.8542 },
    defaultZoom: { type: Number, default: 13 },
    defaultRadius: { type: Number, default: 75 },
    minRadius: { type: Number, default: 1 },
    maxRadius: { type: Number, default: 550 },
    circleColor: { type: String, default: '#54B5FF' },
    mapHeight: { type: String, default: '220px' },
    jobLocations: {
      type: Array,
      default: () => [
        {
          id: '1',
          lat: 20.8350985,
          lng: 106.669789,
          title: 'Viec Lam Mien bac Office',
          company: 'ViecLamMienbac'
        },
      ]
    }
  })

  const geo = useGeoStore()
  const mapRef = ref(null)
  const radius = ref(props.defaultRadius)
  let map = null
  let marker = null
  let circle = null
  let jobMarkers = []
  let L = null

  onMounted(async () => {
    if (!import.meta.client) return
    L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    map = L.map(mapRef.value, {
      center: [props.defaultLat, props.defaultLng],
      zoom: props.defaultZoom,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    updateMap({ lat: props.defaultLat, lng: props.defaultLng })

    watch(() => geo.location, (loc) => {
      if (!loc) return
      updateMap(loc)
    }, { deep: true })

    watch(radius, () => {
      const loc = geo.location || { lat: props.defaultLat, lng: props.defaultLng }
      updateMap(loc)
    })

    watch(() => props.jobLocations, () => {
      const loc = geo.location || { lat: props.defaultLat, lng: props.defaultLng }
      updateJobMarkers(loc)
    }, { deep: true })

    // Request the user's location automatically on mount, no click required.
    geo.getLocation()
  })

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function updateMap(loc) {
    const pos = [loc.lat, loc.lng]

    if (marker) marker.remove()
    marker = L.marker(pos, { draggable: true }).addTo(map)
    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng()
      updateMap({ lat, lng })
    })

    if (circle) circle.remove()
    circle = L.circle(pos, {
      radius: radius.value * 1000,
      color: props.circleColor,
      fillColor: props.circleColor,
      fillOpacity: 0.08,
      weight: 2,
    }).addTo(map)

    map.setView(pos)

    updateJobMarkers(loc)
  }

  function updateJobMarkers(loc) {
    jobMarkers.forEach(m => m.remove())
    jobMarkers = []

    props.jobLocations.forEach(job => {
      const dist = getDistance(loc.lat, loc.lng, job.lat, job.lng)
      if (dist <= radius.value) {
        const redIcon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
              <img
                src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
                style="width:25px;height:41px;filter:hue-rotate(150deg) saturate(2);"
              />
              <div style="
                background:#fff;
                border:1.5px solid #e53e3e;
                border-radius:6px;
                padding:2px 6px;
                font-size:10px;
                font-weight:600;
                color:#1d1d1d;
                white-space:nowrap;
                box-shadow:0 1px 4px rgba(0,0,0,0.15);
              ">${job.company}</div>
            </div>
          `,
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
        const m = L.marker([job.lat, job.lng], { icon: redIcon })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:150px;">
              <div style="font-weight:700;font-size:13px;color:#1d1d1d;margin-bottom:2px;">${job.title}</div>
              <div style="font-size:11px;color:#888;margin-bottom:8px;">${job.company}</div>
              <a href="/jobs/${job.id}" style="
                display:block;
                text-align:center;
                padding:6px 10px;
                background:#54B5FF;
                color:#fff;
                border-radius:6px;
                text-decoration:none;
                font-size:12px;
                font-weight:600;
                transition:background 0.2s;
              ">Xem việc làm →</a>
            </div>
          `)
          .addTo(map)
        jobMarkers.push(m)
      }
    })
  }

  const emit = defineEmits(['update:radius'])

  watch(radius, (val) => {
    emit('update:radius', val)
    const loc = geo.location || { lat: props.defaultLat, lng: props.defaultLng }
    updateMap(loc)
  })
</script>

<template>
  <div class="location-container">
    <div class="input-wrapper">
      <input
        class="address-input"
        :value="geo.address"
        readonly
        :placeholder="
          geo.loading ? 'Getting location...' :
          geo.error ? geo.error :
          'Nhấp chuột để xem vị trí của bạn'
        "
      />
      <button class="geo-btn" @click="geo.getLocation" :disabled="geo.loading" title="Refresh location">
        <span v-if="geo.loading" class="spinner" />
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor" stroke="none" opacity="0.15"/>
        </svg>
      </button>
    </div>

    <div class="radius-control">
      <span class="radius-label">Radius: <b>{{ radius }} km</b></span>
      <input type="range" :min="minRadius" :max="maxRadius" v-model="radius" class="radius-slider" />
    </div>

    <div ref="mapRef" class="map" :style="{ height: mapHeight }" />
  </div>
</template>

<style scoped>
  .location-container {
    width: 100%;
    padding: 20px;
    border: 1px solid rgba(0, 0, 0, 0.07);
    background-color: #fff;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .input-wrapper {
    position: relative;
    width: 100%;
  }
  .address-input {
    width: 100%;
    height: 55px;
    padding: 0 52px 0 15px;
    font-size: 16px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    outline: none;
    color: #1d1d1d;
    box-sizing: border-box;
    background: #fff;
  }
  .address-input:focus { border-color: #54B5FF; }
  .geo-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: #54B5FF;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .geo-btn:hover:not(:disabled) { background: #2aa4ff; }
  .geo-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .radius-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .radius-label {
    font-size: 13px;
    color: #555;
    white-space: nowrap;
    min-width: 90px;
  }
  .radius-slider {
    flex: 1;
    accent-color: #54B5FF;
    cursor: pointer;
  }
  .map {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #f0f0f0;
    z-index: 0;
  }
  .map :deep(.leaflet-control-attribution) {
    font-size: 8px;
    opacity: 0.4;
    background: transparent;
  }
  .map :deep(.leaflet-popup-content-wrapper) {
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    padding: 0;
  }
  .map :deep(.leaflet-popup-content) {
    margin: 12px 14px;
  }
</style>