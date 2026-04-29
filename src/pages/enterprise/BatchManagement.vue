<template>
  <div class="batch-management">
    <el-row :gutter="20">
      <!-- 左侧：批次管理列表 -->
      <el-col :span="14">
        <el-card class="left-card">
          <template #header>
            <div class="card-header">
              <span>批次管理</span>
              <el-button type="primary" :icon="Refresh" @click="loadBatches">刷新</el-button>
            </div>
          </template>

          <!-- 筛选栏 -->
          <el-form :model="filters" inline class="filter-form">
            <el-form-item label="批次号">
              <el-input v-model="filters.batchNo" placeholder="模糊搜索批次号" clearable />
            </el-form-item>
            <el-form-item label="成品名称">
              <el-input v-model="filters.productName" placeholder="模糊搜索成品名称" clearable />
            </el-form-item>
            <el-form-item label="中游企业">
              <el-input v-model="filters.supplier" placeholder="模糊搜索供应企业" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table
            v-loading="loading"
            :data="batchList"
            stripe
            border
            style="width: 100%"
            highlight-current-row
            @current-change="handleSelectBatch"
          >
            <el-table-column prop="batchNo" label="成品批次号" width="160" />
            <el-table-column prop="productName" label="成品名称" width="120" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="supplier" label="中游供应企业" width="150" />
            <el-table-column prop="quantity" label="数量" width="110">
              <template #default="{ row }">{{ row.quantity }} kg</template>
            </el-table-column>
            <el-table-column prop="receiveTime" label="入库时间" width="170" />
            <el-table-column prop="qualityStatus" label="质检状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getQualityTagType(row.qualityStatus)">
                  {{ getQualityStatusName(row.qualityStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="traceCodeStatus" label="溯源码状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getTraceStatusTagType(row.traceCodeStatus)">
                  {{ getTraceStatusName(row.traceCodeStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="blockchainStatus" label="上链状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getBlockchainStatusTagType(row.blockchainStatus)">
                  {{ getBlockchainStatusName(row.blockchainStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="170" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleGenerate(row)">生成二维码</el-button>
                <el-button type="info" link @click="handleViewBatchDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：二维码生成区 -->
      <el-col :span="10">
        <el-card class="right-card">
          <template #header>
            <span>批次操作</span>
          </template>

          <el-empty v-if="!selectedBatch" description="请选择左侧一个批次"></el-empty>

          <el-tabs v-else v-model="activeTab" class="batch-tabs">
            <!-- 二维码生成标签页 -->
            <el-tab-pane label="二维码生成" name="qrcode">
              <div class="qr-panel">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="批次号">{{ selectedBatch.batchNo }}</el-descriptions-item>
              <el-descriptions-item label="成品名称">{{ selectedBatch.productName }}</el-descriptions-item>
              <el-descriptions-item label="溯源码状态">{{ getTraceStatusName(selectedBatch.traceCodeStatus) }}</el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <el-form :model="generateForm" label-width="110px">
              <el-form-item label="生成方式">
                <el-radio-group v-model="generateForm.type">
                  <el-radio label="batch">按批次</el-radio>
                  <el-radio label="item">按单品</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生成数量">
                <el-input-number v-model="generateForm.count" :min="1" :max="500" style="width: 100%" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="generating" @click="handleGenerateSubmit">
                  一键生成
                </el-button>
                <el-button :disabled="qrCodes.length === 0" @click="handleDownloadAll">批量下载</el-button>
                <el-button :disabled="qrCodes.length === 0" @click="handlePrint">打印</el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <div v-if="qrCodes.length > 0" class="qr-preview">
              <div class="preview-header">
                <span>二维码预览（前 6 个）</span>
              </div>
              <div class="qr-grid">
                <div v-for="item in qrCodes.slice(0, 6)" :key="item.id" class="qr-item">
                  <img :src="item.qrCodeUrl" :alt="item.traceId" />
                  <div class="qr-meta">
                    <div class="trace-id">{{ item.traceId }}</div>
                    <el-button type="primary" link @click="handleDownloadOne(item)">下载</el-button>
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="records">
              <div class="records-header">
                <span>生成记录</span>
              </div>
              <el-table :data="records" size="small" border>
                <el-table-column prop="batchNo" label="批次号" width="160" />
                <el-table-column prop="generatedAt" label="生成时间" width="170" />
                <el-table-column prop="count" label="数量" width="80" />
                <el-table-column prop="operator" label="操作人" width="100" />
              </el-table>
            </div>
              </div>
            </el-tab-pane>

            <!-- 上链日志标签页 -->
            <el-tab-pane label="上链日志" name="blockchain">
              <div class="blockchain-log">
                <el-descriptions :column="1" border style="margin-bottom: 20px;">
                  <el-descriptions-item label="上链状态">
                    <el-tag :type="getBlockchainStatusTagType(selectedBatch.blockchainStatus)">
                      {{ getBlockchainStatusName(selectedBatch.blockchainStatus) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="区块链哈希" v-if="selectedBatch.blockchainHash">
                    <el-input
                      :value="selectedBatch.blockchainHash"
                      readonly
                      style="width: 100%;"
                    >
                      <template #append>
                        <el-button @click="copyHash(selectedBatch.blockchainHash)">复制</el-button>
                      </template>
                    </el-input>
                  </el-descriptions-item>
                </el-descriptions>

                <el-divider />

                <div class="log-header">
                  <span>上链记录</span>
                  <el-button type="primary" size="small" @click="loadBlockchainLogs">刷新</el-button>
                </div>
                <el-table :data="blockchainLogs" size="small" border style="margin-top: 10px;">
                  <el-table-column prop="onChainTime" label="上链时间" width="180" />
                  <el-table-column prop="blockHeight" label="区块高度" width="120" />
                  <el-table-column prop="transactionHash" label="交易哈希" min-width="200">
                    <template #default="{ row }">
                      <span class="hash-text">{{ row.transactionHash }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getBlockchainStatusTagType(row.status)" size="small">
                        {{ getBlockchainStatusName(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 批次详情弹窗 -->
    <el-dialog v-model="detailVisible" title="批次详情" width="800px">
      <el-timeline v-if="batchDetail">
        <el-timeline-item timestamp="上游原料" placement="top">
          <el-card>
            <h4>{{ batchDetail.upstream?.enterpriseName }}</h4>
            <p>原料名称：{{ batchDetail.upstream?.materialName }}</p>
            <p>批次号：{{ batchDetail.upstream?.batchNo }}</p>
            <p>数量：{{ batchDetail.upstream?.quantity }} kg</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="中游生产" placement="top">
          <el-card>
            <h4>{{ batchDetail.midstream?.enterpriseName }}</h4>
            <p>成品名称：{{ batchDetail.midstream?.productName }}</p>
            <p>批次号：{{ batchDetail.midstream?.batchNo }}</p>
            <p>数量：{{ batchDetail.midstream?.quantity }} kg</p>
            <p>生产时间：{{ batchDetail.midstream?.productionTime }}</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="下游接收" placement="top">
          <el-card>
            <h4>{{ batchDetail.downstream?.enterpriseName }}</h4>
            <p>接收时间：{{ batchDetail.downstream?.receiveTime }}</p>
            <p>数量：{{ batchDetail.downstream?.quantity }} kg</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getBatchList, generateQRCode, getBatchDetail, getCurrentEnterprise } from '@/utils/api'

const loading = ref(false)
const generating = ref(false)
const batchList = ref([])
const selectedBatch = ref(null)
const qrCodes = ref([])
const records = ref([])
const activeTab = ref('qrcode')
const blockchainLogs = ref([])

const detailVisible = ref(false)
const batchDetail = ref(null)

const filters = ref({
  batchNo: '',
  productName: '',
  supplier: ''
})

const generateForm = ref({
  type: 'batch',
  count: 20
})

const getQualityStatusName = (status) => {
  const map = { qualified: '合格', unqualified: '不合格', pending: '待检' }
  return map[status] || status
}

const getQualityTagType = (status) => {
  const map = { qualified: 'success', unqualified: 'danger', pending: 'warning' }
  return map[status] || ''
}

const getTraceStatusName = (status) => {
  const map = { not_generated: '未生成', generated: '已生成', partial: '部分生成' }
  return map[status] || status
}

const getTraceStatusTagType = (status) => {
  const map = { not_generated: 'info', generated: 'success', partial: 'warning' }
  return map[status] || ''
}

const getBlockchainStatusName = (status) => {
  const map = {
    not_on_chain: '未上链',
    processing: '上链中',
    success: '已上链',
    failed: '上链失败'
  }
  return map[status] || status
}

const getBlockchainStatusTagType = (status) => {
  const map = {
    not_on_chain: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status] || ''
}

const loadBlockchainLogs = async () => {
  if (!selectedBatch.value) return
  try {
    // 模拟获取上链日志
    blockchainLogs.value = [
      {
        onChainTime: '2024-01-15 10:30:00',
        blockHeight: 1234567,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'success'
      }
    ]
  } catch (error) {
    ElMessage.error('加载上链日志失败')
  }
}

const copyHash = (hash) => {
  navigator.clipboard.writeText(hash).then(() => {
    ElMessage.success('哈希值已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const loadBatches = async () => {
  loading.value = true
  try {
    const list = await getBatchList(filters.value)
    // 为每个批次添加上链状态（模拟数据）
    batchList.value = list.map(item => ({
      ...item,
      blockchainStatus: item.blockchainStatus || 'not_on_chain',
      blockchainHash: item.blockchainHash || ''
    }))
  } catch (e) {
    ElMessage.error('加载批次列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => loadBatches()

const handleReset = () => {
  filters.value = { batchNo: '', productName: '', supplier: '' }
  loadBatches()
}

const handleSelectBatch = (row) => {
  selectedBatch.value = row || null
  qrCodes.value = []
  if (row) {
    loadBlockchainLogs()
  }
}

const handleGenerate = (row) => {
  selectedBatch.value = row
  qrCodes.value = []
}

const handleGenerateSubmit = async () => {
  if (!selectedBatch.value) return
  generating.value = true
  try {
    const res = await generateQRCode(selectedBatch.value.batchNo, generateForm.value.count, generateForm.value.type)
    if (res?.success) {
      qrCodes.value = res.qrCodes || []
      records.value.unshift({
        batchNo: selectedBatch.value.batchNo,
        generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        count: generateForm.value.count,
        operator: '当前用户'
      })
      ElMessage.success('二维码生成成功')
    } else {
      ElMessage.error('二维码生成失败')
    }
  } catch (e) {
    ElMessage.error('二维码生成失败')
  } finally {
    generating.value = false
  }
}

const downloadByUrl = async (url, filename) => {
  // 用 fetch + blob 确保跨域/下载行为更可控（mock url 也可用）
  const resp = await fetch(url)
  const blob = await resp.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

const handleDownloadOne = async (item) => {
  try {
    await downloadByUrl(item.qrCodeUrl, `${item.batchNo}-${item.traceId}.png`)
  } catch (e) {
    ElMessage.error('下载失败')
  }
}

const handleDownloadAll = async () => {
  if (qrCodes.value.length === 0) return
  // 简化：逐个下载（真实项目建议后端打包 zip）
  for (const item of qrCodes.value.slice(0, 20)) {
    // 避免一次性触发太多下载，先限制前 20 个
    // eslint-disable-next-line no-await-in-loop
    await handleDownloadOne(item)
  }
  ElMessage.success('已触发下载（最多20个示例）')
}

const handlePrint = () => {
  ElMessage.info('打印接口对接中（示例版先提示）')
}

const handleViewBatchDetail = async (row) => {
  try {
    const detail = await getBatchDetail(row.batchNo)
    batchDetail.value = detail
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('加载批次详情失败')
  }
}

onMounted(async () => {
  const info = await getCurrentEnterprise()
  if (info.type !== 'downstream') {
    ElMessage.warning('该页面为下游企业专属功能')
  }
  await loadBatches()
})
</script>

<style scoped>
.batch-management {
  padding: 0;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 10px;
}

.qr-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-preview .qr-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.qr-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.qr-item img {
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.qr-meta {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.trace-id {
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.records-header {
  font-weight: 500;
  margin-bottom: 8px;
}

.batch-tabs {
  margin-top: 10px;
}

.blockchain-log {
  padding: 10px 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  margin-bottom: 10px;
}

.hash-text {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
