import type { FolderApi } from 'tweakpane'
import { onUnmounted } from 'vue'

export function usePaneFolder(pane: any, options: Parameters<typeof pane.addFolder>[0]) {
  const folder: FolderApi = pane.addFolder(options)

  onUnmounted(() => {
    folder.dispose()
  })

  return folder
}
