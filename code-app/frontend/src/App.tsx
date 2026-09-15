import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Activity, AppWindow, Bot, Boxes, ChevronRight, CircleDollarSign, Clock3,
  FileClock, Gauge, HeartPulse, KeyRound, Layers3, ListTree, MessageSquareText,
  Network, RefreshCw, Route, Search, Send, ShieldCheck, Sparkles, WalletCards,
} from 'lucide-react'
import { Catalog, Dashboard, gatewayApi, Trace } from './api/gateway'

type View = 'dashboard' | 'traces' | 'applications' | 'aliases' | 'endpoints' | 'policies' | 'budgets' | 'prices' | 'health' | 'reconciliation' | 'audits'

const navigation: Array<{ group: string; items: Array<{ id: View; label: string; icon: ReactNode }> }> = [
  { group: '运行中心', items: [
    { id: 'dashboard', label: '运行总览', icon: <Gauge /> },
    { id: 'traces', label: '请求追踪', icon: <ListTree /> },
  ] },
  { group: '接入管理', items: [{ id: 'applications', label: '应用与凭证', icon: <KeyRound /> }] },
  { group: '模型目录', items: [
    { id: 'aliases', label: '模型别名', icon: <Layers3 /> },
    { id: 'endpoints', label: '提供商端点', icon: <Network /> },
  ] },
  { group: '策略中心', items: [
    { id: 'policies', label: '路由策略', icon: <Route /> },
    { id: 'budgets', label: '限额与预算', icon: <WalletCards /> },
    { id: 'prices', label: '价格管理', icon: <CircleDollarSign /> },
  ] },
  { group: '运维审计', items: [
    { id: 'health', label: '健康与熔断', icon: <HeartPulse /> },
    { id: 'reconciliation', label: '对账差异', icon: <RefreshCw /> },
    { id: 'audits', label: '审计日志', icon: <FileClock /> },
  ] },
]

const labels = Object.fromEntries(navigation.flatMap((group) => group.items.map((item) => [item.id, item.label])))

function Badge({ status }: { status: string }) {
  const tone = /HEALTHY|ACTIVE|SUCCEEDED|PUBLISHED|MATCHED/.test(status) ? 'success' : /FAILED|OPEN|DIFFERENCE/.test(status) ? 'danger' : 'warning'
  return <span className={`gateway-badge ${tone}`}>{status}</span>
}

