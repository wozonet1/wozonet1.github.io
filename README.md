# wozonet

一个以写作为中心的公开个人网站。使用 Astro 构建为纯静态页面，不需要数据库或后台。

这个仓库只负责公开站点代码、公开素材与已经确认可以发布的内容。私人日记、时间记录和私人应用代码均不属于公开构建。

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
  accent: "oklch(0.79 0.10 285)"
  overlay: 0.84
---
```

正文直接使用 Markdown。需要复杂的交互组件时，将文件改为 `.mdx`。

- 图片放在 `astro-public/images/`，文章里以 `/images/...` 引用。
- 行内公式使用 `$...$`，独立公式使用 `$$...$$`。
- 二级、三级标题会自动进入文章右侧目录。
- `draft: true` 的文章不会出现在构建结果中。
- 不需要文章背景图时，删掉 `backgroundImage` 即可。

## 公开状态与随记

明确准备公开的内容才写入这个仓库：

```powershell
moment-public "这是一条已经确认可以公开的状态。"
note-new-public
note-sync-public
```

这些命令不会把私人目录接入公开构建。`moment-public` 与 `note-new-public` 只创建公开文件，`moment-sync-public` / `note-sync-public` 只创建本地提交；确认提交后再运行 `site-push-public` 推送。

私人原文、Daylog 和私人应用的使用说明保存在私有应用仓库中；公开仓库不提供私人站点运行入口，也不会读取私人数据目录。

## Obsidian 写作

若要公开图片，最好集中保存到 `astro-public/images/文章名/`，并在 Markdown 中使用根路径：

```md
![图片说明](/images/文章名/示例.jpg)
```

Obsidian 的 `[[双链]]` 和 `![[嵌入]]` 不是标准 Markdown，发布前需要改成普通链接或图片语法。

## 发布

只有 `src/content/` 与 `astro-public/` 中的内容可能进入公开构建。公开构建不依赖私有应用或私人数据。

推送到 `master` 后，`.github/workflows/deploy.yml` 会构建并发布 `dist/`。首次启用时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。

当前 `site` 配置是 `https://wozonet.top`，自定义域名由 GitHub Pages 与 Cloudflare 共同解析。
