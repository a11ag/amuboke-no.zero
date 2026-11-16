/* ----------------------------------------------------------------
 * theme-bridge.js — 经典站 ↔ ZZZ 主题切换（ZZZ 侧）
 *
 * 点击右上角切换按钮时：
 *   1. 记录按钮中心点，作为圆形扩散的圆心（sessionStorage 跨文档传递）
 *   2. 立即把 favicon / theme-color 换成经典站那一套
 *   3. 支持跨文档 View Transition 的浏览器直接导航，由目标页做圆形裁切；
 *      不支持的浏览器用同款圆形帘幕兜底
 * 另外接管文章页的点赞与 giscus 评论（与经典站同一套数据/配置）。
 * ---------------------------------------------------------------- */
(() => {
  'use strict'

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

  // ZZZ 文章 slug → 经典站 slug（只有这两篇换过名字）
  const CLASSIC_POST_SLUGS = {
    about: 'about-me',
    'gei-luoluo-de-yi-feng-xin': '给洛洛的一封信',
  }

  // 当前 /zzz/... 地址 → 经典站同义路由
  function classicPath(pathname) {
    let p = pathname.replace(/^\/zzz(?=\/|$)/, '') || '/'
    if (p === '/') return '/'
    // 经典站是目录式静态页，统一带尾斜杠，避免 Cloudflare Pages 的 308。
    if (p === '/about/' || p === '/about') return '/posts/about-me/'
    if (p === '/archive/' || p === '/archive') return '/posts/'
    let m = p.match(/^\/posts\/([^/]+)\/?$/)
    if (m) {
      const slug = decodeURIComponent(m[1])
      return '/posts/' + encodeURIComponent(CLASSIC_POST_SLUGS[slug] || slug) + '/'
    }
    if (/^\/(gallery|listen)\/[^/]+\/?$/.test(p)) return p.replace(/\/+$/, '') + '/'
    if (/^\/projects\/[^/]+\/?$/.test(p)) return '/projects/'
    return p.replace(/\/+$/, '') + '/'
  }

  function getSwitchPayload(btn, to) {
    const rect = btn.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    return {
      x,
      y,
      r: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
      sy: window.scrollY || 0,
      from: 'zzz',
      to,
    }
  }

  function setFavicon(href) {
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = href
    document.head.appendChild(link)
  }

  function goClassic(url, btn) {
    // 首访启动帘幕还在时按钮不可见；避免把帘幕截进圆形快照。
    if (document.documentElement.classList.contains('booting')) return
    btn.classList.add('is-switching')
    window.setTimeout(() => btn.classList.remove('is-switching'), 2500)
    const payload = getSwitchPayload(btn, 'classic')
    try {
      window.sessionStorage.setItem('amu-theme-switch', JSON.stringify(payload))
      // 经典站的首访帘幕与 ZZZ 的启动帘幕都跳过：主题切换要无缝
      window.sessionStorage.setItem('amuboke-no.zero:boot-splash', '1')
      window.sessionStorage.setItem('amu-boot', '1')
    } catch { /* 隐私模式：退化为普通导航 */ }
    setFavicon('/favicon.ico')
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.setAttribute('content', '#f0f2f5')
    // 圆扩散在目标页的 arrival 脚本里完成；这里只负责记录圆心并导航。
    window.location.assign(url)
  }

  const switchBtns = $$('[data-theme-switch]')
  if (switchBtns.length) {
    const target = classicPath(window.location.pathname)
    let prefetched = false
    const prefetch = () => {
      if (prefetched) return
      prefetched = true
      const docLink = document.createElement('link')
      docLink.rel = 'prefetch'
      docLink.as = 'document'
      docLink.href = target
      document.head.appendChild(docLink)
      // 目标页是带 hash 的 Vue bundle：先读 HTML 再预热 css/js，
      // 这样第一次切回经典站时新页面已经就绪，圆形动画不会被慢加载拖成“没效果”。
      fetch(target, { credentials: 'same-origin' })
        .then((res) => res.text())
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html')
          const seen = new Set()
          doc.querySelectorAll('link[rel="stylesheet"][href], link[rel="modulepreload"][href], script[src]').forEach((el) => {
            const href = el.getAttribute('href') || el.getAttribute('src') || ''
            if (!href.startsWith('/') || seen.has(href)) return
            seen.add(href)
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.as = el.tagName === 'SCRIPT' ? 'script' : 'style'
            link.href = href
            document.head.appendChild(link)
          })
        })
        .catch(() => { /* 预取失败不影响切换 */ })
    }
    switchBtns.forEach((btn) => {
      btn.setAttribute('href', target)
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        goClassic(target, btn)
      })
      btn.addEventListener('pointerenter', prefetch)
      btn.addEventListener('focus', prefetch)
      btn.addEventListener('pointerdown', prefetch)
      btn.addEventListener('touchstart', prefetch, { passive: true })
    })
  }

  /* -------- 文章页：点赞 -------- */
  const likeBtn = $('[data-like]')
  if (likeBtn) {
    const slug = likeBtn.dataset.likeSlug || ''
    const countEl = $('[data-like-count]', likeBtn)
    const baseCount = slug === 'hello-world' ? 42 : 0
    let count = baseCount
    let liked = false
    try { liked = Boolean(window.localStorage.getItem('liked_' + slug)) } catch { /* 隐私模式 */ }
    const render = () => {
      if (countEl) countEl.textContent = String(count)
      likeBtn.classList.toggle('is-liked', liked)
      likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false')
      likeBtn.title = liked ? '已点赞' : '点赞这篇文章'
    }
    if (liked) count = baseCount + 1
    render()
    likeBtn.addEventListener('click', () => {
      if (liked) return
      liked = true
      count += 1
      try { window.localStorage.setItem('liked_' + slug, '1') } catch { /* ignore */ }
      render()
    })
  }

  /* -------- 文章页：giscus 评论（与经典站共用同一 discussion） -------- */
  const mount = $('[data-giscus]')
  if (mount) {
    const term = mount.dataset.term || window.location.pathname
    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      const script = document.createElement('script')
      script.src = 'https://giscus.app/client.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.setAttribute('data-repo', 'amu263/gisdiscus')
      script.setAttribute('data-repo-id', 'R_kgDOUBKHMw')
      script.setAttribute('data-category', 'Announcements')
      script.setAttribute('data-category-id', 'DIC_kwDOUBKHM84DD_cL')
      script.setAttribute('data-mapping', 'specific')
      script.setAttribute('data-term', term)
      script.setAttribute('data-strict', '0')
      script.setAttribute('data-reactions-enabled', '1')
      script.setAttribute('data-emit-metadata', '0')
      script.setAttribute('data-input-position', 'top')
      script.setAttribute('data-theme', 'noborder_light')
      script.setAttribute('data-lang', 'zh-CN')
      script.setAttribute('data-loading', 'lazy')
      mount.appendChild(script)
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          load()
        }
      }, { rootMargin: '600px 0px' })
      io.observe(mount)
    } else {
      load()
    }
  }
})()
