export type LeadershipScenario = {
  id: string
  theme: string
  title: string
  prompt: string
  followUps: string[]
  checkpoints: string[][]
}

const followUp = {
  truth: '请具体说明：当时谁持反对意见、你亲自做了什么，哪些结果不能归功于你？',
  judgment: '你考虑过哪些替代方案？什么情况下你会升级、妥协或停止？',
  reflection: '如果结果没有达到预期，你如何止损？这次经历改变了什么机制？'
}

export const leadershipThemes = [
  {
    id: 'influence', name: '无职权影响', description: '不用职位权力推动跨团队改变', scenarios: [
      ['platform-adoption', '推动平台采用', '你负责建设内部平台，但头部业务团队拒绝接入，认为平台限制效率。请讲一次类似经历。'],
      ['shared-standard', '建立跨团队标准', '多个团队对接口、日志或发布标准各有偏好，你如何形成真正被采用的共同标准？'],
      ['shared-capability', '推动公共能力建设', '业务团队认为自建更快，不愿为公共能力投入资源。你如何证明并推动共建？'],
      ['executive-support', '争取管理层支持', '一项可靠性改造短期没有直接收入，你如何获得业务和管理层支持？']
    ]
  },
  {
    id: 'conflict', name: '冲突与决策', description: '把立场冲突还原为约束和责任边界', scenarios: [
      ['architecture-dispute', '架构路线分歧', '你和另一位资深架构师对技术路线判断相反，双方都有合理证据。你如何推进决策？'],
      ['data-ownership', '数据所有权冲突', '两个团队都认为自己应该拥有同一份核心业务数据，你如何确定边界？'],
      ['resource-priority', '资源优先级冲突', '多个关键项目争夺同一个平台团队的有限资源，你如何参与优先级决策？'],
      ['review-deadlock', '架构评审僵局', '高风险方案评审迟迟无法形成结论，项目交付已经被阻塞。你怎么办？']
    ]
  },
  {
    id: 'risk', name: '速度与风险', description: '在交付压力下明确风险接受与止损', scenarios: [
      ['launch-pressure', '业务催上线', '业务要求今天上线，但你判断存在低概率、高损失的数据一致性风险。你如何处理？'],
      ['security-gate', '安全门禁争议', '安全团队要求阻断发布，业务认为风险很低且错过窗口损失巨大。你如何推进？'],
      ['known-debt', '带债上线', '项目必须按期上线，但关键链路仍有已知技术债。你如何决定接受、缓解还是延期？'],
      ['exception-request', '标准例外申请', '头部业务要求绕过架构标准，并声称其场景特殊。你如何处理例外？']
    ]
  },
  {
    id: 'transformation', name: '架构转型', description: '把宏大改造拆成可验证的组织变化', scenarios: [
      ['monolith-evolution', '推动单体演进', '单体已经拖慢交付，但团队和业务无法承受一次全面重构。你如何推动演进？'],
      ['debt-program', '技术债治理', '技术债清单不断增长，业务始终不给专门时间。你如何让治理真正发生？'],
      ['legacy-retirement', '旧平台退场', '新平台已经上线，但业务团队长期不愿迁移，双轨成本持续上升。你怎么办？'],
      ['cloud-migration', '基础设施迁移', '管理层希望快速完成云迁移，但团队只是“搬家”而没有获得收益。你如何调整路线？']
    ]
  },
  {
    id: 'incident', name: '事故与责任', description: '承担决策责任并把复盘转成系统改进', scenarios: [
      ['own-decision-failed', '你的决策导致故障', '讲一次由你主导的架构决策最终引发生产故障的经历。'],
      ['blameless-tension', '无责复盘争议', '事故中存在明显人为失误，管理层要求追责，团队希望无责复盘。你如何处理？'],
      ['repeat-incident', '同类事故重复发生', '同一种故障在半年内发生两次，第一次复盘动作都显示已完成。你如何继续？'],
      ['customer-impact', '重大客户影响', '事故技术上已恢复，但重要客户和业务方不再信任团队。你如何参与恢复信任？']
    ]
  },
  {
    id: 'organization', name: '团队与组织', description: '通过机制、边界和培养扩大架构影响力', scenarios: [
      ['delegation', '委派关键设计', '关键项目风险很高，但只有你最熟悉系统。你如何委派而不成为瓶颈？'],
      ['architect-growth', '培养架构能力', '团队工程师执行力强，但遇到模糊问题只会等待方案。你如何建设架构能力？'],
      ['review-scale', '扩展评审机制', '架构评审请求快速增长，你已经无法参加每一场评审。如何保证质量？'],
      ['underperformance', '处理能力错配', '一位资深工程师长期无法承担岗位要求的架构责任，但技术资历很深。你如何处理？']
    ]
  }
].map(theme => ({
  ...theme,
  scenarios: theme.scenarios.map(([id, title, prompt]) => ({
    id, title, prompt, theme: theme.name,
    followUps: [followUp.truth, followUp.judgment, followUp.reflection],
    checkpoints: [
      ['影响范围', '关键参与者', '冲突约束'],
      ['本人行动', '责任边界', '事实证据'],
      ['替代方案', '决策原则', '升级条件'],
      ['推动过程', '止损机制', '残余风险'],
      ['结果指标', '失败反思', '机制改变']
    ]
  } as LeadershipScenario))
}))

export const leadershipScenarios = leadershipThemes.flatMap(theme => theme.scenarios)
