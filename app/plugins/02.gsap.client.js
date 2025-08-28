import gsap from 'gsap'

import Tempus from 'tempus'

export default defineNuxtPlugin((_nuxtApp) => {
  gsap.config({
    force3D: true,
  })

  gsap.ticker.remove(gsap.updateRoot)

  gsap.ticker.lagSmoothing(0)

  Tempus.add((time) => {
    gsap.updateRoot(time / 1000)
  })
})
