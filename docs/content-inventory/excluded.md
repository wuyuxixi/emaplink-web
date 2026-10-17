# 不重建页面与旧 URL 处理

本轮范围：主导航页面 + 新闻。以下页面线上仍可访问，但不在主导航或被隐藏/孤立，故不重建；旧 URL 给出跳转目标，避免 404。

| 页面 | 旧 URL | 线上情况 | 处理 | 跳转目标 |
|---|---|---|---|---|
| ZSAC视频安全网关 | `/products-video.html` | 旧产品页，不在当前主导航 | 不重建，保留旧 URL 别名 | `/#products` |
| ZTRUST安全中心 | `/products-safe.html` | 旧产品页，不在当前主导航 | 不重建 | `/#products` |
| 食安盾 | `/programme-food.html` | 主导航已注释，侧栏仍可能出现 | 不重建 | `/#solutions` |
| 药安盾 | `/programme-drug.html` | 主导航已注释 | 不重建 | `/#solutions` |
| 合作伙伴 | `/hezuo1.html` | 主导航隐藏，关于页侧栏可到 | 不重建 | `/about/` |
| 媒体报道 | `/news-report.html` | 不在主导航；列表 7 条 | 不重建；摘要用于行业案例 | `/news/` |
| 媒体报道详情 1–7 | `/report-details1-7.html` | **全部 404** | 不重建 | `/about/cases/` |
| `useless/*` | 本地文件 | 未部署 | 不迁移 | — |
| `header.html`、`footer.html` | 线上公共片段 | jQuery 注入 | 由 Astro 组件取代 | — |

## 说明

- 上述页面仍保留在 `docs/content-inventory/archive/` 之外的线上站点；本轮不复制其正文。
- 7 个媒体报道详情已 404，无法恢复；其列表摘要已用于 `/about/cases/` 的 3 个公开报道案例。
- `hezuo1.html` 的 11 张合作伙伴 Logo 不迁移；如后续需要，可在 `/about/` 新增合作伙伴区块。
- `products-video/safe` 属于 ZTRUST 旧品牌，与当前 ZSAC 品牌不一致，不迁移。
- 旧 URL 别名由 `scripts/generate-aliases.mjs` 生成；同时输出 `_redirects` 与 `web.config`。
