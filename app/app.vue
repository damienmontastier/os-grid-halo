<script setup lang="ts">
useHead({
  title: 'GRID HALO',
  meta: [
    { name: 'description', content: 'An experimental interactive grid halo with fresnel glow.' },
  ],
})
</script>

<template>
  <div id="app" class="app">
    <WebglScene />
  </div>
</template>

<style lang="scss">
.app {
  height: 100%;
  width: 100%;
  z-index: 1;
  position: relative;
}
</style>
