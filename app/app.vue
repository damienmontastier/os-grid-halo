<script setup lang="ts">
useHead({
  title: 'HALO GRID',
  meta: [
    { name: 'description', content: 'An experimental interactive halo grid with fresnel glow.' },
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
