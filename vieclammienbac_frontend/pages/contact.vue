<script setup>
  let content = `Website: https://vieclammienbac.com
Email: tuyendung@vieclammienbac.com
Hotline: 0789.393.079`
</script>


<template>
  <section class="section">
    <div class="container">
      <h1 class="page-title">CÔNG TY CỔ PHẦN VIỆC LÀM MIỀN BẮC</h1>
      <p class="page-text">
        {{content}}
      </p>
      <br>
    </div>
  </section>
</template>

<style scoped>
.section-eyebrow {
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--color-muted);
  margin-bottom: .75rem;
}
.page-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1.5rem;
}
.page-text {
  color: var(--color-muted);
  max-width: 1265px;
  font-size: 1.1rem;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