function Empty({ text }: { text: string }) {
  return <div className="gateway-empty"><Boxes /><strong>{text}</strong><span>该能力已纳入统一网关本体，可通过 API 扩展管理动作。</span></div>
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])
  const [policies, setPolicies] = useState<Array<Record<string, any>>>([])
  const [reconciliations, setReconciliations] = useState<Array<Record<string, any>>>([])
  const [audits, setAudits] = useState<Array<Record<string, any>>>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [question, setQuestion] = useState('为什么最近一次请求发生了重试？')
  const [reasoning, setReasoning] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [d, c, t, p, r, a] = await Promise.all([
        gatewayApi.dashboard(), gatewayApi.catalog(), gatewayApi.traces(), gatewayApi.policies(),
        gatewayApi.reconciliations(), gatewayApi.audits(),
      ])
      setDashboard(d); setCatalog(c); setTraces(t); setPolicies(p); setReconciliations(r); setAudits(a)
    } catch (error) { setNotice(error instanceof Error ? error.message : '数据加载失败') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const invoke = async () => {
    setNotice('正在验证重试与故障转移链路…')
    try {
      const result = await gatewayApi.invoke()
      setNotice(`验证成功：${result.traceId}，${result.attemptCount} 次尝试后命中 ${result.endpoint}`)
      await load()
    } catch (error) { setNotice(error instanceof Error ? error.message : '验证失败') }
  }

  const ask = async (event: FormEvent) => {
    event.preventDefault()
    if (!question.trim() || asking) return
    setAsking(true); setReasoning([]); setAnswer('')
    try {
      const response = await fetch('/api/gateway/assistant/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }),
      })
      if (!response.ok || !response.body) throw new Error('AI 助手暂不可用')
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n'); buffer = blocks.pop() || ''
        for (const block of blocks) {
          const eventName = block.match(/^event: (.+)$/m)?.[1]
          const data = block.match(/^data: (.+)$/m)?.[1]
          if (!data) continue
          const payload = JSON.parse(data)
          if (eventName === 'reasoning') setReasoning((items) => [...items, `${payload.step} · ${payload.detail}`])
          if (eventName === 'answer') setAnswer(payload.content)
        }
      }
    } catch (error) { setAnswer(error instanceof Error ? error.message : '分析失败') }
    finally { setAsking(false) }
  }

  const content = useMemo(() => {
    if (loading || !dashboard || !catalog) return <div className="gateway-loading"><RefreshCw className="spin" /> 正在加载网关运行态…</div>
    if (view === 'dashboard') return <DashboardView data={dashboard} catalog={catalog} traces={traces} invoke={invoke} notice={notice} />
    if (view === 'traces') return <TraceTable traces={traces} />
    if (view === 'applications') return <ApplicationTable applications={catalog.applications} />
    if (view === 'aliases') return <AliasTable aliases={catalog.aliases} />
    if (view === 'endpoints' || view === 'health' || view === 'prices') return <EndpointTable endpoints={catalog.endpoints} mode={view} />
    if (view === 'policies') return <PolicyTable policies={policies} />
    if (view === 'budgets') return <ApplicationTable applications={catalog.applications} budget />
    if (view === 'reconciliation') return <ReconciliationTable rows={reconciliations} />
    if (view === 'audits') return <AuditTable rows={audits} />
    return <Empty text="能力建设中" />
  }, [view, loading, dashboard, catalog, traces, policies, reconciliations, audits, notice])

  return <div className="gateway-shell">
    <header className="gateway-header">
      <div className="brand-mark"><Sparkles /></div><div className="brand-title">NEXUS <span>LLM GATEWAY</span></div>
      <div className="environment"><span /> 生产环境</div>
      <div className="header-space" />
      <div className="snapshot-pill"><ShieldCheck /> 活动快照 {dashboard?.activeSnapshot?.version || '加载中'}</div>
      <div className="header-user"><div>运</div><span>运行管理员</span></div>
    </header>
    <div className="gateway-body">
      <aside className="gateway-sidebar">
        {navigation.map((group) => <section key={group.group}><h3>{group.group}</h3>{group.items.map((item) =>
          <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)} data-testid={`nav-${item.id}`}>
            {item.icon}<span>{item.label}</span>{view === item.id && <ChevronRight className="chevron" />}
          </button>)}</section>)}
        <div className="policy-state"><ShieldCheck /><div><strong>策略防线正常</strong><span>16 条本体规则已启用</span></div></div>
      </aside>
      <main className="gateway-main">
        <div className="gateway-titlebar"><div><span>LLM 网关 / {labels[view]}</span><h1>{labels[view]}</h1></div><button className="icon-button" onClick={() => void load()} aria-label="刷新"><RefreshCw /></button></div>
        <div className="gateway-scroll">{content}</div>
      </main>
      <aside className="gateway-copilot">
        <div className="copilot-header"><div className="copilot-icon"><Bot /></div><div><strong>Nexus Copilot</strong><span><i /> 语义分析在线</span></div></div>
        <div className="copilot-body">
          <div className="copilot-intro"><Sparkles /><strong>网关运维助手</strong><p>我可以基于请求、尝试、快照和端点健康本体，解释运行状态与策略决策。</p></div>
          <button className="suggestion" onClick={() => setQuestion('为什么最近一次请求发生了重试？')}><MessageSquareText /> 为什么最近一次请求发生了重试？</button>
          {(reasoning.length > 0 || answer) && <div className="assistant-result" data-testid="assistant-response">
            {reasoning.map((item, index) => <div className="reasoning" key={index}><span>{index + 1}</span>{item}</div>)}
            {answer && <div className="answer"><Bot /> <p>{answer}</p></div>}
          </div>}
        </div>
        <form className="copilot-form" onSubmit={ask}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} data-testid="assistant-input" rows={3} /><div><span>只读语义查询</span><button type="submit" disabled={asking} data-testid="assistant-send">{asking ? <RefreshCw className="spin" /> : <Send />}</button></div></form>
      </aside>
    </div>
  </div>
}

function DashboardView({ data, catalog, traces, invoke, notice }: { data: Dashboard; catalog: Catalog; traces: Trace[]; invoke: () => void; notice: string }) {
  const cards = [
    ['今日请求', data.requestsToday.toLocaleString(), <Activity />, '较昨日 +12.4%'],
    ['成功率', `${data.successRate}%`, <ShieldCheck />, '目标 ≥ 99.5%'],
    ['平均延迟', `${data.averageLatencyMs} ms`, <Clock3 />, 'P50 实时口径'],
    ['今日成本', `$${Number(data.totalCost).toFixed(4)}`, <CircleDollarSign />, `${data.activeApplications} 个活跃应用`],
  ]
  return <div data-testid="gateway-dashboard">
    <div className="snapshot-banner"><div><ShieldCheck /><span><strong>不可变快照已生效</strong> · {data.activeSnapshot?.version}<small>编译配置已完成跨可用区确认：{data.activeSnapshot?.ackSummary}</small></span></div><Badge status="ACTIVE" /></div>
    <div className="metric-grid">{cards.map(([label, value, icon, hint]) => <div className="metric-card" key={String(label)}><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>)}</div>
    {notice && <div className="notice" data-testid="invoke-result">{notice}</div>}
    <div className="dashboard-grid">
      <section className="gateway-panel"><div className="panel-heading"><div><h2>端点健康</h2><p>按优先级、数据分级与实时健康状态选路</p></div><span>{data.endpoints.healthy}/{data.endpoints.total} 健康</span></div><EndpointTable endpoints={catalog.endpoints} compact mode="health" /></section>
      <section className="gateway-panel"><div className="panel-heading"><div><h2>最近调用链</h2><p>请求 → 尝试，可追溯重试边界</p></div><button className="primary-action" onClick={invoke} data-testid="invoke-button"><Send /> 发送验证请求</button></div><TraceCards traces={traces.slice(0, 3)} /></section>
    </div>
  </div>
}

