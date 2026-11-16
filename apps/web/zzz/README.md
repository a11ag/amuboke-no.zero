# ZZZ 主题（挂在 /zzz/）

2026-11-16 的绝区零视觉改版，作为经典站点的第二主题挂载在同一个域名下。

- **来源**：`amu263.github.io` 的 `site/` 快照；内容与经典站一致（文章 / 图集 / 音轨 / 项目 / 友链）。
- **构建**：`node zzz/scripts/build.mjs`，输出 `apps/web/dist/zzz/`；`pnpm build` 已经包含这一步。
- **图片**：全部走 `/images/...`、`/img/...`，与经典站共用 `apps/web/public/`，不重复拷贝。
- **主题桥**：`assets/js/theme-bridge.js` + `assets/css/theme-bridge.css`；路由映射与经典站的
  `src/composables/useThemeSwitch.ts` 成对维护。
- **内容**：`content/` 是快照。改文章/图集后要同时更新经典站的 `src/content/` 和这里，
  或在发布前重新生成本目录。

## 关键约定

- 页面深度由生成器计算，所有站内链接保持相对路径；因此整站可以原样挂在 `/zzz/` 下。
- 图片/头像使用根绝对路径，和经典站共享同一批文件。
- 文章页的点赞 slug、Giscus `data-term` 都使用经典站的 slug/pathname，两套主题共用同一份数据。
