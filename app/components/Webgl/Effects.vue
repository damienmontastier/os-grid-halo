<script setup lang="ts">
import { BarrelBlurPmndrs, BloomPmndrs, EffectComposerPmndrs, FishEyePmndrs } from '@tresjs/post-processing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { setupEffectsPane } from '~/panes/setupEffectsPane'

const POSTPROCESSING_PARAMS = reactive({
  toneMapping: {
    mode: ToneMappingMode.ACES_FILMIC,
  },
  bloom: {
    intensity: 2.5,
    mipmapBlur: true,
    blendFunction: BlendFunction.SCREEN,
    luminanceThreshold: 0.25,
    luminanceSmoothing: 0.45,
    kernelSize: KernelSize.MEDIUM,
  },
  fishEye: {
    lensS: [0.95, 0.95],
    lensF: [0.2, 1],
    scale: 0.95,
  },
  barrelBlur: {
    amount: 0.002,
    offsetX: 0.5,
    offsetY: 0.5,
  },
})

setupEffectsPane(POSTPROCESSING_PARAMS)
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs :multisampling="4">
      <BloomPmndrs
        v-bind="POSTPROCESSING_PARAMS.bloom"
      />

      <FishEyePmndrs v-bind="POSTPROCESSING_PARAMS.fishEye" />

      <BarrelBlurPmndrs v-bind="POSTPROCESSING_PARAMS.barrelBlur" />

      <ToneMappingPmndrs :mode="POSTPROCESSING_PARAMS.toneMapping.mode" />
    </EffectComposerPmndrs>
  </Suspense>
</template>
