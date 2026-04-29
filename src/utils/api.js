// API服务层 - 真实后端请求

// 企业类型枚举
export const ENTERPRISE_TYPE = {
  UPSTREAM: 'upstream',    // 上游企业
  MIDSTREAM: 'midstream',  // 中游企业
  DOWNSTREAM: 'downstream' // 下游企业
}

// 预警紧急程度
export const ALERT_LEVEL = {
  HIGH: 'high',    // 高
  MEDIUM: 'medium', // 中
  LOW: 'low'       // 低
}

// 预警类型
export const ALERT_TYPE = {
  MATERIAL_SHORTAGE: 'material_shortage',      // 原料供应不足
  MATERIAL_QUALITY: 'material_quality',        // 原料质检不合格
  MATERIAL_DELAY: 'material_delay',            // 原料延迟送达
  PRODUCTION_INCOMPLETE: 'production_incomplete', // 生产计划未完成
  PRODUCTION_DELAY: 'production_delay',        // 生产延迟
  PRODUCT_QUALITY: 'product_quality',          // 成品质检不合格
  INVENTORY_SHORTAGE: 'inventory_shortage',    // 库存不足
  INVENTORY_EXCESS: 'inventory_excess',        // 库存积压
  TRACE_ERROR: 'trace_error',                  // 批次号录入错误
  QRCODE_FAIL: 'qrcode_fail'                  // 溯源码生成失败
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  return new URLSearchParams(entries).toString()
}

const request = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `请求失败: ${response.status}`)
  }

  return response.json()
}

export const getCurrentEnterprise = async () => {
  const savedType = localStorage.getItem('enterpriseType') || ENTERPRISE_TYPE.MIDSTREAM
  return request('/enterprise/current', {
    headers: {
      'x-enterprise-type': savedType
    }
  })
}

// 设置当前企业类型
export const setCurrentEnterpriseType = (type) => {
  localStorage.setItem('enterpriseType', type)
  request('/enterprise/current/type', {
    method: 'POST',
    body: JSON.stringify({ type })
  }).catch(() => {})
}

// 获取首页看板数据（按企业类型）
export const getDashboardData = async (enterpriseType, timeRange = 'day') => {
  const query = buildQuery({ enterpriseType, timeRange })
  return request(`/dashboard?${query}`)
}

// 获取图表数据
export const getChartData = async (enterpriseType, chartType, timeRange = 'day') => {
  const query = buildQuery({ enterpriseType, chartType, timeRange })
  return request(`/dashboard/chart?${query}`)
}

// 获取预警列表（按企业类型）
export const getAlerts = async (filters = {}, enterpriseType = null) => {
  const selectedType = enterpriseType || localStorage.getItem('enterpriseType') || ENTERPRISE_TYPE.MIDSTREAM
  const query = buildQuery({ ...filters, enterpriseType: selectedType })
  return request(`/alerts?${query}`)
}

// 处理预警
export const handleAlert = async (alertId, solution) => {
  return request(`/alerts/${alertId}/handle`, {
    method: 'POST',
    body: JSON.stringify({ solution })
  })
}

// 获取数据总览列表
export const getDataOverview = async (filters = {}) => {
  const query = buildQuery(filters)
  return request(`/data-overview?${query}`)
}

// 导出数据
export const exportData = async (filters, format = 'xlsx') => {
  const query = buildQuery({ ...(filters || {}), format })
  return request(`/data-overview/export?${query}`)
}

// 提交数据上报
export const submitDataReport = async (formData, enterpriseType) => {
  return request('/data-report', {
    method: 'POST',
    body: JSON.stringify({
      enterpriseType,
      status: 'submitted',
      data: formData
    })
  })
}

// 暂存数据上报
export const saveDraft = async (formData, enterpriseType) => {
  return request('/data-report', {
    method: 'POST',
    body: JSON.stringify({
      enterpriseType,
      status: 'draft',
      data: formData
    })
  })
}

export const getLatestDraft = async (enterpriseType) => {
  const query = buildQuery({ enterpriseType })
  return request(`/data-report/draft/latest?${query}`)
}

// 获取上下游数据
export const getUpstreamDownstreamData = async (enterpriseType, direction = 'all') => {
  const query = buildQuery({ enterpriseType, direction })
  return request(`/upstream-downstream?${query}`)
}

// 获取批次列表（下游专属）
export const getBatchList = async (filters = {}) => {
  const query = buildQuery(filters)
  return request(`/batches?${query}`)
}

// 生成二维码
export const generateQRCode = async (batchNo, count, type = 'batch') => {
  return request(`/batches/${batchNo}/qrcodes`, {
    method: 'POST',
    body: JSON.stringify({
      count,
      type
    })
  }
  )
}

// 获取批次详情
export const getBatchDetail = async (batchNo) => {
  return request(`/batches/${batchNo}/detail`)
}

// 获取消费者溯源数据（全流程）
export const getConsumerTraceability = async (traceId) => {
  return request(`/traceability/consumer/${traceId}`)
}

// 获取上游溯源详情
export const getUpstreamTraceability = async () => {
  return request('/traceability/upstream')
}

// 获取中游溯源详情
export const getMidstreamTraceability = async () => {
  return request('/traceability/midstream')
}

// 获取下游溯源详情
export const getDownstreamTraceability = async () => {
  return request('/traceability/downstream')
}

// 验证区块链哈希
export const verifyBlockchainHash = async (hash) => {
  return request('/blockchain/verify', {
    method: 'POST',
    body: JSON.stringify({ hash })
  })
}

export const getMapConfig = async () => {
  return request('/map/config')
}

export const getEmergencyOverview = async (filters = {}) => {
  const query = buildQuery(filters)
  return request(`/emergency/overview?${query}`)
}
