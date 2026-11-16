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
