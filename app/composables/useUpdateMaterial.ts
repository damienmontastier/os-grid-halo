import type { Material } from 'three'
import { unref } from 'vue'

export function useUpdateMaterial() {
  function updateMaterial(
    material: Material | Material[] | Ref<Material | Material[]>,
    updates: Record<string, any>,
  ) {
    const mat = unref(material)

    const applyUpdates = (m: Material) => {
      if (!m) {
        console.warn('[useUpdateMaterial] Material is null or undefined, skipping updates.')
        return
      }

      for (const [key, value] of Object.entries(updates)) {
        if (key in m) {
          if ((key === 'color' || key === 'emissive') && typeof value === 'string') {
            // Ensure the correct instance of Color
            m[key].set(value)
          }
          else {
            // @ts-expect-error – on accepte que l’utilisateur sait ce qu’il fait
            m[key] = value
          }
        }
        else {
          console.warn(`[useUpdateMaterial] Property "${key}" does not exist on material`, m)
        }
      }

      m.needsUpdate = true
    }

    if (Array.isArray(mat)) {
      mat.forEach(applyUpdates)
    }
    else if (mat) {
      applyUpdates(mat)
    }
  }

  return { updateMaterial }
}
