# VitePress Interview Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent, mobile-friendly VitePress interview knowledge base in `/Users/sean/study/book-lib-vitepress`, populated from the Markdown files in `/Users/sean/study/book-lib/md` and deployable to GitHub Pages.

**Architecture:** Treat `/Users/sean/study/book-lib` as a read-only content source and create a separate static-site repository. Organize copied documents into four content areas, keep navigation explicit in VitePress configuration, enhance the default theme with focused responsive CSS, and deploy the generated static files through GitHub Actions.

**Tech Stack:** Node.js 20+, npm, VitePress, TypeScript configuration, CSS, GitHub Actions, GitHub Pages

---

## File map

- `package.json`: project metadata and `dev`, `build`, `preview` scripts.
- `.gitignore`: dependency, cache, and build-output exclusions.
- `README.md`: local usage, content maintenance, and GitHub Pages deployment.
- `.github/workflows/deploy.yml`: repeatable GitHub Pages build and deployment.
- `docs/.vitepress/config.mts`: site metadata, navigation, sidebars, search, localization, and base path.
- `docs/.vitepress/theme/index.ts`: default-theme extension entry.
- `docs/.vitepress/theme/custom.css`: typography, mobile layout, overflow, and dark-mode refinements.
- `docs/index.md`: VitePress home page.
- `docs/{fundamentals,architecture,ai,guides}/index.md`: category landing pages.
- `docs/examples/面试笔记示例.md`: example Markdown authoring pattern.
- `docs/fundamentals/*.md`: copied foundation modules.
- `docs/architecture/*.md`: copied architecture modules.
- `docs/ai/*.md`: copied AI modules.
- `docs/guides/*.md`: copied indexes, mind map, and flash cards.

