<script setup lang="ts">
import type { InstancedMesh } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useMouse, useWindowSize } from '@vueuse/core'
import gsap from 'gsap'
import {
  Color,
  DynamicDrawUsage,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
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
  cols: 30,
  rows: 30,
  spacing: 60,
  influenceRadius: 250, // 520
  baseScale: 0.0,
  maxScale: 1.1,
  parallaxStrength: 0.45,
})

const tmpMat = new Matrix4()
const tmpPos = new Vector3()

const tmpScale = new Vector3(1, 1, 1)
const tmpQuat = new Quaternion()

pane.addBinding(gridProps, 'spacing', { label: 'Spacing', min: 25, max: 100, step: 1 })
pane.addBinding(gridProps, 'influenceRadius', { label: 'Influence Radius', min: 50, max: 800, step: 1 })

const instancedMesh = shallowRef<InstancedMesh | null>(null)

const uBaseColor = '#3A36C8'
const uFresnelColor = '#b9b0fb'

const uniforms = reactive({
  uBaseColor: { value: new Color(uBaseColor) },
  uFresnelColor: { value: new Color(uFresnelColor) },
  uFresnelAmt: { value: 1.20 },
  uFresnelOffset: { value: -0.150 },
  uFresnelIntensity: { value: 0.75 },

  uRimBiasDir: { value: new Vector3(0.05, -0.40, -0.95) },
  uEllipseMajor: { value: 0.80 },
  uEllipseMinor: { value: 1.75 },

  uNoiseScale: { value: 0.100 },
  uNoiseStrength: { value: 0.185 },
})

const params = reactive({
  baseColor: uBaseColor,
  fresnelColor: uFresnelColor,
})

const quickToState = { offsetX: 0, offsetY: 0 }

function makeQuick(prop: 'offsetX' | 'offsetY') {
  return gsap.quickTo(quickToState, prop, {
    duration: 0.5,
    ease: 'power3.out',
  })
}

const quickOffsetX = makeQuick('offsetX')
const quickOffsetY = makeQuick('offsetY')

const material = new CustomShaderMaterial({
  baseMaterial: MeshStandardMaterial,
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  premultipliedAlpha: true,
  emissive: new Color('#24207a'), // 7E72D7
  emissiveIntensity: 5,
})

usePaneMaterials(material, {}, pane)

// --- Folders
const fCols = pane.addFolder({ title: '🎨 Colors', expanded: true })
const fRim = pane.addFolder({ title: '🌈 Fresnel', expanded: true })
const fEll = pane.addFolder({ title: '🥚 Ellipse (amande)', expanded: true })
const fNoise = pane.addFolder({ title: '🌀 Noise', expanded: true })

// ========== Colors
fCols.addBinding(params, 'baseColor', { label: 'Base', view: 'color' })
  .on('change', (ev) => {
    const hex = Number.parseInt(ev.value.replace('#', '0x'), 16)
    uniforms.uBaseColor.value.setHex(hex) // <- passe aussi au shader
  })
fCols.addBinding(params, 'fresnelColor', { label: 'Fresnel', view: 'color' })
  .on('change', (ev) => {
    const hex = Number.parseInt(ev.value.replace('#', '0x'), 16)
    uniforms.uFresnelColor.value.setHex(hex)
  })

// ========== Fresnel (simple)
fRim.addBinding(uniforms.uFresnelOffset, 'value', { label: 'Offset', min: -0.5, max: 0.5, step: 0.001 })
fRim.addBinding(uniforms.uFresnelAmt, 'value', { label: 'Amount', min: 0, max: 5.0, step: 0.01 })
fRim.addBinding(uniforms.uFresnelIntensity, 'value', { label: 'Intensity', min: 0, max: 4.0, step: 0.01 })

// ========== Ellipse (amande) — orientation & force
;['x', 'y', 'z'].forEach((k) => {
  fEll.addBinding(uniforms.uRimBiasDir.value, k as 'x' | 'y' | 'z', { label: `Bias ${k.toUpperCase()}`, min: -1, max: 1, step: 0.01 })
    .on('change', () => uniforms.uRimBiasDir.value.normalize())
})

fEll.addBinding(uniforms.uEllipseMajor, 'value', { label: 'Major (thin)', min: 0.2, max: 1.0, step: 0.01 })
fEll.addBinding(uniforms.uEllipseMinor, 'value', { label: 'Minor (thick)', min: 1.0, max: 2.0, step: 0.01 })

// ========== Noise (collé à l’objet)
fNoise.addBinding(uniforms.uNoiseScale, 'value', { label: 'Scale', min: 0.01, max: 0.5, step: 0.005 })
fNoise.addBinding(uniforms.uNoiseStrength, 'value', { label: 'Strength', min: 0.00, max: 0.5, step: 0.005 })

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

watch([mouseX, mouseY], () => {
  quickOffsetX(-mouseX.value * gridProps.parallaxStrength)
  quickOffsetY(-mouseY.value * gridProps.parallaxStrength)
})

watch(instancedMesh, () => {
  if (!instancedMesh.value)
    return

  instancedMesh.value!.instanceMatrix.setUsage(DynamicDrawUsage)
})

watchEffect(() => {
  updateInstances()
})

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const mesh = instancedMesh.value
  if (!mesh)
    return

  let i = 0
  for (let yy = 0; yy < gridProps.rows; yy++) {
    for (let xx = 0; xx < gridProps.cols; xx++) {
      const p = hexPosition(xx, yy)

      const px = p.x + quickToState.offsetX
      const py = p.y + quickToState.offsetY

      const dist = Math.hypot(px, py)

      const t = falloff(dist, gridProps.influenceRadius)
      const s = gridProps.baseScale + (gridProps.maxScale - gridProps.baseScale) * t
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
