export type FactCategory = 'business' | 'traffic' | 'data' | 'latency' | 'availability' | 'consistency' | 'compliance' | 'cost' | 'team' | 'migration'

export type SystemDesignScenario = {
  id: string
  title: string
  brief: string
  area: string
  difficulty: 1 | 2 | 3
  facts: Partial<Record<FactCategory, string>>
  required: FactCategory[]
  injections: string[]
  checkpoints: string[][]
  referencePath: string
}

export const factLabels: Record<FactCategory, string> = {
  business: '业务目标', traffic: '流量规模', data: '数据规模', latency: '延迟目标', availability: '可用性',
  consistency: '一致性', compliance: '安全合规', cost: '成本预算', team: '团队约束', migration: '迁移限制'
}

export const systemDesignScenarios: SystemDesignScenario[] = [
  {
    id: 'global-inventory', title: '全球订单与库存预占', brief: '设计一个支持全球业务的订单与库存预占系统。', area: '交易 / 多地域', difficulty: 3,
    facts: {
      business: '普通电商、直播和秒杀共用；不能超卖，支付窗口 15 分钟。', traffic: '全球峰值尝试 120k/s，成功订单 24k/s，热点 SKU 占 35%。', data: '现有订单库 10TB，日增 1.2 亿明细。', latency: '本地受理 P99 < 120ms，订单 3 秒内可见。', availability: '下单 SLO 99.99%，单地域故障不能中断全球业务。', consistency: '库存不能超卖；订单、支付允许分钟级对账收敛。', compliance: '欧盟订单数据需要地域驻留，财务金额需七年审计。', cost: '允许双地域热备，不能所有地域全量多活。', team: '3 个业务团队和 1 个平台团队，迁移窗口 6 个月。', migration: '现有接口和订单号不能改变，不允许停机切换。'
    },
    required: ['business', 'traffic', 'latency', 'availability', 'consistency', 'migration'],
    injections: ['核心消息队列不可用 12 分钟，库存已经预占但部分订单尚未创建。你如何止损和恢复？', '公司进入南美市场，网络 RTT 增加到 280ms，但预算不允许新增完整订单主集群。如何演进？'],
    checkpoints: [['业务不变量', '峰值与热点', '地域边界'], ['事实源', '幂等状态机', '关键链路'], ['同步异步取舍', '分片键', '演进条件'], ['故障降级', '对账补偿', '迁移回退'], ['SLO 与水位', '演练验收', '结构表达']],
    referencePath: '/deep-dives/cases/system-design/high-concurrency-order-system'
  },
  {
    id: 'notification-platform', title: '千万级通知平台', brief: '设计一个供全公司使用的多渠道通知平台。', area: '平台 / 消息', difficulty: 2,
    facts: { business: '支持交易、营销和安全通知，交易消息不能被营销流量拖累。', traffic: '日均 5 亿条，晚间活动峰值 180k/s。', data: '消息记录保留 90 天，审计记录保留一年。', latency: '交易通知 5 秒内送达，营销允许 10 分钟。', availability: '核心通知 SLO 99.95%。', consistency: '允许至少一次投递，业务方需要幂等和可查询状态。', compliance: '必须支持退订、频控和敏感内容审计。', cost: '短信成本每季度必须下降 15%。', team: '平台团队 7 人，渠道供应商由采购统一管理。', migration: '已有 40 个业务直接调用供应商接口，需要渐进迁移。' },
    required: ['business', 'traffic', 'latency', 'consistency', 'cost', 'migration'],
    injections: ['活动流量突然增长十倍，营销队列开始挤压交易通知。', '主短信供应商限流至原容量的 30%，备用供应商单价高两倍。'],
    checkpoints: [['优先级与租户', '峰值模型'], ['队列隔离', '状态与幂等'], ['渠道路由', '成本取舍'], ['限流降级', '供应商切换'], ['送达 SLI', '成本与质量']],
    referencePath: '/deep-dives/cases/messaging/reliable-event-driven-architecture'
  },
  {
    id: 'tenant-auth', title: '多租户 SaaS 权限平台', brief: '设计一个多租户企业 SaaS 的身份与权限平台。', area: '安全 / SaaS', difficulty: 3,
    facts: { business: '企业管理员配置角色、资源和临时授权，支持组织层级。', traffic: '2 万租户、800 万用户，鉴权峰值 90k/s。', data: '权限关系 12 亿条，租户规模差异超过一万倍。', latency: '在线鉴权 P99 < 35ms。', availability: '鉴权 SLO 99.999%，故障时不能默认放行。', consistency: '权限撤销 30 秒内全局生效，高风险权限要求立即生效。', compliance: '需要租户隔离、操作审计和数据驻留。', cost: '优先复用现有 PostgreSQL 与 Redis。', team: '安全平台 6 人，业务团队自行定义资源模型。', migration: '现有服务各自维护角色，需要兼容一年。' },
    required: ['business', 'traffic', 'latency', 'availability', 'consistency', 'compliance'],
    injections: ['审计发现合法 JWT 可读取另一个租户的对象。如何止血并定位信任边界？', '一个超大租户要求使用独立密钥和自定义策略，但不能复制整套平台。'],
    checkpoints: [['主体资源动作', '租户边界'], ['策略决策点', '缓存版本'], ['RBAC/ABAC 取舍', '大租户隔离'], ['拒绝优先', '撤权传播', '审计'], ['鉴权 SLI', '安全验证']],
    referencePath: '/deep-dives/security-compliance/01-identity-authorization'
  },
  {
    id: 'risk-engine', title: '实时风控决策平台', brief: '设计一个供支付与营销业务使用的实时风控决策平台。', area: '决策 / 低延迟', difficulty: 3,
    facts: { business: '支付拦截必须同步，营销风险可以异步复核。', traffic: '峰值 55k/s，单用户和单设备存在强热点。', data: '2 千个特征、600 条规则，规则每天发布数十次。', latency: '支付风控总预算 80ms，平台 P99 < 45ms。', availability: '支付链路 SLO 99.99%。', consistency: '规则版本必须可追溯，非关键特征允许 5 分钟陈旧。', compliance: '拒绝决定需要保留 12 个月解释证据。', cost: '特征计算成本不能超过单笔交易收入的 1%。', team: '算法、风控运营和平台三个团队共同交付。', migration: '旧引擎仅支持静态规则，需要影子运行三个月。' },
    required: ['business', 'traffic', 'latency', 'availability', 'consistency', 'compliance'],
    injections: ['特征平台 P99 从 30ms 上升到 800ms，但支付不能整体失败。', '监管要求解释一年前每一次拒绝决定，当前特征库只保留最新值。'],
    checkpoints: [['风险语义', '延迟预算'], ['规则版本', '特征分层'], ['同步异步边界', '降级取舍'], ['deadline', '决策快照'], ['误杀放过指标', '影子验证']],
    referencePath: '/deep-dives/distributed-stability/02-traffic-protection'
  },
  {
    id: 'observability', title: '日志与可观测平台', brief: '设计一个支持数千个服务的统一日志与可观测平台。', area: '可观测 / 数据', difficulty: 2,
    facts: { business: '开发排障、SRE 告警和安全审计共用平台。', traffic: '日摄取 2PB，峰值 40GB/s，单租户可能突发百倍。', data: '热数据 7 天、温数据 30 天、审计数据一年。', latency: '告警数据 30 秒可查，普通检索 2 分钟可见。', availability: '摄取 SLO 99.95%，查询允许降级。', consistency: '允许少量重复，安全审计不能静默丢失。', compliance: '日志包含个人数据，必须脱敏并控制跨地域查询。', cost: '年度存储预算固定，业务量增长 60%。', team: '平台团队 10 人，服务接入必须自助。', migration: '三个旧集群需在一年内退场。' },
    required: ['traffic', 'data', 'latency', 'compliance', 'cost', 'migration'],
    injections: ['单租户错误配置导致日志量增长 100 倍，摄取队列开始挤压。', '预算临时削减一半，但安全审计保留期不能改变。'],
    checkpoints: [['租户与数据等级', '容量估算'], ['采集缓冲', '冷热分层'], ['采样与保真取舍'], ['租户隔离', '背压降级'], ['丢失率', '单位摄取成本']],
    referencePath: '/architecture/架构模块7-可观测性与运维体系-标准答案库'
  },
  {
    id: 'developer-platform', title: '内部开发者平台', brief: '设计一个提高研发交付效率的内部开发者平台。', area: '平台工程 / 治理', difficulty: 2,
    facts: { business: '减少环境申请、服务创建和发布等待，不强制替代所有工具。', traffic: '服务 2200 个，开发者 6000 人，每天发布 4000 次。', data: '需要维护服务目录、owner、依赖和发布记录。', latency: '新服务 30 分钟内可部署到测试环境。', availability: '发布控制面 SLO 99.9%，故障不能影响运行中服务。', consistency: '服务元数据由团队维护，平台负责验证关键字段。', compliance: '生产权限最小化，所有发布可审计。', cost: '两年内平台团队不能超过 18 人。', team: '各业务技术栈差异大，已有多个自建脚手架。', migration: '先自愿采用，六个月后评估是否扩大门禁范围。' },
    required: ['business', 'team', 'availability', 'compliance', 'cost', 'migration'],
    injections: ['头部业务团队绕过平台，认为黄金路径限制了效率。', '管理层要求三个月内所有服务接入，否则削减平台预算。'],
    checkpoints: [['用户旅程', '采用目标'], ['控制面边界', '黄金路径'], ['标准与例外', '自建取舍'], ['渐进采用', '故障隔离'], ['前置时间', '绕行率与满意度']],
    referencePath: '/deep-dives/cloud-governance/03-platform-engineering'
  },
  {
    id: 'enterprise-rag', title: '企业 RAG 知识平台', brief: '设计一个面向全公司的企业知识问答平台。', area: 'AI / RAG', difficulty: 3,
    facts: { business: '覆盖制度查询、客服辅助和研发知识，回答必须引用来源。', traffic: '3 万员工，峰值 1500 请求/s。', data: '2 亿文档片段，每日更新 300 万，来源超过 20 种。', latency: '首 token P95 < 2 秒，完整回答 P95 < 8 秒。', availability: '问答 SLO 99.9%，模型故障时允许降级搜索。', consistency: '权限变更 5 分钟内影响检索，制度文档要求最新版本。', compliance: '文档权限不可被模型绕过，敏感查询必须审计。', cost: '单次成功回答成本目标低于 0.08 美元。', team: 'AI 平台 8 人，数据 owner 分布在各部门。', migration: '已有企业搜索，需保留搜索入口并逐步引流。' },
    required: ['business', 'data', 'latency', 'consistency', 'compliance', 'cost'],
    injections: ['评测发现正确率下降 18%，但检索 Recall@20 没有变化。', '安全团队发现低权限用户可通过摘要看到高权限文档片段。'],
    checkpoints: [['任务与质量定义', '权限边界'], ['摄取检索生成', '版本与 ACL'], ['模型路由', '质量成本取舍'], ['分层诊断', '安全出口'], ['离线线上评测', '成功任务成本']],
    referencePath: '/deep-dives/ai-architecture/01-rag-quality-loop'
  },
  {
    id: 'agent-execution', title: 'Agent 工具执行平台', brief: '设计一个可以安全调用企业内部工具的 Agent 执行平台。', area: 'AI / Agent', difficulty: 3,
    facts: { business: '支持查询、工单、退款和配置变更，高风险动作需要审批。', traffic: '峰值 8000 个任务/s，平均每个任务调用 6 次工具。', data: '任务状态与工具审计保留一年。', latency: '查询任务 P95 < 12 秒，异步任务可运行 30 分钟。', availability: '执行平台 SLO 99.95%，工具依赖各自有不同 SLO。', consistency: '退款和配置修改必须幂等，未知结果不能直接重试。', compliance: '最小权限、审批、数据出口控制和完整审计。', cost: '每个成功任务平均模型成本低于 0.15 美元。', team: '平台负责执行器，业务团队负责工具 schema 和风险等级。', migration: '先接只读工具，再逐步开放写操作。' },
    required: ['business', 'traffic', 'consistency', 'compliance', 'team', 'migration'],
    injections: ['退款工具超时，平台不知道调用是否已经成功。', '主模型供应商区域故障，备用模型不支持相同的工具调用格式。'],
    checkpoints: [['任务与风险分级', '信任边界'], ['持久状态机', '工具契约'], ['审批与路由取舍', '能力降级'], ['幂等与结果查询', '审计恢复'], ['成功任务率', '单位成功成本']],
    referencePath: '/deep-dives/ai-architecture/02-agent-production-safety'
  }
]
