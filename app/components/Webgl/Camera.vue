<script lang="ts" setup>
import type { PerspectiveCamera } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { useTres, useTresContext } from '@tresjs/core'
import { useWindowSize } from '@vueuse/core'
// import { gsap } from 'gsap'

// let tl = gsap.timeline()

const cameraRef = shallowRef<PerspectiveCamera | null>(null)

// const appStore = useAppStore()
// const { instructionsHidden } = toRefs(appStore)

const { controls } = useTresContext()
const { camera } = useTres()

// const documentEl = computed(() => document.getElementById('app-page') || document.body)

const { width, height } = useWindowSize()

const { $pane } = useNuxtApp()

// const paneCamera = usePaneFolder($pane, {
//   title: '📷 Camera',
//   expanded: false,
// })

const CAMERA_PARAMS = reactive({
  fov: 50,
})

// watch(cameraType, (newVal) => {
//   updateCamera(newVal)
// }, { immediate: true, once: true })

// watch(cameraType, (newVal) => {
//   updateCamera(newVal)
// })

// paneCamera.addBinding(CAMERA_PARAMS, 'fov', {
//   min: 0,
//   max: 100,
//   step: 0.1,
// })

// paneCamera.addButton({
//   title: 'Save Camera',
// }).on('click', onSave)

watch(
  () => CAMERA_PARAMS.fov,
  async () => {
    console.log('CAMERA_PARAMS.fov', CAMERA_PARAMS.fov)

    if (cameraRef.value) {
      await nextTick()
      cameraRef.value.updateProjectionMatrix()
    }
  },
)

function onSave() {
  if (!cameraRef.value)
    return

  console.log('position camera', cameraRef.value.position)
  console.log('rotation camera', cameraRef.value.rotation)
  console.log('controls target', controls.value.target)
  console.log('camera — controls', cameraRef.value, controls.value)
}

onUnmounted(() => {
})
</script>

<template>
  <!-- <TresPerspectiveCamera
    ref="cameraRef"
    :near="0.1"
    :far="100"
    :fov="CAMERA_PARAMS.fov"
  /> -->

  <TresOrthographicCamera :args="[width / -2, width / 2, height / 2, height / -2, 1, 1000]" :zoom="1" :position="[0, 0, 500]" />

  <!-- :max-polar-angle="Math.PI / 2.25" -->
  <!-- :dom-element="documentEl" -->

  <OrbitControls
    make-default
    :auto-rotate="false"
  />
</template>
