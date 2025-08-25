// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    formatters: true,
    stylistic: true,
    vue: {
      overrides: {
        // 'vue/attribute-hyphenation': 'off',
        // 'vue/block-order': ['error', {
        //   order: ['template', 'script', 'style'],
        // }],
      },
    },
  }),
)
