import { ViteSSG, type ViteSSGOptions } from 'vite-ssg'
import App from './app.vue'
import { POSTS, postRoute } from './content/build-time-index'
import { vuetify } from './plugins/vuetify'
import { routes, scrollBehavior, registerSeoGuard } from './router'
import { registerNavigationLoading } from './router-loading'
import 'virtual:uno.css'
// 单元 2: tokens.scss 输出 :root/.v-theme--dark 下的 --theme-* CSS 变量
// 必须在 base.css 之前 import，这样 base 层可以消费这些变量
import './styles/tokens.scss'
import './styles/base.css'

export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  ({ app, router, isClient }) => {
    // 文档 head 由 vite-ssg 自己创建并安装（ViteSSG 默认 useHead: true）。
    // 这里不再重复 createHead()：重复安装两个 unhead 实例既冗余，也把项目
    // 的直接依赖钉在了存在 advisory 的 unhead v1 上（安全补丁 2026-10-22）。
    app.use(vuetify)

    // Register scroll restoration + SEO guard
    if (isClient) {
      registerSeoGuard(router)
      registerNavigationLoading(router)
    }
  }
)

export const includedRoutes: NonNullable<ViteSSGOptions['includedRoutes']> = (paths) => [
  ...new Set([
    ...paths.filter((path) => !path.includes(':')),
    ...POSTS.map(({ slug }) => postRoute(slug))
  ])
]