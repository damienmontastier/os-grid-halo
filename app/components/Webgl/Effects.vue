<script setup lang="ts">
import { BarrelBlurPmndrs, BloomPmndrs, EffectComposerPmndrs, FishEyePmndrs } from '@tresjs/post-processing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'

const POSTPROCESSING_PARAMS = reactive({
  toneMapping: {
    exposure: 1.65,
    mode: ToneMappingMode.ACES_FILMIC,
  },
  bloom: {
    intensity: 2.5,
    mipmapBlur: true,
    blendFunction: BlendFunction.SCREEN,
    threshold: 0.25,
    smoothing: 0.45,
    kernelSize: KernelSize.MEDIUM,
  },
})

const { $pane } = useNuxtApp()

const pane = usePaneFolder($pane, {
  title: '🗺️ Effects',
  expanded: true,
})

const toneMappingPane = usePaneFolder(pane, { title: '🎨 Tone Mapping', expanded: false })
toneMappingPane.addBinding(POSTPROCESSING_PARAMS.toneMapping, 'exposure', {
  min: 0,
  max: 10,
  step: 0.1,
})
toneMappingPane.addBinding(POSTPROCESSING_PARAMS.toneMapping, 'mode', {
  options: Object.keys(ToneMappingMode).map(key => ({
    text: key,
    value: ToneMappingMode[key as keyof typeof ToneMappingMode],
  })),
})

const bloomPane = usePaneFolder(pane, { title: '🌟 Bloom', expanded: false })
bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'intensity', {
  min: 0,
  max: 10,
  step: 0.1,
})

bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'mipmapBlur')
bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'blendFunction', {
  options: Object.keys(BlendFunction).map(key => ({
    text: key,
    value: BlendFunction[key as keyof typeof BlendFunction],
  })),
})
bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'kernelSize', {
  options: Object.keys(KernelSize).map(key => ({
    text: key,
    value: KernelSize[key as keyof typeof KernelSize],
  })),
})
bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'threshold', {
  min: 0,
  max: 1,
  step: 0.01,
})
bloomPane.addBinding(POSTPROCESSING_PARAMS.bloom, 'smoothing', {
  min: 0,
  max: 1,
  step: 0.001,
})

const fishEyeProps = {
  lensS: [1, 1],
  lensF: [0, 1],
  scale: 1,
}

const barrelBlurProps = {
  amount: 0.01,
  offset: [0.5, 0.5],
}
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs :multisampling="4">
      <BloomPmndrs
        :intensity="POSTPROCESSING_PARAMS.bloom.intensity"
        :blend-function="POSTPROCESSING_PARAMS.bloom.blendFunction"
        :mipmap-blur="POSTPROCESSING_PARAMS.bloom.mipmapBlur"
        :luminance-threshold="POSTPROCESSING_PARAMS.bloom.threshold"
        :luminance-smoothing="POSTPROCESSING_PARAMS.bloom.smoothing"
        :kernel-size="POSTPROCESSING_PARAMS.bloom.kernelSize"
      />

      <!-- <FishEyePmndrs v-bind="fishEyeProps" /> -->

      <!-- <BarrelBlurPmndrs v-bind="barrelBlurProps" /> -->

      <ToneMappingPmndrs :mode="POSTPROCESSING_PARAMS.toneMapping.mode" />
    </EffectComposerPmndrs>
  </Suspense>
</template>
