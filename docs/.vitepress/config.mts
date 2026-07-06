import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const fundamentals = [
  ['Java 基础与集合', '基础模块1-Java基础与集合-标准答案库'],
  ['JVM 基础', '基础模块2-JVM基础-标准答案库'],
  ['并发基础', '基础模块3-并发基础-标准答案库'],
  ['计算机基础', '基础模块4-计算机基础-标准答案库'],
  ['数据库基础', '基础模块5-数据库基础-标准答案库'],
  ['缓存与消息基础', '基础模块6-缓存与消息基础-标准答案库'],
  ['Spring 基础', '基础模块7-Spring基础-标准答案库'],
  ['算法与数据结构', '基础模块8-算法与数据结构基础-标准答案库']
].map(([text, file]) => ({ text, link: `/fundamentals/${file}` }))

const architecture = [
  ['系统设计与容量规划', '架构模块1-系统设计与容量规划-标准答案库'],
  ['分布式架构基础', '架构模块2-分布式架构基础-标准答案库'],
  ['微服务治理', '架构模块3-微服务治理-标准答案库'],
  ['数据架构', '架构模块4-数据架构-标准答案库'],
  ['消息与异步架构', '架构模块5-消息与异步架构-标准答案库'],
  ['稳定性与高可用', '架构模块6-稳定性与高可用-标准答案库'],
  ['可观测性与运维', '架构模块7-可观测性与运维体系-标准答案库'],
  ['性能工程', '架构模块8-性能工程-标准答案库'],
  ['安全与合规', '架构模块9-安全与合规-标准答案库'],
  ['云原生与平台化', '架构模块10-云原生与平台化-标准答案库'],
  ['业务建模与领域拆分', '架构模块11-业务建模与领域拆分-标准答案库'],
  ['架构治理与技术管理', '架构模块12-架构治理与技术管理-标准答案库']
].map(([text, file]) => ({ text, link: `/architecture/${file}` }))

const ai = [
  ['LLM 基础与模型选型', 'AI模块1-LLM基础与模型选型-标准答案库'],
  ['RAG 与检索工程', 'AI模块2-RAG架构设计与检索工程-标准答案库'],
  ['Agent 与工具调用', 'AI模块3-Agent系统与工具调用-标准答案库'],
  ['AI 服务化、性能与成本', 'AI模块4-AI服务化、性能与成本优化-标准答案库'],
  ['AI 安全、合规与治理', 'AI模块5-AI安全、合规与治理-标准答案库'],
  ['AI 评测、实验与 ROI', 'AI模块6-AI评测、实验与业务ROI-标准答案库']
].map(([text, file]) => ({ text, link: `/ai/${file}` }))

const guides = [
  { text: '专题入口', link: '/guides/' },
  { text: '26 模块总索引', link: '/guides/基础8+架构12+AI6-总索引' },
  { text: '基础与架构总索引', link: '/guides/基础8+架构12-总索引' },
  { text: '基础模块目录', link: '/guides/基础8模块-总目录' },
  { text: '26 模块知识脑图', link: '/guides/26模块知识脑图版' },
  { text: '高频 100 题', link: '/guides/高频100题-抽认卡版' },
  { text: '面试笔记示例', link: '/examples/面试笔记示例' }
]

const jvmConcurrencyDeepDives = [
  { text: '模块入口', link: '/deep-dives/jvm-concurrency/' },
  { text: 'GC 选型与调优', link: '/deep-dives/jvm-concurrency/01-gc-selection-and-tuning' },
  { text: '内存泄漏证据链', link: '/deep-dives/jvm-concurrency/02-memory-leak-diagnosis' },
  { text: '线程池容量模型', link: '/deep-dives/jvm-concurrency/03-thread-pool-sizing' },
  { text: '锁竞争定位与改造', link: '/deep-dives/jvm-concurrency/04-lock-contention' },
  { text: 'JMM 与可见性', link: '/deep-dives/jvm-concurrency/05-jmm-and-visibility' },
  { text: 'CPU 飙高排查', link: '/deep-dives/jvm-concurrency/06-high-cpu-diagnosis' },
  { text: '案例：Full GC 与 TP99', link: '/deep-dives/jvm-concurrency/case-full-gc-latency' }
]

