import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'
import { nextTick } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  let container = document.getElementById('app-debug-pane')
  container = document.createElement('div')
  container.id = 'app-debug-pane'
  document.body.appendChild(container)

  const pane = new Pane({ title: 'App', container })
  pane.registerPlugin(EssentialsPlugin)

  const fpsGraph = pane.addBlade({
    index: 1,
    view: 'fpsgraph',
    label: '📈 FPS',
    rows: 2,
  })

  async function animate() {
    fpsGraph.begin()
    await nextTick()
    fpsGraph.end()
  }

  const unsubscribe = nuxtApp.$tempus.add(animate)

  nuxtApp.hook('app:unmounted', () => {
    unsubscribe()
    pane.dispose?.()
    container?.remove()
  })

  nuxtApp.provide('pane', pane)
})
