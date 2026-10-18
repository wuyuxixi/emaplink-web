# 迁移报告

## 1. 来源与范围

- **内容事实源**：`https://www.emaplink.com.cn/`（线上站点，2026-10 核查）。
- **旧本地镜像**：`E:\workspace\official-website`，只到 2025-01，含 107 篇资讯；仅作素材缓存与历史参考，不作为内容事实源。
- **新项目**：`E:\workspace\emaplink-web`。
- **范围**：14 个主导航页面 + 全部 121 篇资讯；116 篇原归档稿已全部转为 Markdown 发布。

## 2. 数量

| 项目 | 数量 |
|---|---:|
| 主导航页面 | 14 |
| 线上可访问内容页 | 141（135 重建 + 6 排除） |
| 线上资讯 | 121 |
| 已发布资讯 | 121 |
| 迁移底稿资讯 | 116（archive，已全部发布） |
| 已下载并优化图片 | 199 |
| 旧 URL 别名 | 148（14 栏目 + 121 资讯 + 13 排除/损坏链接） |
| 构建页面 | 148（14 栏目 + 121 资讯 + 12 分页 + 404） |
| 构建 HTML | 295（148 正式页 + 147 别名；`index.html` 为正式页） |
| 构建图片 | 237 个文件，约 15.56MB |
| 构建总体积 | 约 24.85MB |

## 3. 资讯转换

### 初版 5 篇（样例）

| # | 文件 | 原 ID | 日期 | 模板 | 转换处理 |
|---|---|---|---|---|---|
| 1 | `2026-10-13-websocket-access-control.md` | 134 | 2026-10-13 | 新 | 3 表格、14 代码块；原文代码块存在空格丢失/中文注释乱码，已逐块重写为可读代码 |
| 2 | `2026-08-22-crypto-evaluation-rule.md` | 133 | 2026-08-22 | 旧 | 纯文字；补 7 个 `##` 小节 |
| 3 | `2026-08-18-civil-aviation-crypto-standard.md` | 132 | 2026-08-18 | 旧 | 4 张正文图；保留外链；补图片 alt |
| 4 | `2026-05-30-password-defines-security.md` | 128 | 2026-05-30 | 旧 | 长文；补“人物简介”小节；摘要压缩到 300 字内 |
| 5 | `2026-05-30-mlps-compliance.md` | 127 | 2026-05-30 | 旧 | 3 表格；来源“密 安 护 航”修正为“密安护航”；补 `##` 小节与有序列表空格 |

### 处理规则

- 标题/日期/来源/摘要从页面与 `newsData.json` 提取；日期写入 frontmatter，来源写入 `source`。
- 删除 `script/style/iframe/video`、Word 内联样式、空 `span`、`&nbsp;` 占位。
- 图片路径改写为 `/images/news/shared/*.webp`，补 alt。
- 删除正文末尾的“注：内容均来源于互联网……”；由模板统一渲染免责声明。
- 133/127 原模板自带的 `password.mp4` 自动播放视频未迁移（属于模板内容，不是文章正文）；如需视频，后续在 MD 中手动嵌入。
- 133/128/127 的正文图片在线上 HTML 中位于注释内，实际不展示；因此未迁移。132 的 4 张图正常展示并保留。

### 补全 116 篇

- 文件命名：`src/content/news/news-{id}.md`，URL 为 `/news/news-{id}/`。
- 标题/日期/摘要来自 `newsData.json`；来源从归档稿 `p.meta` 提取。
- 正文清洗：移除注释/脚本/样式/视频/内联属性；`p.weight`、“趋势N”、“一、”等短段落升级为 `##`；表格/代码转 GFM。
- 图片：正文图下载并优化为 WebP（最大宽 1200），base64 图解码落地，按 `img-{n}-{hash}.webp` 存到 `public/images/news/news-{id}/`。
- 116 篇全部转换成功，0 失败；报告见 `data/publish-report.json`。
- 迁移底稿保留在 `archive/{id}.html`，仅作溯源，不参与构建。
- 旧 URL 映射：所有 121 篇 MD 都填写 `legacyPath`，别名自动指向新详情。

## 4. 图片

### 已使用

- 首页 Hero 3 张：`hero-3`、`hero-2`、`products/zsac-crypto-module/banner`。
- 产品/方案图标：使用内联 SVG，不用旧图。
- 关于：企业文化 2 张、10 张荣誉证书、ZSAC 标识。
- 资讯：132 的 4 张正文图（`132-1..4`）+ 116 篇补全稿的 193 张正文图。
- Logo：`logo.png`（页头）、`logo-footer.png`（页脚白色底块）。

