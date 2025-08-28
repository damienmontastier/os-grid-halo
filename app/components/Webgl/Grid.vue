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
import { setupGridPane } from '~/panes/setupGridPane'

const { renderer } = useTres()

const { width, height } = useWindowSize()
const { x, y } = useMouse({ target: renderer.domElement })

function falloff(dist: number, r: number) {
  const x = dist / r
  return Math.exp(-(x * x) * 2)
}

const gridProps = reactive({
  cols: 35,
  rows: 35,
  spacing: 60,
  influenceRadius: 200,
  baseScale: 0.0,
  maxScale: 1.1,
  parallaxStrength: 0.6,
})

const tmpMat = new Matrix4()
const tmpPos = new Vector3()

const tmpScale = new Vector3(1, 1, 1)
const tmpQuat = new Quaternion()

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

const paramsColors = reactive({
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
  emissive: new Color('#24207a'),
  emissiveIntensity: 8.5,
})

material.name = 'Material'

setupGridPane(gridProps, uniforms, paramsColors, material)

const geometry = new SphereGeometry(25, 32, 16)

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
