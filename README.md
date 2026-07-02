# 面试知识库

独立的 VitePress 面试文档站，内容按基础知识、架构设计、AI 架构和高频专题组织。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`。

生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 项目结构

```text
.
├── .github/workflows/deploy.yml
├── package.json
├── README.md
└── docs/
    ├── .vitepress/
    │   ├── config.mts
    │   └── theme/
    ├── fundamentals/
    ├── architecture/
    ├── ai/
    ├── guides/
    ├── examples/
    └── index.md
```

原始资料来自 `/Users/sean/study/book-lib/md`。该目录只作为内容来源；本项目是独立目录和
独立 Git 仓库，不会移动或删除原文。

## 发布到 GitHub Pages

1. 在 GitHub 创建名为 `book-lib` 的空仓库。
2. 为本项目添加 GitHub 远端并推送：

   ```bash
   git remote add origin https://github.com/<username>/book-lib.git
   git push -u origin master
   ```

3. 打开 GitHub 仓库的 `Settings → Pages`。
4. 在 `Build and deployment → Source` 中选择 `GitHub Actions`。
5. 等待 `Deploy VitePress site to Pages` 工作流完成。

默认地址是 `https://<username>.github.io/book-lib/`。每次推送到 `master` 都会自动部署。

如果 GitHub 仓库名不是 `book-lib`，请修改
`.github/workflows/deploy.yml` 中的 `BASE_PATH`。例如仓库名为 `interview-notes` 时改为
`/interview-notes/`；用户主页仓库 `<username>.github.io` 或自定义域名则使用 `/`。

## 添加新文档

1. 将 Markdown 放进对应分类目录。
2. 在 `docs/.vitepress/config.mts` 的对应侧边栏数组中添加入口。
3. 在分类 `index.md` 中补充链接。
4. 运行 `npm run build` 检查站内链接后再提交。
