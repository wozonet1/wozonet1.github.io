# wozonet

一个以写作为中心的个人网站。使用 Astro 构建为纯静态页面，不需要数据库或后台。

## 本地运行

需要 Node.js 22.12 或更高版本；自动发布使用 Node.js 24。

```powershell
npm install
npm run dev
```

构建与检查：

```powershell
npm run check
npm run build
```

## 写一篇文章

在 `src/content/posts/` 中新建 `.md` 或 `.mdx` 文件。文件名会成为文章网址，建议使用简短的英文或拼音，例如 `visual-rhythm.md`。

```yaml
---
title: "文章标题"
description: "显示在列表和搜索引擎中的简短摘要。"
pubDate: 2026-07-25
tags: ["随笔", "审美"]
draft: false
featured: false
math: false
toc: true
appearance:
  backgroundImage: "/images/example/background.jpg"
  backgroundPosition: "center 35%"
  accent: "#b8a7ff"
  overlay: 0.84
---
```

正文直接使用 Markdown。需要复杂的交互组件时，将文件改为 `.mdx`。

- 图片放在 `astro-public/images/`，文章里以 `/images/...` 引用。
- 行内公式使用 `$...$`，独立公式使用 `$$...$$`。
- 二级、三级标题会自动进入文章右侧目录。
- `draft: true` 的文章不会出现在构建结果中。
- 不需要文章背景图时，删掉 `backgroundImage` 即可。

## 写一张日常卡片

在 `src/content/notes/` 中新建 Markdown 文件，建议直接以日期命名，例如 `2026-07-27.md`：

```yaml
---
date: 2026-07-27
title: 今天的标题
weather: 午后 · 晴
tags:
  - 日常
draft: false
---

这里写当天想留下的短句或片段。
```

首页会自动显示日期最新的一张卡片；“日常”页面会按日期倒序展示全部卡片。

## Obsidian 写作

可以把 `src/content/posts/` 作为 Obsidian 仓库的一部分，或在其他仓库写完后复制进来。图片最好集中保存到 `astro-public/images/文章名/`，并在 Markdown 中使用根路径：

```md
![图片说明](/images/文章名/示例.jpg)
```

Obsidian 的 `[[双链]]` 和 `![[嵌入]]` 不是标准 Markdown，发布前需要改成普通链接或图片语法。

## 发布

推送到 `master` 后，`.github/workflows/deploy.yml` 会构建并发布 `dist/`。首次启用时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。

当前 `site` 配置是 `https://wozonet.top`，自定义域名由 GitHub Pages 与 Cloudflare 共同解析。