### Task 1: Initialize the independent repository

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/package.json`
- Create: `/Users/sean/study/book-lib-vitepress/.gitignore`

- [ ] **Step 1: Verify source and target isolation**

Run:

```bash
test -d /Users/sean/study/book-lib/md
test /Users/sean/study/book-lib != /Users/sean/study/book-lib-vitepress
find /Users/sean/study/book-lib-vitepress -mindepth 1 -maxdepth 1 -print
```

Expected: both `test` commands exit with status 0; only the already-created `docs` planning directory may be present.

- [ ] **Step 2: Create package metadata**

Create `package.json`:

```json
{
  "name": "book-lib-vitepress",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 3: Add generated-file exclusions**

Create `.gitignore`:

```gitignore
node_modules/
docs/.vitepress/cache/
docs/.vitepress/dist/
.DS_Store
*.log
```

- [ ] **Step 4: Initialize Git and install locked dependencies**

Run:

```bash
cd /Users/sean/study/book-lib-vitepress
git init
npm install
```

Expected: `.git/`, `node_modules/`, and `package-lock.json` exist; npm exits successfully.

- [ ] **Step 5: Verify required npm scripts**

Run:

```bash
npm pkg get scripts.dev scripts.build scripts.preview
```

Expected: the output contains all three VitePress commands targeting `docs`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize VitePress project"
```

### Task 2: Copy and classify the source Markdown

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/docs/fundamentals/*.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/architecture/*.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/ai/*.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/guides/*.md`

- [ ] **Step 1: Record source integrity before copying**

Run:

```bash
cd /Users/sean/study/book-lib
git status --short
find md -maxdepth 1 -name '*.md' | wc -l
```

Expected: the source contains 31 Markdown files. Record the status output and do not modify or delete any source file.

- [ ] **Step 2: Create category directories**

Run:

```bash
mkdir -p /Users/sean/study/book-lib-vitepress/docs/fundamentals
mkdir -p /Users/sean/study/book-lib-vitepress/docs/architecture
mkdir -p /Users/sean/study/book-lib-vitepress/docs/ai
mkdir -p /Users/sean/study/book-lib-vitepress/docs/guides
```

- [ ] **Step 3: Copy documents by category**

Copy `基础模块*.md` to `docs/fundamentals/`, `架构模块*.md` to `docs/architecture/`,
`AI模块*.md` to `docs/ai/`, and the remaining four index/topic documents to `docs/guides/`.
Do not move files and do not copy `docs/superpowers/` from the source repository.

- [ ] **Step 4: Verify copied counts and source preservation**

Run:

```bash
find docs/fundamentals -maxdepth 1 -name '*.md' | wc -l
find docs/architecture -maxdepth 1 -name '*.md' | wc -l
find docs/ai -maxdepth 1 -name '*.md' | wc -l
find docs/guides -maxdepth 1 -name '*.md' | wc -l
git -C /Users/sean/study/book-lib status --short
```

Expected: counts are 8, 12, 6, and 5 respectively; source status is unchanged from Step 1.

- [ ] **Step 5: Commit**

```bash
git add docs/fundamentals docs/architecture docs/ai docs/guides
git commit -m "docs: import and classify interview materials"
```

### Task 3: Add VitePress configuration and navigation

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/docs/.vitepress/config.mts`

- [ ] **Step 1: Create a configuration smoke check**

Create a temporary shell assertion that will be run after the config exists:

```bash
test -f docs/.vitepress/config.mts
rg "provider: 'local'|fundamentals|architecture|AI 架构|BASE_PATH" docs/.vitepress/config.mts
```

Expected before implementation: FAIL because the config file does not exist.

- [ ] **Step 2: Implement the configuration**

Create `docs/.vitepress/config.mts` using `defineConfig`. Set:

- `lang: 'zh-CN'`, title `面试知识库`, descriptive metadata, `cleanUrls: true`, and `lastUpdated: true`.
- `base: process.env.BASE_PATH || '/'`.
- Local search with Chinese button, placeholder, no-results, reset, footer, and detailed-view labels.
- Navbar links to `/`, `/fundamentals/`, `/architecture/`, `/ai/`, and `/guides/`.
- Explicit sidebars containing all 8 foundation, 12 architecture, 6 AI, 5 guide, and 1 example documents.
- Chinese outline, last-updated, previous-page, next-page, dark-mode, and return-to-top labels.
- `ignoreDeadLinks` must not be enabled.

Use URL-encoded-independent Unicode paths in configuration, omit `.md` suffixes, and keep module order numeric rather than lexicographic.

- [ ] **Step 3: Run the smoke check**

Run:

```bash
test -f docs/.vitepress/config.mts
rg "provider: 'local'|fundamentals|architecture|AI 架构|BASE_PATH" docs/.vitepress/config.mts
```

Expected: PASS and matching lines for all required features.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/config.mts
git commit -m "feat: configure navigation and local search"
```

### Task 4: Add landing pages and example content

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/docs/index.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/fundamentals/index.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/architecture/index.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/ai/index.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/guides/index.md`
- Create: `/Users/sean/study/book-lib-vitepress/docs/examples/面试笔记示例.md`

- [ ] **Step 1: Add the home page**

Use VitePress home-layout frontmatter with the title `面试知识库`, a concise description, primary action to
`/guides/基础8+架构12+AI6-总索引`, secondary action to `/guides/高频100题-抽认卡版`, and feature
entries for foundation, architecture, AI, and review topics.

- [ ] **Step 2: Add category landing pages**

Each category `index.md` must contain one H1, a short purpose statement, an ordered list linking every document
in that category, and a suggested study order. Guide links use the exact copied filenames.

- [ ] **Step 3: Add the example Markdown**

Create `docs/examples/面试笔记示例.md` with:

```markdown
# 面试笔记示例

## 问题

如何设计一个支持突发流量的接口？

## 核心结论

先保护系统边界，再扩容瓶颈资源，并用可观测数据验证效果。

## 回答结构

1. 明确峰值 QPS、延迟目标和可用性目标。
2. 在入口进行限流、排队和快速失败。
3. 对无状态服务水平扩容，对热点数据使用缓存。
4. 使用压测、指标和链路追踪验证容量。

## 示例代码

```java
if (!rateLimiter.tryAcquire()) {
    throw new ServiceBusyException("系统繁忙，请稍后重试");
}
```

> 提示：自己的笔记也可以沿用“问题 → 结论 → 结构 → 示例”的格式。
```

- [ ] **Step 4: Verify page inventory**

Run:

```bash
test -f docs/index.md
test -f docs/fundamentals/index.md
test -f docs/architecture/index.md
test -f docs/ai/index.md
test -f docs/guides/index.md
test -f docs/examples/面试笔记示例.md
```

Expected: all assertions pass.

- [ ] **Step 5: Commit**

```bash
git add docs/index.md docs/fundamentals/index.md docs/architecture/index.md docs/ai/index.md docs/guides/index.md docs/examples
git commit -m "docs: add knowledge base landing pages"
```

### Task 5: Fix imported links

**Files:**
- Modify: `/Users/sean/study/book-lib-vitepress/docs/guides/*.md`

- [ ] **Step 1: Demonstrate old absolute links**

Run:

```bash
rg -n '/Users/sean/study/books/md|/Users/sean/study/book-lib/md' docs
```

Expected: FAIL acceptance condition because imported index documents contain local absolute paths.

- [ ] **Step 2: Replace links with site routes**

Map foundation links to `/fundamentals/<exact-file-stem>`, architecture links to
`/architecture/<exact-file-stem>`, AI links to `/ai/<exact-file-stem>`, and guide-to-guide links to
`/guides/<exact-file-stem>`. Preserve labels and surrounding prose.

- [ ] **Step 3: Verify no machine-local links remain**

Run:

```bash
if rg -n '/Users/|file://' docs --glob '*.md'; then exit 1; fi
```

Expected: exit status 0 with no output.

- [ ] **Step 4: Commit**

```bash
git add docs/guides
git commit -m "fix: convert imported links to site routes"
```

### Task 6: Implement responsive theme styling

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/docs/.vitepress/theme/index.ts`
- Create: `/Users/sean/study/book-lib-vitepress/docs/.vitepress/theme/custom.css`

- [ ] **Step 1: Add the theme entry**

Extend `vitepress/theme`, import `custom.css`, and export the default theme unchanged apart from the CSS.

- [ ] **Step 2: Add readable typography and overflow rules**

Set body and `.vp-doc` typography to at least `16px` and line-height `1.8`. Add comfortable paragraph/list
spacing. Ensure `.vp-doc div[class*='language-']`, `.vp-doc pre`, `.vp-doc table`, and Mermaid containers use
horizontal scrolling and momentum scrolling. Permit long inline code and headings to wrap.

- [ ] **Step 3: Add mobile and dark-mode rules**

At widths below `768px`, use approximately `17px` body text, reduce document side padding, scale H1/H2 with
`clamp()`, and keep interactive navigation targets at least `44px` high. Under `.dark`, increase body-text,
blockquote, and code-background contrast without replacing VitePress theme switching.

- [ ] **Step 4: Check required CSS characteristics**

Run:

```bash
rg -n '17px|line-height: 1\\.8|overflow-x: auto|\\.dark|44px' docs/.vitepress/theme/custom.css
```

Expected: at least one match for every required mobile-readability characteristic.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme
git commit -m "style: optimize mobile reading experience"
```

### Task 7: Add GitHub Pages delivery and documentation

**Files:**
- Create: `/Users/sean/study/book-lib-vitepress/.github/workflows/deploy.yml`
- Create: `/Users/sean/study/book-lib-vitepress/README.md`

- [ ] **Step 1: Add the deployment workflow**

Create a Pages workflow triggered by pushes to `master` and `workflow_dispatch`. Grant `contents: read`,
`pages: write`, and `id-token: write`; use a non-cancelling `pages` concurrency group. Build with Node 24,
`npm ci`, and `BASE_PATH=/book-lib/ npm run build`; upload `docs/.vitepress/dist`; deploy with the official
GitHub Pages actions.

- [ ] **Step 2: Document local usage and deployment**

README must include:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Also document repository structure, source-copy policy, GitHub repository creation, adding a GitHub remote,
pushing `master`, selecting `Settings → Pages → GitHub Actions`, the expected
`https://<username>.github.io/book-lib/` URL, and how to change `BASE_PATH` when the repository name differs.
Explain that the existing Codeup source repository remains untouched.

- [ ] **Step 3: Validate workflow syntax-sensitive fields**

Run:

```bash
rg -n 'branches: \\[master\\]|pages: write|id-token: write|BASE_PATH=/book-lib/|docs/.vitepress/dist' .github/workflows/deploy.yml
```

Expected: all five deployment requirements match.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy documentation to GitHub Pages"
```

### Task 8: Build and browser verification

**Files:**
- Modify only if verification finds a defect in files created above.

- [ ] **Step 1: Run structural checks**

Run:

```bash
find docs -name '*.md' | wc -l
if rg -n '/Users/|file://' docs --glob '*.md'; then exit 1; fi
git status --short
```

Expected: 38 Markdown files including 31 imported documents, 6 landing/example pages, and this plan; no local
absolute content links; no unintended source-tree modifications.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: exit status 0, no dead-link error, and output in `docs/.vitepress/dist`.

- [ ] **Step 3: Build with the production base**

Run:

```bash
BASE_PATH=/book-lib/ npm run build
```

Expected: exit status 0 and generated assets reference the `/book-lib/` base.

- [ ] **Step 4: Preview and inspect desktop behavior**

Run `npm run preview -- --host 127.0.0.1`, then verify homepage, each navbar entry, representative sidebar
links, local search, previous/next navigation, and dark-mode switching.

- [ ] **Step 5: Inspect mobile behavior**

At a 390×844 viewport, verify homepage and a long module page. Confirm readable text, natural heading wrapping,
working mobile navigation, horizontally scrollable code/table content, and no body-level horizontal overflow.

- [ ] **Step 6: Recheck source repository**

Run:

```bash
git -C /Users/sean/study/book-lib status --short
```

Expected: no changes caused by implementation.

- [ ] **Step 7: Commit verification fixes, if any**

```bash
git add docs package.json package-lock.json README.md .github .gitignore
git commit -m "fix: resolve VitePress verification findings"
```

Skip this commit only when there are no verification fixes.
