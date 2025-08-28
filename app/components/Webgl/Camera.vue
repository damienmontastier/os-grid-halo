<script lang="ts" setup>
import type { PerspectiveCamera } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { useTresContext } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'

const cameraRef = shallowRef<PerspectiveCamera | null>(null)

const { controls } = useTresContext()

// const documentEl = computed(() => document.getElementById('app-page') || document.body)

const { width, height } = useWindowSize()

onUnmounted(() => {
})
</script>

<template>
  <!-- <TresPerspectiveCamera
    ref="cameraRef"
    :near="0.1"
    :far="100"
    :fov="50"
  /> -->

  <TresOrthographicCamera :args="[width / -2, width / 2, height / 2, height / -2, 1, 1000]" :zoom="1" :position="[0, 0, 500]" />

  <!-- <OrbitControls
    make-default
    :auto-rotate="false"
  /> -->
</template>
