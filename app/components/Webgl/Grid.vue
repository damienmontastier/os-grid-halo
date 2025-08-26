<script setup lang="ts">
import type { InstancedMesh } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  Matrix4,
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

function falloff(dist: number, r: number) {
  const x = dist / r
  return Math.exp(-(x * x) * 2)
}

const gridProps = reactive({
  cols: 100,
  rows: 100,
  spacing: 60,
  influenceRadius: 185, // 520
})

const tmpMat = new Matrix4()
const tmpPos = new Vector3()

const tmpScale = new Vector3(1, 1, 1)
const tmpQuat = new Quaternion()

pane.addBinding(gridProps, 'spacing', { label: 'Spacing', min: 25, max: 100, step: 1 })

const instancedMesh = shallowRef<InstancedMesh | null>(null)

const uniforms = reactive({
  uBaseColor: { value: new Color('#251D7A') },
  uFresnelColor: { value: new Color('#D2C5FD') },
  uFresnelAmt: { value: 1.5 },
  uFresnelOffset: { value: 0.05 },
  uFresnelIntensity: { value: 1.5 },
  uFresnelAlpha: { value: 1 },
  uFresnelDirection: { value: new Vector3(0.0, 1.0, 0.5) }, // <- bias vertical + léger Z
  uAlpha: { value: false },
})

const params = reactive({
  baseColor: '#251D7A',
  fresnelColor: '#D2C5FD',
})

const material = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false, // évite les soucis d’ordre de dessin
  depthTest: true,
  dithering: true,

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
pane.addBinding(uniforms.uFresnelDirection.value, 'x', { min: -1, max: 1, step: 0.01 })
pane.addBinding(uniforms.uFresnelDirection.value, 'y', { min: -1, max: 1, step: 0.01 })
pane.addBinding(uniforms.uFresnelDirection.value, 'z', { min: -1, max: 1, step: 0.01 })

const geometry = new SphereGeometry(25, 64, 48)

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
const parallaxStrength = 0.35

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

      const t = falloff(dist, gridProps.influenceRadius)
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
