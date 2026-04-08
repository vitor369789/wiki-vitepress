import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import AuthGuard from './components/AuthGuard.vue'
import UserMenu from './components/UserMenu.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(UserMenu),
      'doc-before': () => h(AuthGuard, null, {
        default: () => null
      })
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('AuthGuard', AuthGuard)
    app.component('UserMenu', UserMenu)
  }
} satisfies Theme
