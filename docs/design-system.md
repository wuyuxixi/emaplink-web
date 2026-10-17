# 设计系统

## 1. 概念

**信任网格 / Trust Grid**：以细网格、连接节点、深色科技底与克制的蓝绿光效，表达“设备—用户—应用—授权”的可信连接。避免黑客风、锁头堆砌、过度渐变和廉价科技蓝。

## 2. 设计令牌

定义在 `src/styles/global.css` 的 `@theme` 中。

### 色板

| Token | 值 | 用途 |
|---|---|---|
| `ink-950` | `#06131F` | 深色 Hero、页脚、CTA |
| `ink-900` | `#0A1D2E` | 深色区块、标题 |
| `navy-800` | `#0E2F4F` | 深色层次 |
| `brand-700` | `#084D86` | 主色 hover |
| `brand-600` | `#0062A2` | 主色（沿用旧站） |
| `brand-500` | `#1583C7` | 链接/强调 |
| `brand-100` | `#E6F1F9` | 浅色底 |
| `cyan-400` | `#3CC8E6` | 深色底强调 |
| `green-500` | `#6DBE45` | Logo 绿，少量点缀 |
| `signal-600` | `#D94F28` | 可访问橙，少量强调 |
| `paper` | `#F7F9FB` | 页面底色 |
| `surface` | `#FFFFFF` | 卡片 |
| `line` | `#DCE5EC` | 边框 |
| `muted` | `#5A6B7B` | 次级文字 |
| `text` | `#132433` | 正文 |

### 字体

- 中文系统栈：`"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`。
- 不加载 CJK WebFont，避免数 MB 下载。
- Display：56/64、48/56、40/48、32/40。
- Body：16/28、18/30；中文行高 1.7。
- Eyebrow：12/16，字距 0.12em，大写。
- 数字：等宽/表格数字，用于日期、序号。

### 布局

- 容器：`min(100% - 2.5rem, 75rem)`（1200px）；移动端边距 1rem。
- 12 栏网格；区块间距 96/64px。
- 卡片圆角 16px；按钮 pill；1px 边框。
- 阴影：`--shadow-card`、`--shadow-menu`。

### 动效

- 进入：12px 上移 + 淡入，400ms，`cubic-bezier(.2,.7,.2,1)`。
- 轮播：7s 自动；悬停/聚焦暂停；支持前后/圆点/暂停。
- 全部尊重 `prefers-reduced-motion`。

## 3. 组件

| 组件 | 文件 | 说明 |
|---|---|---|
| Header | `src/components/SiteHeader.astro` | 吸顶、Mega Menu、移动抽屉、搜索入口 |
| Footer | `src/components/SiteFooter.astro` | 深色、四栏、ICP、回到顶部 |
| Logo | `src/components/ui/Logo.astro` | 浅色/深色底两种呈现 |
| Icon | `src/components/ui/Icon.astro` | 内联 SVG 线性图标 |
| ButtonLink | `src/components/ui/ButtonLink.astro` | primary / ghost / light / text |
| SectionHeading | `src/components/ui/SectionHeading.astro` | eyebrow + 标题 + lead |
| PageHero | `src/components/ui/PageHero.astro` | 内页深色 Hero + 面包屑 + 右侧要点 |
| Breadcrumbs | `src/components/ui/Breadcrumbs.astro` | 可见面包屑 |
| HomeHero | `src/components/HomeHero.astro` | 首页 3 屏轮播 |
| ProductCard | `src/components/ProductCard.astro` | 图标卡，无图片 |
| SolutionCard | `src/components/SolutionCard.astro` | 深色/浅色两种 tone |
| NewsRow | `src/components/NewsRow.astro` | 文字索引行，无封面 |
| Pagination | `src/components/Pagination.astro` | 10 条/页 |
| CtaBand | `src/components/CtaBand.astro` | 联系 CTA |
| SearchDialog | `src/components/SearchDialog.astro` | 站内搜索弹层 |
| AboutNav | `src/components/AboutNav.astro` | 关于页侧栏 |

## 4. 页面模板

- **首页**：Hero 轮播 → 服务条 → ZSAC 生态 → 产品 4 卡 → 方案 3 卡（深色）→ 价值 4 卡 → 行业标签 → 最新 3 条资讯（文字）→ CTA。
- **产品页**：PageHero + 产品介绍双栏 + 功能 Bento（7 项 + CTA 卡）→ 核心机制/核心能力（按数据）→ 生态（可选）→ 优势 → 适用场景（深色）→ 相关产品 → CTA。
- **解决方案页**：PageHero + 市场需求双栏 → 方案思路（深色）+ 3 能力 → 方案应用 3 卡 → 适用场景 → 相关方案（浅色卡）→ CTA。
- **新闻列表**：PageHero + 计数/搜索 → “最新”标记行 + 文字索引 → 分页 → CTA。
- **新闻详情**：面包屑 → 标题/日期/来源/复制链接 → 760px 正文 + TOC → 免责声明 → 上下篇 → 相关阅读 → 图片灯箱。
- **关于**：PageHero + 侧栏 + 品牌语/简介/关注卡/目标；文化页使命/价值观/照片；荣誉页 2 列证书卡 + 灯箱；案例页 3 案例 + 6 行业卡 + 标签；联系页联系卡 + 地址卡。
- **404**：品牌化提示 + 返回首页/资讯/联系。

## 5. 新闻设计约束

- **列表/首页不展示封面**；封面只在详情页 frontmatter 显式提供时展示。
- 列表为文字优先的编辑索引：日期 + 标题 + 摘要 + 来源 + 箭头；最新一篇加“最新”标记。
- 新增资讯不需要找封面图。
- 详情页无默认 banner；正文 760px，表格横向滚动，代码块，图片灯箱，TOC。

## 6. 内容规范

- 标题：简洁、事实性；不虚构客户、数据、资质。
- 按钮：动词 + 对象，如“探索产品”“获取产品资料”“查看全部资讯”。
- 日期：`YYYY年M月D日`（详情）、`YYYY.MM.DD`（列表）。
- 来源：详情页显示“来源：xxx”；列表仅在摘要下方小字显示。
- 图片：内容图必须有 alt；装饰图 `alt=""`；图片内文字尽量转为 HTML。
- 文案修正：PINEER → PIONEER、DIGITAI → DIGITAL、SS0 → SSO、删除 Click、统一“适用场景”。

## 7. 可访问性

- 每页一个 h1；语义化 landmark；跳转到主内容。
- Header/Mega Menu/移动抽屉：`aria-expanded`、`aria-controls`、Escape、焦点陷阱、焦点归还。
- 轮播：暂停/播放、前后、键盘、`aria-roledescription`。
- 灯箱：原生 `<dialog>`，Esc/遮罩关闭。
- 对比度 AA；橙色只作小面积强调。
- 表格 `scope`；代码块横向滚动。

## 8. 性能

- 纯静态；无 jQuery/Bootstrap/WOW/canvas。
- CSS ≤ 35KB gzip；JS ≤ 30KB gzip（不含按需搜索索引）。
- 图片 AVIF/WebP + 懒加载 + 宽高；Hero 预加载。
- 当前 `dist` 约 4.2MB，图片约 2.9MB。
