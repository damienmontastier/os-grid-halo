import { useNuxtApp } from '#app'

export function setupGridPane(props, uniforms, colors, material) {
  const { $pane } = useNuxtApp()

  const paneGrid = usePaneFolder($pane, { title: '🔲 Grid', expanded: true })

  usePaneMaterials(material, {}, paneGrid)

  paneGrid.addBinding(props, 'spacing', { label: 'Spacing', min: 25, max: 100, step: 1 })
  paneGrid.addBinding(props, 'influenceRadius', { label: 'Influence Radius', min: 50, max: 800, step: 1 })

  const fCols = paneGrid.addFolder({ title: '🎨 Colors', expanded: false })
  const fRim = paneGrid.addFolder({ title: '🌈 Fresnel', expanded: false })
  const fEll = paneGrid.addFolder({ title: '🥚 Ellipse (amande)', expanded: false })
  const fNoise = paneGrid.addFolder({ title: '🌀 Noise', expanded: false })

  fCols.addBinding(colors, 'baseColor', { label: 'Base', view: 'color' })
    .on('change', (ev) => {
      const hex = Number.parseInt(ev.value.replace('#', '0x'), 16)
      uniforms.uBaseColor.value.setHex(hex)
    })

  fCols.addBinding(colors, 'fresnelColor', { label: 'Fresnel', view: 'color' })
    .on('change', (ev) => {
      const hex = Number.parseInt(ev.value.replace('#', '0x'), 16)
      uniforms.uFresnelColor.value.setHex(hex)
    })

  fRim.addBinding(uniforms.uFresnelOffset, 'value', { label: 'Offset', min: -0.5, max: 0.5, step: 0.001 })
  fRim.addBinding(uniforms.uFresnelAmt, 'value', { label: 'Amount', min: 0, max: 5.0, step: 0.01 })
  fRim.addBinding(uniforms.uFresnelIntensity, 'value', { label: 'Intensity', min: 0, max: 4.0, step: 0.01 })

  ;['x', 'y', 'z'].forEach((k) => {
    fEll.addBinding(uniforms.uRimBiasDir.value, k as 'x' | 'y' | 'z', { label: `Bias ${k.toUpperCase()}`, min: -1, max: 1, step: 0.01 })
      .on('change', () => uniforms.uRimBiasDir.value.normalize())
  })

  fEll.addBinding(uniforms.uEllipseMajor, 'value', { label: 'Major (thin)', min: 0.2, max: 1.0, step: 0.01 })
  fEll.addBinding(uniforms.uEllipseMinor, 'value', { label: 'Minor (thick)', min: 1.0, max: 2.0, step: 0.01 })

  fNoise.addBinding(uniforms.uNoiseScale, 'value', { label: 'Scale', min: 0.01, max: 0.5, step: 0.005 })
  fNoise.addBinding(uniforms.uNoiseStrength, 'value', { label: 'Strength', min: 0.00, max: 0.5, step: 0.005 })

  return {
    paneGrid,
  }
}
