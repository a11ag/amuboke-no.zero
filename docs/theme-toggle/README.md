# 主题切换证据（2026-11-16）

基线（before）：`bokezero.amuspaces.top` 线上版本，仓库 `master` @ `3a35fd6`。
改动（after）：分支 `agent/blog-theme-toggle-b422f962bf12`，经典站右上角新增主题切换，`/zzz/` 为 ZZZ 主题。

## 桌面端

| 场景 | Before | After |
| --- | --- | --- |
| 经典站首页 | `before-classic-home-desktop.jpg` | `after-classic-home-desktop.jpg` |
| 经典站文章列表 | `before-classic-posts-desktop.jpg` | `after-classic-posts-desktop.jpg` |
| 经典站文章页 | `before-classic-post-desktop.jpg` | `after-classic-post-desktop.jpg` |
| ZZZ 主题首页 | —（本次新增 `/zzz/`） | `after-zzz-home-desktop.jpg` |
| ZZZ 主题文章列表 | — | `after-zzz-posts-desktop.jpg` |
| ZZZ 主题文章页（点赞/评论） | — | `after-zzz-article-desktop.jpg`、`after-zzz-comments.jpg` |
| ZZZ 主题图集 | — | `after-zzz-gallery-desktop.jpg` |
| ZZZ 主题关于 | — | `after-zzz-about-desktop.jpg` |

## 移动端（390×844）

| 场景 | Before | After |
| --- | --- | --- |
| 经典站首页 | `before-classic-home-mobile.jpg` | `after-classic-home-mobile.jpg` |
| ZZZ 主题首页 | — | `after-zzz-home-mobile.jpg` |

## 圆形扩散

- `transition-classic-to-zzz.jpg`：经典站 → ZZZ，从右上角按钮扩散，ZZZ 页面在圆形裁切区内。
- `transition-zzz-to-classic.jpg`：ZZZ → 经典站，同一几何圆心反向揭幕。

两张都是过渡中的真实截帧（不是合成图）。经典站按钮 `ZZZ`，ZZZ 主题按钮 `CLASSIC`。

## 2026-11-16 跟进：切换动画可见性

线上反馈“第一次切 ZZZ 没特效、切回经典稳定没特效”。真机复测发现跨文档 VT 其实创建了，
但目标页自己的入场动画（经典站 home-rise、ZZZ 的 reveal）让快照里的内容还在透明状态，
圆形裁切里看到的是一张“还没画完”的页面；另外从 ZZZ 子页切回时目标地址少了尾斜杠，
会多一次 308。修复后：

- `transition-before-live-z2c.jpg`：修复前线上反向切换的截帧，经典页内容仍在入场（发灰）。
- `transition-after-fix-z2c.jpg`：落地页把入场动画钉到终态后，圆形里的经典页内容完整。
- `transition-after-fix-c2z.jpg`：第一次经典 → ZZZ，圆形里的 ZZZ 内容完整。
- `transition-after-fix-c2z-throttled.jpg`：1.5 Mbps / 180 ms 限速下的第一次切换，仍能看到完整扩散。

## 2026-11-16 再次跟进：改成不依赖 View Transition 的确定性圆扩散

上一版把希望寄托在跨文档 View Transition 上，真机反复切换时仍然会出现“有时有圆、有时一闪而过”。
最终改为**在落地页做圆**：目标页在 `<head>` 里先铺一层旧主题底色（经典站浅色网格 / ZZZ 深色），
再用 CSS `mask-image` 的圆形挖洞从按钮圆心把新页面露出来，560ms 后移除覆盖层。
不再注入 `@view-transition`，所以：

- 不依赖浏览器的跨文档 VT 支持/时序；
- 每次切换（第一次、反复切换、两个方向）都走同一条路径；
- 页面在覆盖层下面已经加载完，圆里看到的是完整内容。

- `transition-after-overlay-c2z.jpg`：经典 → ZZZ（第一次），圆内 ZZZ 页面。
- `transition-after-overlay-z2c.jpg`：ZZZ → 经典，圆内经典页面。

## 2026-11-16 再次跟进：Windows“动画效果”关闭

反馈“完全没有圆扩散”。线上复现：浏览器 `prefers-reduced-motion: reduce` 为 true（Windows 关闭动画效果），
而 arrival 脚本当时在这条分支上直接 return，所以只剩路由切换、没有圆。已改为**主题切换的圆扩散
始终播放**（站内其他动画仍按系统设置降级）。
`transition-after-reduced-motion.jpg` 是 `reducedMotion: reduce` 下的截帧：圆内能看到完整 ZZZ 页面。

## 2026-11-16 按钮几何统一 + 切换不跳

反馈：切换后按钮位置变了，ZZZ→经典还会卡一下/跳一下。原因是两边按钮各自跟着导航栏布局走：

| 宽度 | 经典站 | ZZZ（修改前） |
|---|---|---|
| 1440 | (1343, 9) 70.7×30，圆角 | (1091, 16.5) 117.3×42，切角 |
| 1024 | (927, 9) 70.7×30 | (217, 13) 42×42（工具组没靠右） |
| 390 | (317, 10) 64.7×28 | (181, 9) 42×42 |

现在两套主题共用同一套 fixed 几何：桌面 `top:10px; right:16px; 116×34; radius 8px`，
移动 `top:8px; right:8px; 44×34`，无 clip-path；ZZZ 导航给按钮留出 132/52px，
经典站移动端给居中导航留 52px。两边都用 8px 细滚动条 + `scrollbar-gutter: stable`，
消除滚动条宽度造成的 5px 横向偏移。ZZZ 导航在 ≤1024 时把工具组靠右。

“跳一下”的另一个原因：经典站 router 的初始 `scrollBehavior` 会把页面强制拉回顶部，
覆盖 arrival 脚本恢复的 `sy`。现在主题落地时设置 `window.__amuThemeArrival`，
router 跳过初始回顶和路由缓存滚动；arrival 在 `load` + 字体就绪后用即时滚动恢复，
再等两帧开始圆扩散。实测 600px → 600px，两个方向都保持。

证据：`button-before-{1440,390}-{classic,zzz}.jpg` vs `button-after-{1440,390}-{classic,zzz}.jpg`；
after 里两个主题的按钮位置/尺寸完全一致。
