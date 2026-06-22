<template>
  <section class="hero-banner">
    <div class="hero-content">
      <p class="hero-eyebrow">{{ eyebrow }}</p>
      <h1 class="hero-title">{{ title }}</h1>
      <p class="hero-subtitle">{{ subtitle }}</p>
      <a v-if="ctaText" :href="ctaLink" class="hero-cta">
        {{ ctaText }}
      </a>

    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}>()
</script>
<style scoped>
.hero-banner {
  min-height: 400px;
  display: flex;
  align-items: center;
  padding: 0 48px;
  box-sizing: border-box;
  background: linear-gradient(
    215deg,
    #66b2ff 0%,   #66b2ff 6%,
    #4da3ff 6%,   #4da3ff 16%,
    #338fff 16%,  #338fff 28%,
    #1a7cff 28%,  #1a7cff 42%,
    #0066ff 42%,  #0066ff 47%,
    #0047b3 47%,  #0047b3 53%,
    #0066ff 53%,  #0066ff 60%,
    #1a7cff 60%,  #1a7cff 72%,
    #338fff 72%,  #338fff 84%,
    #4da3ff 84%,  #4da3ff 94%,
    #66b2ff 94%,  #66b2ff 100%
  );
  background-size: 350% 400%;
  animation: slideWave 40s linear infinite;
}
@keyframes slideWave {
  from { background-position: 0% 100%; }
  to   { background-position: 100% 0%; }
}

/*.hero-banner {
  min-height: 400px;
  display: flex;
  align-items: center;
  padding: 0 48px;
  box-sizing: border-box;
  
  background-image: url('https://drive.vieclammienbac.com/download?id=6e4490aa-c298-4928-8f2b-bce6df0b3f63');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
*//* Note: You can delete the @keyframes slideWave animation if you use this */

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
}
.hero-eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}
.hero-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
  margin: 0;
}
.hero-subtitle {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
.hero-cta {
  display: inline-block;
  margin-top: 8px;
  padding: 10px 24px;
  background: #fff;
  color: #0047b3;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  align-self: flex-start;
  transition: opacity 0.15s;
}
.hero-cta:hover {
  opacity: 0.9;
}
@media (max-width: 768px) {
  .hero-banner { padding: 0 24px; }
  .hero-title  { font-size: 26px; }
}
</style>