function TraceCards({ traces }: { traces: Trace[] }) { return <div className="trace-list">{traces.map((trace) => <div className="trace-card" key={trace.traceId}><div><code>{trace.traceId}</code><Badge status={trace.status} /></div><p>{trace.appCode} · {trace.aliasCode} · {trace.snapshotVersion}</p><div className="attempt-chain">{trace.attempts.map((attempt, i) => <span key={`${trace.traceId}-${i}`} className={attempt.status === 'SUCCEEDED' ? 'ok' : 'fail'}>{attempt.sequence}. {attempt.endpointCode}<small>{attempt.errorCode || `${attempt.latencyMs}ms`}</small></span>)}</div></div>)}</div> }

function TraceTable({ traces }: { traces: Trace[] }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>请求—尝试追踪</h2><p>一次请求可包含多个受规则约束的端点尝试</p></div></div><TraceCards traces={traces} /></section> }

function EndpointTable({ endpoints, mode, compact = false }: { endpoints: Array<Record<string, any>>; mode: View; compact?: boolean }) { return <div className="gateway-table"><table><thead><tr><th>端点</th><th>提供商 / 模型</th>{!compact && <th>数据分级</th>}<th>{mode === 'prices' ? '输入/输出价格' : '优先级 / 延迟'}</th><th>状态</th></tr></thead><tbody>{endpoints.map((item) => <tr key={item.code}><td><strong>{item.name}</strong><code>{item.code}</code></td><td>{item.providerName}<small>{item.model}</small></td>{!compact && <td>{item.dataGrade}</td>}<td>{mode === 'prices' ? `$${item.inputPrice} / $${item.outputPrice}` : `P${item.priority} · ${item.latencyMs}ms`}</td><td><Badge status={item.status} /></td></tr>)}</tbody></table></div> }

function ApplicationTable({ applications, budget = false }: { applications: Array<Record<string, any>>; budget?: boolean }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>{budget ? '限额与预算' : '应用与凭证'}</h2><p>身份绑定、数据分级和用量防线统一管理</p></div></div><div className="gateway-table"><table><thead><tr><th>应用</th><th>负责人</th><th>数据分级</th><th>日限额</th><th>月预算</th><th>状态</th></tr></thead><tbody>{applications.map((item) => <tr key={item.code}><td><strong>{item.name}</strong><code>{item.code}</code></td><td>{item.owner}</td><td>{item.dataGrade}</td><td>{item.dailyQuota.toLocaleString()}</td><td>${item.monthlyBudget}</td><td><Badge status={item.status} /></td></tr>)}</tbody></table></div></section> }

function AliasTable({ aliases }: { aliases: Array<Record<string, any>> }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>稳定模型别名</h2><p>业务只依赖别名，实际模型由活动快照解析</p></div></div><div className="alias-grid">{aliases.map((item) => <div className="alias-card" key={item.code}><Layers3 /><strong>{item.name}</strong><code>{item.code}</code><p>{(item.capabilities || []).join(' · ')}</p><Badge status={item.status} /></div>)}</div></section> }

function PolicyTable({ policies }: { policies: Array<Record<string, any>> }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>路由策略与审批</h2><p>提交人与安全、SRE 审批人职责分离</p></div></div><div className="gateway-table"><table><thead><tr><th>策略</th><th>作用域</th><th>策略 / 尝试</th><th>审批链</th><th>快照</th><th>状态</th></tr></thead><tbody>{policies.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.appCode} / {item.aliasCode}</td><td>{item.strategy} / {item.maxAttempts}</td><td>{item.securityApprover || '待安全'} → {item.sreApprover || '待 SRE'}</td><td>{item.snapshotVersion || '—'}</td><td><Badge status={item.status} /></td></tr>)}</tbody></table></div></section> }

function ReconciliationTable({ rows }: { rows: Array<Record<string, any>> }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>账单对账差异</h2><p>网关计量与提供商账单按周期核验，差异超过 3% 进入处置</p></div></div><div className="gateway-table"><table><thead><tr><th>提供商</th><th>周期</th><th>网关成本</th><th>账单成本</th><th>差异率</th><th>状态</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td>{item.providerCode}</td><td>{item.period}</td><td>${item.gatewayCost}</td><td>${item.providerCost}</td><td>{item.differenceRate}%</td><td><Badge status={item.status} /></td></tr>)}</tbody></table></div></section> }

function AuditTable({ rows }: { rows: Array<Record<string, any>> }) { return <section className="gateway-panel"><div className="panel-heading"><div><h2>不可抵赖审计日志</h2><p>策略、快照与调用动作均保留结构化证据</p></div></div><div className="gateway-table"><table><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td>{item.createdAt}</td><td>{item.actor}</td><td><code>{item.action}</code></td><td>{item.detail?.objectType} / {item.detail?.objectId}</td></tr>)}</tbody></table></div></section> }