const caseGroups = [
  {
    text: 'JVM 完整案例',
    items: [
      ['模块入口', 'jvm/'], ['CPU 持续 100%', 'jvm/high-cpu-incident'],
      ['线程池耗尽', 'jvm/thread-pool-exhaustion'], ['低延迟 Java 服务', 'jvm/low-latency-java-service']
    ]
  },
  {
    text: '数据库完整案例',
    items: [
      ['模块入口', 'database/'], ['慢 SQL 超时', 'database/slow-sql-timeout'],
      ['死锁与锁等待', 'database/deadlock-and-lock-wait'], ['订单存储设计', 'database/high-concurrency-order-storage']
    ]
  },
  {
    text: 'Redis 完整案例',
    items: [
      ['模块入口', 'redis/'], ['热 Key 过载', 'redis/hot-key-overload'],
      ['击穿与不一致', 'redis/cache-breakdown-and-inconsistency'], ['高可用缓存', 'redis/highly-available-cache']
    ]
  },
  {
    text: '消息队列完整案例',
    items: [
      ['模块入口', 'messaging/'], ['消息积压', 'messaging/message-backlog'],
      ['重复、丢失与乱序', 'messaging/duplicate-loss-and-disorder'], ['事件驱动架构', 'messaging/reliable-event-driven-architecture']
    ]
  },
  {
    text: '系统设计完整案例',
    items: [
      ['模块入口', 'system-design/'], ['秒杀击穿', 'system-design/flash-sale-overload'],
      ['级联雪崩', 'system-design/cascading-failure'], ['高并发订单系统', 'system-design/high-concurrency-order-system']
    ]
  }
].map(group => ({
  text: group.text,
  collapsed: true,
  items: group.items.map(([text, path]) => ({ text, link: `/deep-dives/cases/${path}` }))
}))

export default withMermaid(defineConfig({
  lang: 'zh-CN',
  title: '面试知识库',
  description: '面向高级后端、架构师与 AI 架构师的系统化面试资料',
  base: process.env.BASE_PATH || '/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['superpowers/**/*.md'],
  mermaid: {
    theme: 'neutral',
    securityLevel: 'strict',
    flowchart: {
      htmlLabels: true,
      curve: 'basis'
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${process.env.BASE_PATH || '/'}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#0b7a65' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }]
  ],
  themeConfig: {
    siteTitle: '面试知识库',
    nav: [
      { text: '首页', link: '/' },
      { text: '基础知识', link: '/fundamentals/' },
      { text: '架构设计', link: '/architecture/' },
      { text: 'AI 架构', link: '/ai/' },
      { text: '深度精选', link: '/deep-dives/' },
      { text: '高频专题', link: '/guides/' }
    ],
    sidebar: {
      '/deep-dives/': [
        {
          text: '深度精选',
          items: [{ text: '总入口', link: '/deep-dives/' }]
        },
        {
          text: 'JVM 与并发',
          collapsed: false,
          items: jvmConcurrencyDeepDives
        },
        { text: '完整案例库', items: [{ text: '案例总入口', link: '/deep-dives/cases/' }] },
        ...caseGroups
      ],
      '/fundamentals/': [{ text: '基础知识', items: [{ text: '学习入口', link: '/fundamentals/' }, ...fundamentals] }],
      '/architecture/': [{ text: '架构设计', items: [{ text: '学习入口', link: '/architecture/' }, ...architecture] }],
      '/ai/': [{ text: 'AI 架构', items: [{ text: '学习入口', link: '/ai/' }, ...ai] }],
      '/guides/': [{ text: '高频专题', items: guides }],
      '/examples/': [{ text: '示例', items: guides }]
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '没有找到相关内容',
                resetButtonTitle: '清除查询',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    outline: { level: [2, 3], label: '本页目录' },
    lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'medium', timeStyle: 'short' } },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    mobileMenuLabel: '菜单'
  }
}))