### 未使用/可清理

- 产品/方案 banner（gateway/server/otp、solutions）部分未在页面展示；Hero 用了 crypto-module banner。
- 产品架构图：`products-insert/bottom.png` 为城市天际线，`products-app/middle.png` 为 ZTRUST 旧品牌图，均未使用。
- `products-model/1..4.png` 已转录为文字卡片，图片未直接展示。
- `about/contact-map.webp` 实际是客服人物图，不是地图；未使用。
- `news/shared/126-1.webp`、`83-1.webp` 对应图片在原文中被注释，未使用。
- 这些文件仍在 `public/images` 中，构建会复制；如需进一步减小体积，可删除未引用文件后重建。

### 优化

- 统一转 WebP；Hero 1920 宽，产品/方案 1600 宽，证书/资讯 1200 宽。
- 资讯图片 199 张、约 13.59MB；构建图片总量 237 张、约 15.56MB。
- 构建总体积约 24.85MB；旧站图片约 228.6MB。
- 资讯列表不再需要 121 张封面。

## 5. 文案修正

| 原文 | 修正 |
|---|---|
| PINEER OF DIGITAI SERVICE | PIONEER OF DIGITAL SERVICE |
| SS0 | SSO |
| Click（产品页残留） | 删除 |
| 适应场景 / 适用场景混用 | 统一“适用场景” |
| 汉韵阁C101 / C101座 | 统一“汉韵阁C101座” |
| Copyright © 2021 | © 2021–2026 |
| 御防强度 | 防御强度 |
| 于此同时 | 与此同时 |
| 普遍适配安全合规 | 普遍适配、安全合规 |
| 接 入完全网关 | 接入安全网关 |
| 指需要 | 只需 |
| 文章 `<title>` 全部“新闻中心 -联易软件” | 文章名｜联易软件 |
| 通用 meta description | 每页独立描述 |

## 6. 内容缺口与决策

- **行业案例页原为空**：用站内 7 篇公开报道整理 3 个案例（陕药通、陕非冷链、蒙冷链），标注“据公开报道整理”；补 6 个行业卡 + 10 个行业标签。未虚构客户名称、数字、资质。
- **合作伙伴页**：不在主导航，本轮不重建；旧 URL 指向 `/about/`。
- **媒体报道**：列表 7 条，详情全部 404；不重建，摘要用于行业案例；旧 URL 指向 `/news/` 或 `/about/cases/`。
- **隐藏旧产品/方案页**：视频网关、ZTRUST 安全中心、食安盾、药安盾不重建；旧 URL 指向首页对应区块。
- **116 篇资讯已全部补全**：每篇都有 `news-{id}.md` 与 `legacyPath`，旧 URL 已指向新详情；`archive/` 仅保留迁移底稿。

## 7. 验证结果

| 检查 | 结果 |
|---|---|
| `pnpm build` | 通过；148 个页面 + 148 个旧 URL 别名 |
| `pnpm check`（astro check） | 0 errors / 0 warnings / 0 hints |
| `pnpm check:content` | 通过；121 篇已发布、0 草稿 |
| `pnpm check:links` | 扫描 295 HTML、3613 内部链接/资源、121 旧文章别名；0 问题 |
| `pnpm test` | 5 个单元/内容测试通过 |
| `pnpm test:e2e` | 8 个 Playwright 用例通过 |
| 响应式 | 1440 / 375 无横向溢出；移动菜单/搜索/灯箱通过 |
| 构建体积 | 约 24.85MB；图片约 15.56MB |
| Lighthouse（移动端） | 首页/产品/文章：Performance 100、Accessibility 100、Best Practices 100、SEO 100 |
| Lighthouse 报告 | `docs/lighthouse/{home,product,article}.report.{json,html}` |

## 8. 已知限制

- 未做生产部署；`dist/` 可直接部署。
- Lighthouse 报告基于本机 Edge + 本地预览，生产环境需以真实网络复测。
- 补全 116 篇的正文图片 alt 多为“标题 + 配图 N”，可人工细化。
- 116 篇补全稿由脚本转换，极少数 Word 段落可能仍是普通段落而非小节标题；不影响内容完整性。
- 产品页没有使用旧架构图（旧图含 ZTRUST 品牌或仅为装饰），架构信息以文字/功能卡呈现。
- 行业案例为公开报道摘要，不是正式客户案例。
