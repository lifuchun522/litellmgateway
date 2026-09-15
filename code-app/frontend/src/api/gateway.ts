export type Dashboard = {
  requestsToday: number
  successRate: number
  averageLatencyMs: number
  totalCost: number
  activeApplications: number
  activeSnapshot: { version: string; activatedAt: string; ackSummary: string } | null
  endpoints: { total: number; healthy: number }
}

export type Catalog = {
  applications: Array<Record<string, any>>
  aliases: Array<Record<string, any>>
  providers: Array<Record<string, any>>
  endpoints: Array<Record<string, any>>
}

export type Trace = Record<string, any> & { attempts: Array<Record<string, any>> }

type ApiEnvelope<T> = { success: boolean; data: T; message?: string }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/gateway${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  const body = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !body.success) throw new Error(body.message || `请求失败 (${response.status})`)
  return body.data
}

export const gatewayApi = {
  dashboard: () => api<Dashboard>('/dashboard'),
  catalog: () => api<Catalog>('/catalog'),
  policies: () => api<Array<Record<string, any>>>('/policies'),
  traces: () => api<Trace[]>('/traces'),
  reconciliations: () => api<Array<Record<string, any>>>('/reconciliations'),
  audits: () => api<Array<Record<string, any>>>('/audits'),
  invoke: () => api<Record<string, any>>('/invoke', {
    method: 'POST',
    body: JSON.stringify({ appCode: 'research-copilot', model: 'smart-chat', simulateFailure: true }),
  }),
}
