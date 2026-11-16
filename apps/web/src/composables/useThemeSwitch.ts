// 经典站 → ZZZ 主题：路由映射 + 从按钮触点圆形扩散的跨文档切换。
//
// 两个主题都是独立的静态页面（/ 与 /zzz/），所以用跨文档 View Transition：
//   1. 点击时把按钮圆心 / 半径 / 滚动位置写进 sessionStorage
//   2. 给当前文档注入 @view-transition，让浏览器接管导航快照
//   3. 目标页在 <head> 里同步注入圆形裁切动画（见 index.html）
// 不支持跨文档 View Transition 的浏览器退化为同款圆形帘幕。

const ZZZ_POST_SLUGS: Record<string, string> = {
  'about-me': 'about',
  '给洛洛的一封信': 'gei-luoluo-de-yi-feng-xin'
}

/** 经典站路由 → ZZZ 主题对应路由。 */
export function toZzzPath(path: string): string {
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/') return '/zzz/'
  // 关于我是经典站的一篇文章，在 ZZZ 主题里是独立 /about/ 页。
  if (clean === '/posts/about-me') return '/zzz/about/'
  if (clean.startsWith('/posts/')) {
    const slug = decodeURIComponent(clean.slice('/posts/'.length))
    return `/zzz/posts/${encodeURIComponent(ZZZ_POST_SLUGS[slug] ?? slug)}/`
  }
  if (/^\/(gallery|listen)\/[^/]+$/.test(clean)) return `/zzz${clean}/`
  if (/^\/(posts|gallery|listen|projects|friends)$/.test(clean)) return `/zzz${clean}/`
  return '/zzz/'
}

function supportsCrossDocVT(): boolean {
  return (
    typeof window !== 'undefined' &&
    'onpageswap' in window &&
    'onpagereveal' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function setFavicon(href: string, type: string): void {
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = type
  link.href = href
  document.head.appendChild(link)
}

function optInCrossDocVT(): void {
  if (document.getElementById('amu-vt-optin')) return
  const style = document.createElement('style')
  style.id = 'amu-vt-optin'
  style.textContent = '@view-transition { navigation: auto; }'
  document.head.appendChild(style)
}

function curtainFallback(url: string, payload: { x: number; y: number; r: number }): void {
  const el = document.createElement('div')
  el.className = 'theme-curtain'
  el.style.setProperty('--curtain-x', `${payload.x}px`)
  el.style.setProperty('--curtain-y', `${payload.y}px`)
  el.style.setProperty('--curtain-r', `${payload.r}px`)
  el.innerHTML = '<span>AMU ARCHIVE</span>'
  document.body.appendChild(el)
  window.setTimeout(() => window.location.assign(url), 450)
}

export interface ThemeSwitchPayload {
  x: number
  y: number
  r: number
  sy: number
  from: 'classic'
  to: 'zzz'
}

/** 从经典站切到 ZZZ 主题；button 的几何中心就是圆形扩散圆心。 */
export function switchToZzz(button: HTMLElement): void {
  if (typeof window === 'undefined') return
  // 首访帘幕还在播放时不响应：那时用户看不到按钮，切过去会截到帘幕。
  if (document.documentElement.classList.contains('booting')) return
  button.dataset.switching = '1'
  // 导航失败/被阻止时别让按钮一直脉冲。
  window.setTimeout(() => delete button.dataset.switching, 2500)
  // 用地址栏而不是 route.path：hydration 之前 route 可能还没解析出当前页。
  const url = toZzzPath(window.location.pathname)
  const rect = button.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const payload: ThemeSwitchPayload = {
    x,
    y,
    r: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
    sy: window.scrollY || 0,
    from: 'classic',
    to: 'zzz'
  }
  try {
    window.sessionStorage.setItem('amu-theme-switch', JSON.stringify(payload))
    // 跳过 ZZZ 首访启动帘幕：主题切换要无缝。
    window.sessionStorage.setItem('amu-boot', '1')
  } catch {
    /* 隐私模式：退化为普通导航 */
  }
  setFavicon('/zzz/assets/img/favicon.svg', 'image/svg+xml')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0a0a')

  if (!supportsCrossDocVT()) {
    curtainFallback(url, payload)
    return
  }
  optInCrossDocVT()
  window.location.assign(url)
}

/** 悬停 / 聚焦时预取目标页 HTML，让圆形扩散开始前内容就绪（不提前加载图片）。 */
const ZZZ_CRITICAL_ASSETS: Array<{ href: string; as: 'style' | 'script' | 'font' }> = [
  { href: '/zzz/assets/css/zzz-tokens.css', as: 'style' },
  { href: '/zzz/assets/css/site.css', as: 'style' },
  { href: '/zzz/assets/css/theme-bridge.css', as: 'style' },
  { href: '/zzz/assets/js/site.js', as: 'script' },
  { href: '/zzz/assets/js/theme-bridge.js', as: 'script' },
  { href: '/zzz/assets/fonts/anton-latin.woff2', as: 'font' },
  { href: '/zzz/assets/fonts/archivo-black-latin.woff2', as: 'font' }
]
let zzzAssetsPrefetched = false

/** 悬停 / 聚焦 / 按下时预取目标 HTML 和 ZZZ 的阻塞资源，让第一次切换也够快。 */
export function prefetchZzz(): void {
  if (typeof document === 'undefined') return
  const url = toZzzPath(window.location.pathname)
  if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'document'
    link.href = url
    document.head.appendChild(link)
  }
  if (zzzAssetsPrefetched) return
  zzzAssetsPrefetched = true
  for (const asset of ZZZ_CRITICAL_ASSETS) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = asset.as
    link.href = asset.href
    if (asset.as === 'font') link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }
}
