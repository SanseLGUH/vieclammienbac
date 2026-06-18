<script setup>
const name = defineModel({ default: '' })
</script>

<!-- MAKE SMART SEARCH NOT ONLY BY JOB-NAME USER WILL CAN TYPE SALARY TITLE ETC -->

<template>
  <input
    class="search-input"
    v-model="name"
    placeholder="Tìm kiếm việc làm"
  />
</template>

<style scoped>
  .search-input {
    width: 100%;
    height: 55px;
    padding: 0 15px;
    font-size: 18px;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
    outline: none;
    color: #1d1d1d;
    transition: border-color 0.2s;
  }
  .search-input::placeholder { color: #888; }
  .search-input:focus {
    border-color: #54B5FF;
    box-shadow: 0 0 0 3px rgba(84, 181, 255, 0.12);
  }
</style>
