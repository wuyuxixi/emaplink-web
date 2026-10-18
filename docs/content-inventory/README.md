# 联易软件官网内容清单

> 来源：`https://www.emaplink.com.cn/`（线上站点，2026-10 核查）
> 目标：在 `E:\workspace\emaplink-web` 重构为 Astro 静态站
> 范围：14 个主导航页面 + 全部 121 篇资讯。116 篇原归档稿已全部转为 Markdown 发布。

## 1. 盘点结论

| 项目 | 数量 | 说明 |
|---|---:|---|
| 主导航页面 | 14 | 首页、4 个产品、3 个解决方案、5 个关于页、新闻列表 |
| 线上可访问内容页 | 141 | 135 个重建页 + 6 个排除页（旧产品/方案、合作伙伴、媒体报道） |
| 线上资讯 | 121 | 2021-05-26 至 2026-10-13；编号到 134，中间有缺号 |
| 已发布资讯 | 121 | 全部转为 Markdown，位于 `src/content/news/` |
| 迁移底稿 | 116 | 保存在 `archive/`，仅作溯源，不参与构建 |
| 已下载并优化图片 | 199 | 首页、产品、方案、关于、121 篇资讯正文图 |
| 旧 URL 兼容 | 148 | 14 个栏目 + 121 篇资讯 + 13 个排除页/损坏链接 |

## 2. 页面矩阵

| # | 页面 | 旧 URL | 新路由 | 状态 |
|---|---|---|---|---|
| 1 | 首页 | `/index.html` | `/` | 已重建 |
| 2 | ZSAC智能准入控制系统 | `/products-insert.html` | `/products/zsac-gateway/` | 已重建 |
| 3 | ZSAC接入安全服务端 | `/products-app.html` | `/products/zsac-server/` | 已重建 |
| 4 | ZSAC接入安全密码模块 | `/products-model.html` | `/products/zsac-crypto-module/` | 已重建 |
| 5 | ZSAC动态令（密码模块） | `/products-dynamic.html` | `/products/zsac-otp/` | 已重建 |
| 6 | 多形态终端接入安全 | `/programme-insert.html` | `/solutions/multi-terminal-access/` | 已重建 |
| 7 | 数据共享交互安全 | `/programme-interactive.html` | `/solutions/data-exchange/` | 已重建 |
| 8 | 用户认证与应用保护 | `/programme-app.html` | `/solutions/app-protection/` | 已重建 |
| 9 | 公司简介 | `/about.html` | `/about/` | 已重建 |
| 10 | 企业文化 | `/about1.html` | `/about/culture/` | 已重建 |
| 11 | 荣誉资质 | `/about2.html` | `/about/honors/` | 已重建 |
| 12 | 行业案例 | `/industry-case.html` | `/about/cases/` | 已重建（原页为空，现补行业矩阵 + 3 个公开报道案例） |
| 13 | 联系我们 | `/contact.html` | `/contact/` | 已重建 |
| 14 | 新闻列表 | `/news.html` | `/news/` | 已重建（文字索引，无封面） |

## 3. 全局元素

- **品牌**：联易软件 / emaplink；品牌语“联于政通，易于人和”。
- **电话**：029-87607528。
- **邮箱**：maplink@emaplink.com.cn。
- **地址**：陕西省西安市高新区西安软件园汉韵阁C101座。
- **ICP**：陕ICP备18022983号-1（链接工信部）。
- **版权**：新站使用“© 2021–2026 联易软件有限公司”。
- **导航**：首页 / 产品中心 / 解决方案 / 行业案例 / 新闻动态 / 关于我们 / 联系我们。
- **主导航旧版**：产品中心 4 项；解决方案 3 项；关于我们含公司简介、企业文化、新闻中心、荣誉资质、行业案例、合作伙伴、联系我们（合作伙伴后来隐藏）。
- **页脚旧版**：电话、邮箱、地址、版权、ICP。
- **无**：在线表单、站内搜索、第三方统计脚本、英文版。

## 4. 内容规模与特征

### 资讯

