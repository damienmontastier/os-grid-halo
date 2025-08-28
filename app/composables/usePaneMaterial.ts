import type { Material } from 'three'
import { useNuxtApp } from '#app'
import { Color } from 'three'
import { useUpdateMaterial } from '@/composables/useUpdateMaterial'

type MaterialWithName = Material & { name: string }

type DefaultParams = Partial<{
  roughness: number
  metalness: number
  clearcoat: number
  dispersion: number
  ior: number
  reflectivity: number
  envMapIntensity: number
  envMapRotation: { x: number, y: number, z: number }
  iridescence: number
  normalScale: { x: number, y: number }
  specularIntensity: number
  transmission: number
  polygonOffset: boolean
  polygonOffsetFactor: number
  flatShading: boolean
  wireframe: boolean
  transparent: boolean
  opacity: number
  alphaTest: number
  color: string | number
  emissive: string | number
  emissiveIntensity: number
  sheen: number
  sheenRoughness: number
  sheenColor: Color
}>

type MaterialsDefaultsMap = Record<string, DefaultParams>

export async function usePaneMaterials(materials: Material[] | Material, defaultsPerMaterial?: MaterialsDefaultsMap, parentFolder?: any) {
  await nextTick()

  const { $pane } = useNuxtApp()
  const { updateMaterial } = useUpdateMaterial()

  const pane = parentFolder || usePaneFolder($pane, {
    title: '🎛️ Matériaux',
    expanded: false,
  })

  const materialsArray = Array.isArray(materials) ? materials : [materials]

  materialsArray.forEach((material) => {
    const mat = material as MaterialWithName
    const name = mat.name || 'Material'

    const defaults = defaultsPerMaterial?.[name]

    if (defaults) {
      updateMaterial(mat, defaults)
    }

    const folder = pane.addFolder({
      title: `🧱 ${name}`,
      expanded: false,
    })

    if ('roughness' in mat) {
      folder.addBinding(mat, 'roughness', { min: 0, max: 1, step: 0.01 })
    }

    if ('metalness' in mat) {
      folder.addBinding(mat, 'metalness', { min: 0, max: 1, step: 0.01 })
    }

    if ('clearcoat' in mat) {
      folder.addBinding(mat, 'clearcoat', { min: 0, max: 1, step: 0.001 })
    }

    if ('clearcoatRoughness' in mat) {
      folder.addBinding(mat, 'clearcoatRoughness', { min: 0, max: 1, step: 0.001 })
    }

    if ('dispersion' in mat) {
      folder.addBinding(mat, 'dispersion', { min: 0, max: 1, step: 0.001 })
    }

    if ('ior' in mat) {
      folder.addBinding(mat, 'ior', { min: 1.0, max: 2.333, step: 0.001 })
    }

    if ('reflectivity' in mat) {
      folder.addBinding(mat, 'reflectivity', { min: 0, max: 1, step: 0.001 })
    }

    if ('envMap' in mat && mat && 'envMapIntensity' in mat) {
      folder.addBinding(mat, 'envMapIntensity', { min: 0, max: 5, step: 0.01 })
    }

    if ('envMap' in mat && mat.envMap && 'envMapRotation' in mat) {
      folder.addBinding(mat, 'envMapRotation', {
        x: { min: -Math.PI, max: Math.PI, step: 0.01 },
        y: { min: -Math.PI, max: Math.PI, step: 0.01 },
        z: { min: -Math.PI, max: Math.PI, step: 0.01 },
      })
    }

    if ('iridescence' in mat) {
      folder.addBinding(mat, 'iridescence', { min: 0, max: 1, step: 0.001 })
    }

    if ('normalMap' in mat && mat.normalMap && 'normalScale' in mat) {
      folder.addBinding(mat, 'normalScale', {
        x: { min: -25, step: 0.1, max: 25 },
        y: { min: -25, step: 0.1, max: 25 },
        z: { min: -25, step: 0.1, max: 25 },
      })
    }

    if ('specularIntensity' in mat) {
      folder.addBinding(mat, 'specularIntensity', { min: 0, max: 1, step: 0.01 })
    }

    if ('transmission' in mat) {
      folder.addBinding(mat, 'transmission', { min: 0, max: 1, step: 0.001 })
    }

    if ('sheen' in mat) {
      folder.addBinding(mat, 'sheen', { min: 0, max: 1, step: 0.01 })
    }

    if ('sheenRoughness' in mat) {
      folder.addBinding(mat, 'sheenRoughness', { min: 0, max: 1, step: 0.01 })
    }

    if ('sheenColor' in mat) {
      const params = { sheenColor: `#${mat.sheenColor.getHexString()}` }
      folder.addBinding(params, 'sheenColor').on('change', (ev) => {
        mat.sheenColor = new Color(ev.value)
        mat.needsUpdate = true
      })
    }

    if ('polygonOffset' in mat) {
      folder.addBinding(mat, 'polygonOffset').on('change', (ev) => {
        mat.polygonOffset = ev.value
        mat.needsUpdate = true
      })
    }

    if ('polygonOffsetFactor' in mat) {
      folder.addBinding(mat, 'polygonOffsetFactor', { min: 0, max: 20, step: 0.1 }).on('change', (ev) => {
        mat.polygonOffsetFactor = ev.value
        mat.needsUpdate = true
      })
    }

    if ('flatShading' in mat) {
      folder.addBinding(mat, 'flatShading').on('change', (ev) => {
        mat.flatShading = ev.value
        mat.needsUpdate = true
      })
    }

    if ('wireframe' in mat) {
      folder.addBinding(mat, 'wireframe')
    }

    if ('transparent' in mat) {
      folder.addBinding(mat, 'transparent')
    }

    if ('opacity' in mat) {
      folder.addBinding(mat, 'opacity', { min: 0, max: 1, step: 0.01 })
    }

    if ('alphaTest' in mat) {
      folder.addBinding(mat, 'alphaTest', { min: 0, max: 2, step: 0.01 })
    }

    if ('color' in mat) {
      const params = { color: `#${mat.color.getHexString()}` }
      folder.addBinding(params, 'color').on('change', (ev) => {
        mat.color = new Color(ev.value)
        mat.needsUpdate = true
      })
    }

    if ('emissive' in mat) {
      const params = { emissive: `#${mat.emissive.getHexString()}` }
      folder.addBinding(params, 'emissive').on('change', (ev) => {
        mat.emissive = new Color(ev.value)
        mat.needsUpdate = true
      })
    }

    if ('emissiveIntensity' in mat) {
      folder.addBinding(mat, 'emissiveIntensity', { min: -5, max: 5, step: 0.01 })
    }
  })
}
