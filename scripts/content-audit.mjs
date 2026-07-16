import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const docsRoot = join(root, 'docs')
const distRoot = join(docsRoot, '.vitepress', 'dist')
const errors = []
const warnings = []
const stats = { markdown: 0, banks: 0, questions: 0, answerDepthReady: 0, jvmDepthReady: 0, deepArticles: 0, cases: 0, html: 0, links: 0 }
const highScoreAnswers = new Map()

function walk(dir, accept = () => true) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return walk(path, accept)
    return accept(path) ? [path] : []
  })
}

function posix(path) { return path.split(sep).join('/') }
function lineOf(text, index) { return text.slice(0, index).split('\n').length }
function report(list, file, line, message) { list.push(`${posix(relative(root, file))}:${line} ${message}`) }

const markdownFiles = walk(docsRoot, (file) => extname(file) === '.md')
  .filter((file) => !file.includes(`${sep}superpowers${sep}`) && !file.includes(`${sep}.vitepress${sep}`))
stats.markdown = markdownFiles.length

// Standard banks: exact numbering and no duplicate normalized question in the same file.
for (const file of markdownFiles.filter((file) => file.includes('标准答案库'))) {
  stats.banks += 1
  const text = readFileSync(file, 'utf8')
  const questions = [...text.matchAll(/^##\s+(\d+)\.\s+(.+?)\s*$/gm)]
  stats.questions += questions.length
  if (questions.length !== 20) report(errors, file, 1, `标准题库应有 20 题，实际 ${questions.length} 题`)
  const numbers = new Set()
  const titles = new Set()
  for (const match of questions) {
    const number = Number(match[1])
    const title = match[2].replace(/[？?\s`*_]/g, '').toLowerCase()
    if (numbers.has(number)) report(errors, file, lineOf(text, match.index), `重复题号 ${number}`)
    if (titles.has(title)) report(errors, file, lineOf(text, match.index), `重复题目“${match[2]}”`)
    numbers.add(number)
    titles.add(title)
  }
  for (let number = 1; number <= 20; number += 1) {
    if (!numbers.has(number)) report(errors, file, 1, `缺少题号 ${number}`)
  }

  if (!file.endsWith('基础模块2-JVM基础-标准答案库.md')) {
    const isProductionScenarioBank = file.includes(`${sep}architecture${sep}`) || file.includes(`${sep}ai${sep}`)
    const commonDepthRules = [
      [/\*\*核心结论\*\*/, '缺少核心结论'],
      [/\*\*标准答案\*\*/, '缺少标准答案'],
      [/\*\*高分回答\*\*/, '缺少高分回答'],
      [/\*\*追问点答案\*\*/, '缺少追问点答案'],
      [/\*\*易错点\*\*/, '缺少易错点']
    ]
    const productionDepthRules = [
      [/\*\*原理补充\*\*/, '缺少原理补充'],
      [/\*\*架构扩展\*\*/, '缺少架构扩展'],
      [/\*\*工程指标\*\*/, '缺少工程指标'],
      [/\*\*证据链\*\*/, '缺少证据链'],
      [/\*\*低风险优化路径\*\*/, '缺少低风险优化路径']
    ]

    questions.forEach((question, index) => {
      const start = question.index
      const end = questions[index + 1]?.index ?? text.length
      const section = text.slice(start, end)
      let ready = true
      const rules = isProductionScenarioBank ? [...commonDepthRules, ...productionDepthRules] : commonDepthRules
      for (const [pattern, message] of rules) {
        if (!pattern.test(section)) {
          ready = false
          report(errors, file, lineOf(text, start), `第 ${question[1]} 题${message}`)
        }
      }

      const highScore = section.match(/\*\*高分回答\*\*\s*([\s\S]*?)(?=\n\*\*追问点答案\*\*)/)?.[1]
      if (highScore) {
        const normalized = highScore.replace(/\s+/g, '').replace(/[，。；：、“”‘’（）()\-*_]/g, '')
        if (normalized.length < 100) {
          ready = false
          report(errors, file, lineOf(text, start), `第 ${question[1]} 题高分回答过短（${normalized.length} 字符）`)
        }
        const previous = highScoreAnswers.get(normalized)
        if (previous) {
          ready = false
          report(errors, file, lineOf(text, start), `第 ${question[1]} 题高分回答与 ${previous} 重复`)
        } else {
          highScoreAnswers.set(normalized, `${posix(relative(root, file))} 第 ${question[1]} 题`)
        }
      }

      const followupBlock = section.match(/\*\*追问点答案\*\*([\s\S]*?)(?=\n\*\*(?:原理补充|易错点)\*\*)/)?.[1] ?? ''
      const followups = followupBlock.match(/^- .*?[？?]/gm)?.length ?? 0
      if (followups < 3) {
        ready = false
        report(errors, file, lineOf(text, start), `第 ${question[1]} 题递进追问不足 3 个（实际 ${followups} 个）`)
      }

      if (isProductionScenarioBank) {
        const metricsBlock = section.match(/\*\*工程指标\*\*\s*([\s\S]*?)(?=\n\*\*证据链\*\*)/)?.[1] ?? ''
        const metrics = metricsBlock.match(/^- /gm)?.length ?? 0
        if (metrics < 5) {
          ready = false
          report(errors, file, lineOf(text, start), `第 ${question[1]} 题工程指标不足 5 个（实际 ${metrics} 个）`)
        }
      }
      if (ready) stats.answerDepthReady += 1
    })
  }

  if (file.endsWith('基础模块2-JVM基础-标准答案库.md')) {
    const depthRules = [
      [/\*\*回答层级对照\*\*/, '缺少回答层级对照'],
      [/\*\*三级追问链\*\*/, '缺少三级追问链'],
      [/\*\*评分锚点（25 分）\*\*/, '缺少 25 分评分锚点'],
      [/\*\*复述任务\*\*/, '缺少复述任务']
    ]
    questions.forEach((question, index) => {
      const start = question.index
      const end = questions[index + 1]?.index ?? text.length
      const section = text.slice(start, end)
      let ready = true
      for (const [pattern, message] of depthRules) {
        if (!pattern.test(section)) {
          ready = false
          report(errors, file, lineOf(text, start), `第 ${question[1]} 题${message}`)
        }
      }
      if (ready) stats.jvmDepthReady += 1
    })
  }
}

// Deep articles share a minimum interview-ready structure.
const deepRoot = join(docsRoot, 'deep-dives')
const deepArticles = markdownFiles.filter((file) => {
  const rel = posix(relative(deepRoot, file))
  return rel.split('/').length === 2 && !rel.startsWith('cases/') && !rel.endsWith('/index.md') && !rel.startsWith('cases-') && !rel.includes('case-full-gc')
})
stats.deepArticles = deepArticles.length
for (const file of deepArticles) {
  const text = readFileSync(file, 'utf8')
  const rules = [
    [/^##\s+(?:60[–-]90|90)\s+秒速答/gm, '缺少 60–90 秒速答'],
    [/^##\s+(?:面试官)?(?:三级)?追问/gm, '缺少面试官追问'],
    [/^##\s+(?:25 分自测|25 分自评|自测与评分)/gm, '缺少 25 分自测'],
    [/^##\s+复述任务/gm, '缺少复述任务']
  ]
  for (const [pattern, message] of rules) if (!pattern.test(text)) report(errors, file, 1, message)
}

// Complete cases require a concise answer, follow-ups, scoring, and rehearsal.
const caseFiles = markdownFiles.filter((file) => file.includes(`${sep}deep-dives${sep}cases${sep}`) && !file.endsWith(`${sep}index.md`))
stats.cases = caseFiles.length
for (const file of caseFiles) {
  const text = readFileSync(file, 'utf8')
  const rules = [
    [/^##\s+面试版/m, '缺少面试版回答'],
    [/^##\s+(?:面试官)?追问与评分/m, '缺少追问与评分'],
    [/\|\s*维度\s*\|\s*5 分要求\s*\|/m, '缺少 25 分评分表'],
    [/^##\s+复述任务/m, '缺少复述任务']
  ]
  for (const [pattern, message] of rules) if (!pattern.test(text)) report(errors, file, 1, message)
}

// Built HTML is the source of truth for clean URLs and generated heading anchors.
if (!existsSync(distRoot)) {
  errors.push('docs/.vitepress/dist 不存在；请先执行 npm run build')
} else {
  const htmlFiles = walk(distRoot, (file) => extname(file) === '.html')
  stats.html = htmlFiles.length
  const htmlByPath = new Map(htmlFiles.map((file) => [posix(relative(distRoot, file)), readFileSync(file, 'utf8')]))
  const distPaths = new Set(walk(distRoot).map((file) => posix(relative(distRoot, file))))
  const inbound = new Map(htmlFiles.map((file) => [posix(relative(distRoot, file)), new Set()]))

  function htmlTarget(pathname) {
    const clean = decodeURIComponent(pathname).replace(/^\/+/, '')
    const candidates = clean === '' ? ['index.html'] : clean.endsWith('/')
      ? [`${clean}index.html`]
      : clean.endsWith('.html') ? [clean] : [clean, `${clean}.html`, `${clean}/index.html`]
    return candidates.find((candidate) => distPaths.has(candidate))
  }

  for (const file of htmlFiles) {
    const sourcePath = posix(relative(distRoot, file))
    const html = htmlByPath.get(sourcePath)
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1].replace(/&amp;/g, '&')
      if (/^(?:https?:|mailto:|tel:|javascript:)/.test(href)) continue
      stats.links += 1
      let url
      try { url = new URL(href, `https://audit.local/${sourcePath.replace(/index\.html$/, '')}`) }
      catch { report(errors, file, lineOf(html, match.index), `无法解析链接 ${href}`); continue }
      if (url.origin !== 'https://audit.local') continue
      const target = htmlTarget(url.pathname)
      if (!target) {
        report(errors, file, lineOf(html, match.index), `失效站内链接 ${href}`)
        continue
      }
      if (htmlByPath.has(target) && target !== sourcePath) inbound.get(target)?.add(sourcePath)
      if (url.hash && htmlByPath.has(target)) {
        const id = decodeURIComponent(url.hash.slice(1))
        const targetHtml = htmlByPath.get(target)
        const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (!new RegExp(`id=["']${escaped}["']`).test(targetHtml)) {
          report(errors, file, lineOf(html, match.index), `失效锚点 ${href}`)
        }
      }
    }
  }

  for (const [target, sources] of inbound) {
    if (!target.startsWith('deep-dives/') || target.endsWith('/index.html') || target === 'deep-dives/index.html') continue
    if (sources.size === 0) warnings.push(`${target} 没有来自其他页面的链接`)
  }

  const initialAppAssets = walk(join(distRoot, 'assets'), (file) => {
    const name = posix(relative(join(distRoot, 'assets'), file))
    return !name.includes('/') && /^app\..+\.js$/.test(name)
  })
  for (const file of initialAppAssets) {
    const size = statSync(file).size
    if (size > 500 * 1024) report(errors, file, 1, `首屏应用包 ${(size / 1024).toFixed(1)}KB，超过 500KB 预算`)
  }
}

console.log(`内容体检：${stats.markdown} 篇 Markdown，${stats.banks} 个标准题库 / ${stats.questions} 题（深度结构 ${stats.answerDepthReady + stats.jvmDepthReady}/520，其中 JVM ${stats.jvmDepthReady}/20），${stats.deepArticles} 篇深度文章，${stats.cases} 个案例`)
console.log(`站点体检：${stats.html} 个 HTML，检查 ${stats.links} 个站内链接`)
if (warnings.length) {
  console.log(`\n警告 (${warnings.length})`)
  warnings.forEach((message) => console.log(`- ${message}`))
}
if (errors.length) {
  console.error(`\n错误 (${errors.length})`)
  errors.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}
console.log('\n质量门禁通过：结构、题号、链接、锚点与资源预算均符合要求。')
