<script setup lang="ts">
import type { InstancedMesh } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import {
  Color,
  DynamicDrawUsage,
  Matrix4,
  MeshPhysicalMaterial,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import { shallowRef, watchEffect } from 'vue'
import fragmentShader from '~/assets/glsl/fresnel/fragment.glsl'
import vertexShader from '~/assets/glsl/fresnel/vertex.glsl'

const { $pane } = useNuxtApp()
const pane = usePaneFolder($pane, { title: '🔲 Grid', expanded: true })
const { renderer } = useTres()

const { width, height } = useWindowSize()
const { x, y } = useMouse({ target: renderer.domElement })

const gridProps = reactive({
  cols: 100,
  rows: 100,
  spacing: 60,
  influenceRadius: 185,
})

const tmpMat = new Matrix4()
const tmpPos = new Vector3()

const tmpScale = new Vector3(1, 1, 1)
const tmpQuat = new Quaternion()

pane.addBinding(gridProps, 'spacing', { label: 'Spacing', min: 25, max: 100, step: 1 })

const instancedMesh = shallowRef<InstancedMesh | null>(null)

// const material = new MeshPhysicalMaterial({
//   color: '#040404',
//   // emissive: 0x8888FF,
//   // emissiveIntensity: 2.5,
//   roughness: 1,
//   metalness: 1,
//   // transmission: 0.5,
//   // thickness: 0.5,
//   // clearcoat: 1.0,
//   // clearcoatRoughness: 0.1,
//   name: 'SphereMaterial',
//   sheen: 1,
//   sheenColor: '#8888ff',
//   sheenRoughness: 0.3,
// })

const uniforms = reactive({
  uBaseColor: { value: new Color('#0777fd') },
  uFresnelColor: { value: new Color('#02feff') },
  uFresnelAmt: { value: 1.5 },
  uFresnelOffset: { value: 0.05 },
  uFresnelIntensity: { value: 1.5 },
  uFresnelAlpha: { value: 1 },
  uAlpha: { value: true },
})

const params = reactive({
  baseColor: '#0777fd',
  fresnelColor: '#02feff',
})

const material = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
})

pane.addBinding(params, 'baseColor', {
  label: 'Base Color',
}).on('change', (ev) => {
  const hexNumber = Number.parseInt(ev.value.replace('#', '0x'), 16)
  uniforms.uBaseColor.value.setHex(hexNumber)
})

pane.addBinding(params, 'fresnelColor', {
  label: 'Fresnel Color',
}).on('change', (ev) => {
  const hexNumber = Number.parseInt(ev.value.replace('#', '0x'), 16)
  uniforms.uFresnelColor.value.setHex(hexNumber)
})

pane.addBinding(uniforms.uFresnelAmt, 'value', { label: 'Fresnel Amount', min: 0, max: 5, step: 0.1 })
pane.addBinding(uniforms.uFresnelOffset, 'value', { label: 'Fresnel Offset', min: 0, max: 1, step: 0.01 })
pane.addBinding(uniforms.uFresnelIntensity, 'value', { label: 'Fresnel Intensity', min: 0, max: 5, step: 0.1 })
pane.addBinding(uniforms.uFresnelAlpha, 'value', { label: 'Fresnel Alpha', min: 0, max: 1, step: 0.01 })
pane.addBinding(uniforms.uAlpha, 'value', { label: 'Alpha' })

const geometry = new SphereGeometry(25, 16, 12)

function hexPosition(x: number, y: number) {
  const stepX = gridProps.spacing
  const stepY = gridProps.spacing * Math.sqrt(3) / 2
  const offsetX = (y % 2) * 0.5 * stepX
  const px = (x - (gridProps.cols - 1) / 2) * stepX + offsetX
  const py = (y - (gridProps.rows - 1) / 2) * stepY
  return { x: px, y: py }
}

function updateInstances() {
  const mesh = instancedMesh.value
  if (!mesh)
    return

  let i = 0
  for (let y = 0; y < gridProps.rows; y++) {
    for (let x = 0; x < gridProps.cols; x++) {
      const p = hexPosition(x, y)
      tmpPos.set(p.x, p.y, 0)
      tmpMat.makeTranslation(tmpPos.x, tmpPos.y, tmpPos.z)
      mesh.setMatrixAt(i++, tmpMat)
    }
  }
  mesh.instanceMatrix.needsUpdate = true
}

const cursorX = computed(() => (x.value / width.value * 2 - 1))
const cursorY = computed(() => -(y.value / height.value * 2 - 1))

const mouseX = computed(() => (cursorX.value * width.value) / 2)
const mouseY = computed(() => (cursorY.value * height.value) / 2)

watch(instancedMesh, () => {
  if (!instancedMesh.value)
    return

  instancedMesh.value!.instanceMatrix.setUsage(DynamicDrawUsage)
})

watchEffect(() => {
  updateInstances()
})

const baseScale = 0.1
const maxScale = 1.1
const parallaxStrength = 0.5

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const mesh = instancedMesh.value
  if (!mesh)
    return
  const offsetX = -mouseX.value * parallaxStrength
  const offsetY = -mouseY.value * parallaxStrength

  let i = 0
  for (let yy = 0; yy < gridProps.rows; yy++) {
    for (let xx = 0; xx < gridProps.cols; xx++) {
      const p = hexPosition(xx, yy)

      const px = p.x + offsetX
      const py = p.y + offsetY

      const dist = Math.hypot(px, py)

      const t = Math.max(0, 1 - dist / gridProps.influenceRadius)
      const s = baseScale + (maxScale - baseScale) * t
      tmpScale.set(s, s, s)

      tmpPos.set(px, py, 0)
      tmpMat.compose(tmpPos, tmpQuat.identity(), tmpScale)
      mesh.setMatrixAt(i++, tmpMat)
    }
  }

  mesh.instanceMatrix.needsUpdate = true
})
</script>

<template>
  <TresInstancedMesh
    ref="instancedMesh"
    :args="[geometry, material, gridProps.cols * gridProps.rows]"
  />
</template>
