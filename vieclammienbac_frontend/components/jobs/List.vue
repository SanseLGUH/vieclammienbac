<template>
  <div class="joblist-container">
    <template v-if="jobs.length > 0">
      <div
        v-for="(row, rowIndex) in chunkedJobs"
        :key="rowIndex"
        class="job-row"
      >
        <div
          v-for="job in row"
          :key="job.id"
          class="job-container"
        >
          <NuxtLink :to="{ name: 'jobs-id', params: { id: job.id } }">

            <!-- CHANGED: video-aware preview -->
            <video
              v-if="isVideoUrl(job.image)"
              :src="job.image"
              class="job-image"
              preload="metadata"
              muted
              playsinline
              @loadedmetadata="(e) => e.target.currentTime = 0.5"
            />
            <img
              v-else
              :src="job.image"
              :alt="job.title"
              class="job-image"
            />

            <div class="job-info">
              <div class="job-text">
                <p class="job-company">{{ job.company }}</p>
                <p class="job-title">{{ job.title }}</p>
                <p class="job-desc">{{ job.description }}</p>
              </div>
              <div class="job-footer">
                <span class="job-salary">
                  {{ formatVND(job.salary) }}VND / month
                </span>
                <span class="job-date">{{ job.date }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
    <p v-else class="jobs-empty">No jobs available.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVideoThumbnail } from '~/composables/useVideoThumbnail'

const { isVideoUrl } = useVideoThumbnail()

const props = defineProps({
  jobs: {
    type: Array,
    default: () => []
  }
})

const chunkedJobs = computed(() => {
  const size = 2
  const result = []
  for (let i = 0; i < props.jobs.length; i += size) {
    result.push(props.jobs.slice(i, i + size))
  }
  return result
})

function formatVND(value) {
  return value.toString()
    .split('-')
    .map(num => num.trim().replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
    .join(' - ');
}
</script>

<style scoped>
  .joblist-container {
    margin-top: 10px;
    border-radius: 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .job-row {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .job-container {
    flex: 1;
    border: 1px solid rgba(0, 0, 0, 0.07);
    max-width: calc(50% - 5px);
    height: 450px;
    border-radius: 20px;
    overflow: hidden;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }

  .job-container a {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
    color: inherit;
  }

  .job-container:hover {
    border-color: #54B5FF;
    box-shadow: 0 4px 16px rgba(84, 181, 255, 0.15);
  }

  .job-image {
    display: block;
    width: 100%;
    height: 250px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .job-info {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .job-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
  }

  .job-company {
    margin: 0;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    color: #54B5FF;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .job-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1d;
    font-family: var(--font-body);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.3;
  }

  .job-desc {
    font-size: 12px;
    color: #888;
    margin: 4px 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    user-select: none;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    overflow: hidden;
  }

  .job-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .job-salary {
    font-size: 12.5px;
    color: #0066ff;
    font-weight: 700;
  }

  .job-date {
    font-size: 11px;
    color: #888;
  }

  .jobs-empty {
    text-align: center;
    color: rgba(0, 0, 0, 0.3);
    font-size: 13px;
    padding: 40px 0;
  }

  @media (max-width: 960px) {
    .job-container {
      height: 280px;
    }

    .job-image {
      height: 100px;
    }

    .job-title {
      -webkit-line-clamp: 1;
    }
  }
</style>