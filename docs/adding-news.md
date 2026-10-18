# 新增一篇资讯

新闻内容由 `src/content/news/*.md` 驱动。新增一篇资讯只需要拷贝一个 Markdown 文件，不需要改路由、列表、分页或搜索代码。

## 1. 新建文件

复制 `docs/news-template.md`，重命名为：

```text
YYYY-MM-DD-slug.md
```

例如：

```text
src/content/news/2026-11-02-my-news.md
```

- 文件名去掉 `.md` 就是 **slug**，详情页 URL 为 `/news/{slug}/`。
- 建议 slug 用英文小写、数字和连字符；中文标题放 frontmatter。
- 同名文件会冲突；`pnpm check:content` 会报错。
- **不要用 `news-127.md`**：项目里已经有 ID 127 的文章（`news-127.md`）。“第 127 篇”是序号，不是旧文章 ID；新文章请用日期 slug，例如 `2026-11-05-my-news.md`。

## 2. 填写 frontmatter

```yaml
---
title: 文章标题
date: 2026-11-02
summary: 一句话摘要，列表页展示，建议 60–120 字。
source: 来源名称（可选）
# cover: /images/news/2026-11-02-my-news/cover.webp  # 可选，列表不展示
# coverAlt: 封面图描述
draft: false
# legacyPath: news-details/news-details120.html  # 可选，旧 URL 映射
---
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 文章标题 |
| `date` | 是 | `YYYY-MM-DD`，用于排序与展示 |
| `summary` | 是 | 列表摘要，建议 60–120 字，最多 300 字 |
| `source` | 否 | 来源，显示在详情页 |
| `cover` | 否 | 详情页可选封面；**列表/首页永远不展示封面** |
| `coverAlt` | 否 | 有 cover 时建议填写 |
| `draft` | 否 | `true` 时不出现在列表、详情、搜索 |
| `legacyPath` | 否 | 旧文章路径，用于旧 URL 301/别名映射 |

> 不需要为了列表去找封面图。没有 `cover` 是完全正常的默认状态。

## 3. 写正文

正文使用 Markdown。建议：

```markdown
开头一段，直接进入主题。

## 一级小节

段落……

### 二级小节

- 列表项
- 列表项

| 列一 | 列二 |
| --- | --- |
| 内容 | 内容 |

```python
print("代码块")
```

![图片描述](/images/news/2026-11-02-my-news/image-1.webp)

> 引用内容。
```

- 标题层级从 `##` 开始；文章标题由 frontmatter 的 `title` 渲染，不要在正文重复写一级标题。
- 表格用 GFM 表格；复杂合并单元格可用 HTML `<table>`。
- 代码块用围栏代码块并标注语言。
- 外链直接写 Markdown 链接；站内链接用 `/news/`、`/products/...` 等新路由。
- 不要把“发布时间：……”“出处为：……”写进正文；分别用 `date`、`source`。
- 免责声明由模板统一渲染，不用重复写。

## 4. 图片（PNG/JPG 可以直接用）

### 4.1 直接使用 PNG/JPG

1. 建目录，目录名与文章 slug 完全一致：

```text
public/images/news/2026-11-05-my-news/
```

2. 把 PNG/JPG 放进去，例如：

```text
public/images/news/2026-11-05-my-news/01.png
public/images/news/2026-11-05-my-news/02.jpg
```

3. 在 Markdown 中用 **绝对路径** 引用，扩展名与真实文件一致：

```markdown
![图片描述](/images/news/2026-11-05-my-news/01.png)
![图片描述](/images/news/2026-11-05-my-news/02.jpg)
```

4. 直接运行：

```bash
pnpm check:content
pnpm build
```

站点会把 PNG/JPG 原样复制到 `dist/images/news/...`，**不需要改代码，也不强制转 WebP**。
`pnpm check:content` 会检查这些路径是否存在。

### 4.2 建议转成 WebP（减小体积）

PNG/JPG 可以用，但截图/照片通常较大。项目已带 `sharp`，可以一键转换：

```bash
# 整个目录批量转（PNG/JPG -> 同名 .webp）
pnpm optimize:image public/images/news/2026-11-05-my-news

# 单张转
pnpm optimize:image public/images/news/2026-11-05-my-news/01.png
```

转换后把 Markdown 里的后缀改成 `.webp`：

```markdown
![图片描述](/images/news/2026-11-05-my-news/01.webp)
```

脚本会：

- 自动纠正 EXIF 方向；
- 最大宽度 1200px（不放大）；
- 输出 WebP，质量 82；
- 批量模式在同一个目录生成 `.webp`，不删除原图。

### 4.3 注意事项

| 事项 | 要求 |
|---|---|
| 路径 | 必须是 `/images/news/{slug}/...`，不要写 `./images/...` 或 `../images/...` |
| 目录名 | 与文章文件名去掉 `.md` 后完全一致 |
| 文件名 | 建议英文/数字/连字符，避免空格和中文 |
| 扩展名 | 与实际文件一致；转 WebP 后记得改 MD |
| alt | 每张图都写描述性 alt |
| 尺寸 | 宽度 ≤ 1200px，单张 ≤ 500KB 更佳 |
| 封面 | 不需要；列表/首页不展示封面，详情页 `cover` 可选 |

> 常见错误：把图片放在 `src/content/news/` 旁边，然后用 `./01.png` 引用。当前项目不会处理相对图片路径，页面会 404。请统一放 `public/images/news/{slug}/`。

## 5. 预览与校验

```bash
pnpm dev            # 本地预览，保存 MD 后自动刷新
pnpm check:content  # 校验字段、日期、slug、图片、legacyPath
pnpm build          # 构建；错误会指出文件名与字段
```

- 列表、详情、分页、搜索索引会自动包含新文章。
- 当前 121 篇、10 条/页、共 13 页；超过 10 条会自动生成 `/news/page/2/`。
- `draft: true` 的文章不会出现在任何公开页面。

## 6. 发布

```bash
pnpm build
```

把 `dist/` 部署到静态主机即可。新增文章不需要改代码。

## 7. 常见问题

| 问题 | 原因 | 处理 |
|---|---|---|
| 构建报 `summary` 过长 | 摘要超过 300 字 | 精简 `summary` |
| 构建报未知字段 | frontmatter 拼写错误 | 对照模板字段 |
| 页面 404 | 文件名/日期不符合约定 | 检查文件名与 `pnpm check:content` |
| 旧链接没跳转 | 没有填 `legacyPath` | 补 `legacyPath` 后重新构建 |
| 图片不显示 | 路径不是 `/images/...` | 检查 `public/images/news/{slug}/` 与引用路径 |
| 新文章写成了 `news-127.md` | 与已有 ID 127 的文章重名 | 改用日期 slug，如 `2026-11-05-my-news.md` |
| 图片是 PNG/JPG | 格式本身没问题 | 放 `public/images/news/{slug}/`，用绝对路径引用即可 |
| 图片太大 | PNG/JPG 未压缩 | `pnpm optimize:image public/images/news/{slug}` 后把 MD 后缀改为 `.webp` |
| 列表没有新文章 | `draft: true` 或日期写成未来 | 改 `draft: false`，确认日期 |
