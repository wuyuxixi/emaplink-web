# 部署说明

## 1. 构建

```bash
pnpm install
pnpm build
```

- 输出目录：`dist/`
- 正式页：19 个（14 个栏目页 + 5 篇资讯）+ 404。
- 旧 URL 别名：148 个（写入 `dist/`）。
- 同时生成：`sitemap-index.xml`、`robots.txt`、`_redirects`、`web.config`、`search-index.json`。
- 无服务端运行时，纯静态文件。

## 2. 主机要求

- 任意静态文件主机：Nginx、IIS、Apache、Netlify、Cloudflare Pages、Vercel、对象存储 + CDN。
- 需要支持：
  - 目录默认文档 `index.html`；
  - 404 指向 `/404.html`；
  - HTTPS（推荐）；
  - gzip/brotli。

## 3. Nginx 示例

```nginx
server {
    listen 443 ssl http2;
    server_name www.emaplink.com.cn;
    root /var/www/emaplink-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    error_page 404 /404.html;

    location = /404.html {
        internal;
    }

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(webp|png|jpe?g|svg|ico|woff2?)$ {
        add_header Cache-Control "public, max-age=2592000";
    }

    location ~* \.html$ {
        add_header Cache-Control "no-cache";
    }
}
```

## 4. IIS

`dist/web.config` 已包含 148 条旧 URL 301 规则：

- 需要安装 **URL Rewrite** 模块。
- 站点根目录指向 `dist/`。
- 默认文档添加 `index.html`。
- 404 错误页指向 `/404.html`。
- 静态资源缓存可在 IIS 的 `web.config` 中追加 `staticContent` 配置。

## 5. Netlify / Cloudflare Pages

- Build command：`pnpm build`
- Publish directory：`dist`
- `dist/_redirects` 已生成 148 条 301；平台会自动读取。
- 注意：`_redirects` 只对 Netlify/Cloudflare Pages 生效；其他平台使用 `web.config` 或服务器配置。

## 6. Vercel

Vercel 读取项目根目录的 `vercel.json`。可将 `dist/_redirects` 的规则转换为：

```json
{
  "redirects": [
    { "source": "/products-insert.html", "destination": "/products/zsac-gateway/", "permanent": true }
  ]
}
```

完整 148 条可由 `scripts/generate-aliases.mjs` 输出的 `dist/_redirects` 转换。若不做 301，静态别名页 `dist/*.html` 也会通过 meta refresh 跳转。

## 7. 缓存建议

| 路径 | 缓存 |
|---|---|
| `/_astro/*` | 1 年，immutable（文件名带 hash） |
| `/images/*` | 30 天 |
| `*.html` | no-cache |
| `/search-index.json` | 1 小时 |

## 8. 上线后检查

1. `https://www.emaplink.com.cn/` 首页正常。
2. `/products/zsac-gateway/`、`/solutions/multi-terminal-access/`、`/news/`、任意资讯详情正常。
3. 旧 URL 例如 `/products-insert.html`、`/news-details/news-details134.html` 跳转到新页。
4. `/sitemap-index.xml`、`/robots.txt` 可访问。
5. 随机不存在的 URL 返回 404 页。
6. 移动端菜单、搜索、荣誉灯箱可用。
7. HTTP 跳 HTTPS；HSTS 按需开启。

## 9. 域名与 canonical

- `astro.config.mjs` 的 `site` 与 `src/data/site.ts` 的 `url` 均为 `https://www.emaplink.com.cn`。
- 如换域名，同时修改：
  - `astro.config.mjs` → `site`
  - `src/data/site.ts` → `url`
  - `scripts/generate-aliases.mjs` → `SITE`
  - `public/robots.txt` → Sitemap 地址
- 重新 `pnpm build`。

## 10. 不做的事

- 不在构建时访问外网；所有内容与图片已本地化。
- 不需要数据库、Node 服务、环境变量。
- 不包含统计脚本；如需接入百度统计/GA，在 `BaseLayout.astro` 中加脚本并更新隐私说明。
