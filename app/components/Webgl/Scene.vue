<script lang="ts" setup>
import { Environment } from '@tresjs/cientos'
import { NoToneMapping, SRGBColorSpace } from 'three'

const gl = {
  shadows: true,
  clearColor: '#070707',
  alpha: true,
  clearAlpha: 1,
  antialias: true,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
}

const glReactive = reactive({
  exposure: 1.65,
})
</script>

<template>
  <TresCanvas
    v-bind="gl"
    class="app-webgl"
    window-size
    :tone-mapping-exposure="glReactive.exposure"
  >
    <WebglCamera />

    <WebglGrid />

    <Suspense>
      <Environment preset="dawn" :environment-intensity="2" />
    </Suspense>

    <!-- <TresDirectionalLight color="#b9b0fb" :intensity="2" :position="[100, -50, 100]" /> -->

    <WebglEffects />
  </TresCanvas>
</template>

<style lang="scss">
canvas.app-webgl {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
}
</style>
