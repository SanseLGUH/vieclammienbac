// composables/useVideoThumbnail.js
export function useVideoThumbnail() {
  const thumbnailCache = ref({})

  const isVideoUrl = (url) => {
    if (!url) return false
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i
    const videoMimePatterns = /(video|\.mp4|\.webm)/i
    return videoExtensions.test(url) || videoMimePatterns.test(url)
  }

  const extractVideoThumbnail = (url) => {
    return new Promise((resolve, reject) => {
      if (thumbnailCache.value[url]) {
        resolve(thumbnailCache.value[url])
        return
      }

      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.preload = 'metadata'

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.addEventListener('loadeddata', () => {
        // Seek to first frame (or a small offset to avoid black frames)
        video.currentTime = 0.1
      })

      video.addEventListener('seeked', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataURL = canvas.toDataURL('image/jpeg', 0.85)
        thumbnailCache.value[url] = dataURL
        video.src = '' // free memory
        resolve(dataURL)
      })

      video.addEventListener('error', (e) => reject(e))
      video.src = url
    })
  }

  return { isVideoUrl, extractVideoThumbnail, thumbnailCache }
}