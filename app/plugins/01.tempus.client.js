import Tempus from 'tempus'

export default defineNuxtPlugin((nuxtApp) => {
  Tempus.patch()

  nuxtApp.provide('tempus', Tempus)
})