- 121 篇，全部详情 URL 已验证 200。
- 120 篇旧模板（`#detailBody`，Word 粘贴 HTML，含内联样式、空 `span`、`&nbsp;`），1 篇新模板（`.news-content`，表格/代码）。
- 正文合计约 36.6 万字符；正文内图片约 285 处；4 篇含 base64 内嵌图；5 篇含表格；无视频、无 iframe（模板注释中的视频除外）。
- 旧列表由 `newsData.json` 客户端渲染，5 条/页；详情 `<title>` 全部是“新闻中心 -联易软件”。
- 121 篇全部发布：5 篇初版（`134 / 133 / 132 / 128 / 127`）+ 116 篇补全（`news-{id}.md`）。
- 列表 10 条/页，当前共 13 页；首页展示最新 3 条。

### 图片

- 本地旧镜像约 671 张、228.6MB；新站只引用需要的图。
- 已优化并落地 199 张，约 13.59MB：首页 Hero、产品/方案素材、企业文化图、10 张荣誉证书、121 篇资讯正文图。
- 首批 40 张见 `assets.csv`；116 篇补全资讯新增图片见 `news-images.csv`。
- 旧站图片几乎无 alt：首页 25 张仅 7 张有 alt；产品/方案页 0 张；荣誉页仅 1 张。

## 5. 关键发现与处理

| 发现 | 处理 |
|---|---|
| 本地 `official-website` 只到 2025-01、107 篇资讯；线上 121 篇 | 以线上为唯一事实源，旧仓库只作素材缓存 |
| 文章双模板 + Word 脏 HTML | 121 篇全部转 Markdown 并清洗；116 篇保留归档底稿用于溯源 |
| 旧 Header/Footer 由 jQuery 注入，`news-details/` 下另有相对路径版本 | 新站用 Astro 组件统一渲染 |
| 首页新闻写死 6 条，与列表不同步 | 新站首页自动取最新 3 条 |
| 行业案例页只有标题 | 用站内 7 篇公开报道整理 3 个案例 + 行业矩阵，明确标注“据公开报道整理” |
| 媒体报道孤立，7 个详情 404 | 不重建；旧 URL 指向 `/news/` 或 `/about/cases/` |
| 隐藏旧页仍可访问（视频网关、ZTRUST 安全中心、食安盾、药安盾、合作伙伴） | 不重建；旧 URL 指向首页对应区块或关于页 |
| 文章标题/Meta 重复 | 每篇用文章名 + 独立摘要 |
| 图片无 alt、关键信息烘焙在图里 | 补 alt；ZSAC 密码模块 4 张机制图已转录为文字卡片 |
| 229MB 图片、固定 rem、jQuery/WOW/canvas | 静态化、图片优化、响应式、去 jQuery |
| 文案瑕疵：PINEER / DIGITAI / SS0 / Click / 适应场景 | 已修正，详见 `../migration-report.md` |
| 资讯封面强绑定 | 新列表/首页不使用封面；详情页封面可选 |

## 6. 新站资讯工作流

1. 在 `src/content/news/` 新建 `YYYY-MM-DD-slug.md`。
2. 填写 `title`、`date`、`summary`；`source`、`cover`、`draft`、`legacyPath` 可选。
3. 正文用 Markdown；图片放 `public/images/news/{slug}/`，用绝对路径引用。
4. `pnpm dev` 预览；`pnpm check:content` 校验；`pnpm build` 发布。
5. 详见 `../adding-news.md` 与 `../news-template.md`。

## 7. 文件说明

```text
docs/content-inventory/
├─ README.md                  # 本文件
├─ pages/                     # 14 个栏目页逐页清单
├─ data/
│  ├─ articles.csv            # 121 篇资讯元数据、发布标记
│  ├─ published-news.csv      # 121 篇已发布资讯统计
│  ├─ assets.csv              # 首批 40 张素材
│  ├─ news-images.csv         # 199 张资讯图片尺寸/体积
│  ├─ publish-report.json     # 116 篇补全结果
│  └─ links.csv               # 链接与状态
├─ archive/                   # 116 篇迁移底稿（已全部发布，保留溯源）
└─ excluded.md                # 不重建页面及跳转目标
```

> 说明：资讯正文的“唯一事实源”是 `src/content/news/*.md`（121 篇）。`archive/*.html` 是迁移底稿，`articles.csv` 只记录元数据与统计，不重复粘贴全文。
