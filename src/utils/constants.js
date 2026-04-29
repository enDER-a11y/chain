// 常量定义

export const ENTERPRISE_TYPE_LABEL = {
  upstream: '上游企业',
  midstream: '中游企业',
  downstream: '下游企业'
}

export const ALERT_LEVEL_LABEL = {
  high: '高',
  medium: '中',
  low: '低'
}

export const ALERT_LEVEL_COLOR = {
  high: '#f56c6c',
  medium: '#e6a23c',
  low: '#409eff'
}

export const ALERT_TYPE_LABEL = {
  material_shortage: '原料供应不足',
  material_quality: '原料质检不合格',
  material_delay: '原料延迟送达',
  production_incomplete: '生产计划未完成',
  production_delay: '生产延迟',
  product_quality: '成品质检不合格',
  inventory_shortage: '库存不足',
  inventory_excess: '库存积压',
  trace_error: '批次号录入错误',
  qrcode_fail: '溯源码生成失败'
}

export const QUALITY_STATUS_LABEL = {
  qualified: '合格',
  unqualified: '不合格',
  pending: '待检'
}

export const QUALITY_STATUS_COLOR = {
  qualified: '#67c23a',
  unqualified: '#f56c6c',
  pending: '#909399'
}

export const STAGE_LABEL = {
  upstream: '上游',
  midstream: '中游',
  downstream: '下游'
}

export const TRACE_CODE_STATUS_LABEL = {
  not_generated: '未生成',
  generated: '已生成',
  partial: '部分生成'
}
