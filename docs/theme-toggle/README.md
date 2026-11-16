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
