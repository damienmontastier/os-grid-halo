<script lang="ts" setup>
import { Environment } from '@tresjs/cientos'
import { vLightHelper } from '@tresjs/core'
import { NoToneMapping, SRGBColorSpace } from 'three'

const gl = {
  shadows: true,
  clearColor: '#070707',
  alpha: true,
  clearAlpha: 1,
  antialias: true,
  // logarithmicDepthBuffer: true,
  // depth: false,
  // stencil: false,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  // shadowMapType: PCFSoftShadowMap,
}

const FOG_PARAMS = reactive({
  near: 0.70,
  far: 0.80,
})

const glReactive = reactive({
  exposure: 1.65,
})

// const { $pane } = useNuxtApp()

onMounted(() => {
  // const pane = usePaneFolder($pane, {
  //   title: '🗺️ Pre Scene',
  //   expanded: true,
  // })

  // pane.addBinding(glReactive, 'exposure', {
  //   label: 'Tone Mapping Exposure',
  //   min: 0,
  //   max: 10,
  //   step: 0.01,
  // })

  // pane.addBinding(FOG_PARAMS, 'near', {
  //   label: 'Fog Near',
  //   min: 0,
  //   max: 2,
  //   step: 0.01,
  // })

  // pane.addBinding(FOG_PARAMS, 'far', {
  //   label: 'Fog Far',
  //   min: 0,
  //   max: 2,
  //   step: 0.01,
  // })
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

    <!-- <TresFog :args="['#000000', FOG_PARAMS.near, FOG_PARAMS.far]" /> -->

    <WebglGrid />

    <Suspense>
      <Environment preset="dawn" :environment-intensity="2" />
    </Suspense>

    <!-- <TresDirectionalLight :scale="100" color="white" :intensity="5" :position="[100, -50, 500]" /> -->

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
