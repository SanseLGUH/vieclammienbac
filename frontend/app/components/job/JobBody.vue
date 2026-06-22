<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

const isHtmlContent = computed(() => {
  if (!props.content) return false
  const htmlRegex = /<\/?[a-z][\s\S]*>/i
  return htmlRegex.test(props.content)
})
</script>

<template>
  <div
    class="body"
    :class="{ 'is-html': isHtmlContent, 'is-text': !isHtmlContent }"
    v-html="content"
  />
</template>

<style scoped>
.body {
  font-size: 14px;
  color: #333;
  line-height: 1.75;
  margin-bottom: 32px;
}

.body.is-text {
  white-space: pre-wrap;
}

.body.is-html {
  white-space: normal;
}
.body.is-html :deep(p) {
  margin-bottom: 12px;
}
.body.is-html :deep(strong) {
  font-weight: 600;
  color: #111;
}
.body.is-html :deep(ul),
.body.is-html :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}
.body.is-html :deep(li) {
  margin-bottom: 6px;
}
.body.is-html :deep(br) {
  content: "";
  margin: 4px 0;
  display: block;
}
</style>