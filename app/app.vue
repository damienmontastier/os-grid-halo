<script setup lang="ts">
// const appStore = useAppStore()
// const { fontsLoaded } = toRefs(appStore)

// useHead({
//   htmlAttrs: {
//     class: import.meta.env.DEV ? `dev` : ``,
//   },
// })
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
