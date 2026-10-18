# 联易软件官网重构（emaplink-web）

以 `https://www.emaplink.com.cn/` 为内容事实源，使用 **Astro 7 + Tailwind CSS 4 + TypeScript** 重构的静态官网。

- 项目路径：`E:\workspace\emaplink-web`
- 旧仓库：`E:\workspace\official-website`（保留不动，仅作素材/历史参考）
- 当前范围：14 个主导航页面 + 全部 121 篇资讯
- 新闻内容由 `src/content/news/*.md` 驱动，新增文章不需要改代码

## 快速开始

```bash
pnpm install
pnpm dev        # 本地开发
pnpm build      # 构建 + 生成旧 URL 别名
pnpm preview    # 预览 dist
```

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 开发服务器 |
| `pnpm build` | 构建静态站，并生成 148 个旧 URL 别名 |
| `pnpm preview` | 预览构建结果 |
| `pnpm check` | Astro/TypeScript 检查 |
| `pnpm check:content` | 校验资讯 frontmatter、图片、slug、legacyPath |
| `pnpm check:links` | 扫描 `dist` 内部链接、资源、锚点、旧文章别名 |
| `pnpm optimize:image` | 把 PNG/JPG 批量或单张转为 WebP |
| `pnpm test` | Vitest 单元/内容测试 |
| `pnpm test:e2e` | Playwright 端到端测试（使用本机 Edge） |
| `pnpm lighthouse` | 对首页/产品/文章跑 Lighthouse（需本机 Chrome/Edge） |

## 目录

```text
emaplink-web/
├─ public/
│  ├─ images/                 # 已优化图片
│  ├─ robots.txt
│  ├─ _redirects              # 构建时补充 301
│  └─ web.config              # 构建时补充 IIS 301
├─ scripts/
│  ├─ migrate/                # 抓取、转换、归档、素材脚本
│  ├─ generate-aliases.mjs
│  ├─ check-content.mjs
│  ├─ check-links.mjs
│  ├─ inventory-links.mjs
│  ├─ inventory-pages.mjs
│  └─ lighthouse.mjs
├─ src/
│  ├─ components/             # Header/Footer/卡片/图标/搜索/灯箱
│  ├─ content/news/           # 121 篇 Markdown
│  ├─ content.config.ts
│  ├─ data/                   # 站点、产品、方案、关于、图片清单、旧资讯清单
│  ├─ layouts/
│  ├─ lib/                    # news / schema / pagination
│  ├─ pages/                  # 路由
│  ├─ scripts/                # 客户端交互
│  └─ styles/global.css       # Tailwind 4 + 设计令牌
├─ tests/                     # Vitest + Playwright
├─ docs/
│  ├─ content-inventory/      # 全站内容清单 + 116 篇迁移底稿
│  ├─ adding-news.md
│  ├─ news-template.md
│  ├─ design-system.md
│  ├─ migration-report.md
│  └─ deploy.md
├─ astro.config.mjs
├─ playwright.config.ts
├─ vitest.config.ts
└─ package.json
```

## 新增资讯

1. 复制 `docs/news-template.md`。
2. 重命名为 `YYYY-MM-DD-slug.md`，放入 `src/content/news/`。
3. 填写 `title`、`date`、`summary`；正文用 Markdown。
4. 图片（可选）放 `public/images/news/{slug}/`，用 `/images/news/{slug}/...` 引用。
5. `pnpm dev` 预览；`pnpm check:content` 校验；`pnpm build` 发布。

**不需要封面。** 列表/首页不展示封面；详情页封面为可选字段。

完整说明见 [docs/adding-news.md](docs/adding-news.md)。

## 文档

- [内容清单](docs/content-inventory/README.md)
- [新增资讯](docs/adding-news.md)
- [资讯模板](docs/news-template.md)
- [设计系统](docs/design-system.md)
- [迁移报告](docs/migration-report.md)
- [部署说明](docs/deploy.md)

## 当前状态

- 构建：148 个页面（14 栏目 + 121 资讯 + 12 个分页 + 404）+ 148 个旧 URL 别名；`dist` 约 24.85MB，图片约 15.56MB。
- 内容：121 篇资讯全部发布，每篇都有独立详情页。
- 检查：`astro check` 0 errors；`check:content` 通过；`check:links` 0 问题。
- 测试：Vitest 5 项通过；Playwright 8 项通过。
- Lighthouse（移动端，本机预览）：首页/产品/文章 Performance 100、Accessibility 100、Best Practices 100、SEO 100。

## 说明

- 行业案例页原为空，现使用站内 7 篇公开报道整理 3 个案例，标注“据公开报道整理”；不虚构客户与数字。
- 121 篇资讯的旧 URL 已全部指向新详情页（`/news/{slug}/`）；`legacyPath` 继续作为旧 URL 映射依据。
- 未做生产部署；`dist/` 可直接部署，见 [docs/deploy.md](docs/deploy.md)。
