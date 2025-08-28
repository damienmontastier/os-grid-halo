import { useNuxtApp } from '#app'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'

export function setupEffectsPane(props) {
  const { $pane } = useNuxtApp()

  const paneEffects = usePaneFolder($pane, { title: '🗺️ Effects', expanded: true })

  const toneMappingPane = usePaneFolder(paneEffects, { title: '🎨 Tone Mapping', expanded: false })

  toneMappingPane.addBinding(props.toneMapping, 'mode', {
    options: Object.keys(ToneMappingMode).map(key => ({
      text: key,
      value: ToneMappingMode[key as keyof typeof ToneMappingMode],
    })),
  })

  const bloomPane = usePaneFolder(paneEffects, { title: '🌟 Bloom', expanded: false })
  bloomPane.addBinding(props.bloom, 'intensity', {
    min: 0,
    max: 10,
    step: 0.1,
  })

  bloomPane.addBinding(props.bloom, 'mipmapBlur')
  bloomPane.addBinding(props.bloom, 'blendFunction', {
    options: Object.keys(BlendFunction).map(key => ({
      text: key,
      value: BlendFunction[key as keyof typeof BlendFunction],
    })),
  })
  bloomPane.addBinding(props.bloom, 'kernelSize', {
    options: Object.keys(KernelSize).map(key => ({
      text: key,
      value: KernelSize[key as keyof typeof KernelSize],
    })),
  })
  bloomPane.addBinding(props.bloom, 'luminanceThreshold', {
    min: 0,
    max: 1,
    step: 0.01,
  })
  bloomPane.addBinding(props.bloom, 'luminanceSmoothing', {
    min: 0,
    max: 1,
    step: 0.001,
  })

  const fishEyePane = usePaneFolder(paneEffects, { title: '🐟 Fish Eye', expanded: false })

  fishEyePane.addBinding(props.fishEye.lensS, 0, {
    label: 'lensS.x',
    step: 0.01,
    min: -2,
    max: 2,
  })

  fishEyePane.addBinding(props.fishEye.lensS, 1, {
    label: 'lensS.y',
    step: 0.01,
    min: -2,
    max: 2,
  })

  fishEyePane.addBinding(props.fishEye.lensF, 0, {
    label: 'lensF.x',
    step: 0.01,
    min: -2,
    max: 2,
  })

  fishEyePane.addBinding(props.fishEye.lensF, 1, {
    label: 'lensF.y',
    step: 0.01,
    min: -2,
    max: 2,
  })

  fishEyePane.addBinding(props.fishEye, 'scale', {
    step: 0.01,
    min: 0.1,
    max: 2,
  })

  const barrelBlurPane = usePaneFolder(paneEffects, { title: '🔍 Barrel Blur', expanded: false })

  barrelBlurPane.addBinding(props.barrelBlur, 'amount', {
    step: 0.001,
    min: 0,
    max: 0.05,
  })

  barrelBlurPane.addBinding(props.barrelBlur, 'offsetX', {
    step: 0.01,
    min: 0,
    max: 1,
  })

  barrelBlurPane.addBinding(props.barrelBlur, 'offsetY', {
    step: 0.01,
    min: 0,
    max: 1,
  })

  return {
    paneEffects,
  }
}
