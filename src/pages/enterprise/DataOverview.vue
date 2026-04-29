<template>
  <div class="data-overview">
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="企业类型">
          <el-select v-model="filters.enterpriseType" placeholder="全部" clearable>
            <el-option label="上游" value="upstream" />
            <el-option label="中游" value="midstream" />
            <el-option label="下游" value="downstream" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="filters.batchNo" placeholder="请输入批次号" clearable />
        </el-form-item>
        <el-form-item label="原料/成品名称">
          <el-input v-model="filters.materialName" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="质检状态">
          <el-select v-model="filters.qualityStatus" placeholder="全部" clearable>
            <el-option label="合格" value="qualified" />
            <el-option label="不合格" value="unqualified" />
            <el-option label="待检" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 快捷筛选栏 -->
    <el-card class="quick-filter-card">
      <el-radio-group v-model="quickFilter" @change="handleQuickFilter">
        <el-radio-button label="today">今日</el-radio-button>
        <el-radio-button label="week">近7天</el-radio-button>
        <el-radio-button label="month">近30天</el-radio-button>
      </el-radio-group>
      <div class="refresh-controls">
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="handleAutoRefresh"
        />
        <el-select v-if="autoRefresh" v-model="refreshInterval" style="width: 120px; margin-left: 10px;">
          <el-option label="5分钟" :value="5" />
          <el-option label="10分钟" :value="10" />
          <el-option label="30分钟" :value="30" />
        </el-select>
        <el-button type="primary" :icon="Refresh" @click="handleRefresh" style="margin-left: 10px;">
          手动刷新
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>数据总览</span>
          <el-button type="primary" :icon="Download" @click="handleExport">
            导出数据
          </el-button>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="stage" label="环节" width="100">
          <template #default="{ row }">
            <el-tag :type="getStageTagType(row.stage)">
              {{ getStageName(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="企业名称" width="180" />
        <el-table-column prop="materialName" label="原料/成品名称" width="150" />
        <el-table-column prop="batchNo" label="批次号" width="150" />
        <el-table-column prop="quantity" label="数量" width="120" sortable="custom">
          <template #default="{ row }">
            {{ row.quantity }} kg
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ row.reportTime || row.productionTime || row.receiveTime }}
          </template>
        </el-table-column>
        <el-table-column prop="responsible" label="负责人" width="120" />
        <el-table-column prop="qualityStatus" label="质检状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getQualityTagType(row.qualityStatus)">
              {{ getQualityStatusName(row.qualityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="数据详情" width="800px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="环节">{{ getStageName(detailData.stage) }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
        <el-descriptions-item label="原料/成品名称">{{ detailData.materialName || detailData.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ detailData.batchNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detailData.quantity || 0 }} kg</el-descriptions-item>
        <el-descriptions-item label="时间">
          {{ detailData.reportTime || detailData.productionTime || detailData.receiveTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detailData.responsible || '-' }}</el-descriptions-item>
        <el-descriptions-item label="质检状态">
          <el-tag :type="getQualityTagType(detailData.qualityStatus)">
            {{ getQualityStatusName(detailData.qualityStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="质检报告" :span="2" v-if="detailData.qualityReport">
          <el-link :href="detailData.qualityReport" target="_blank">查看报告</el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { getDataOverview, exportData } from '@/utils/api'

const loading = ref(false)
const tableData = ref([])
const filters = ref({
  dateRange: null,
  enterpriseType: '',
  batchNo: '',
  materialName: '',
  qualityStatus: ''
})
const quickFilter = ref('today')
const autoRefresh = ref(false)
const refreshInterval = ref(5)
let refreshTimer = null

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const detailVisible = ref(false)
const detailData = ref(null)

const getStageName = (stage) => {
  const map = {
    upstream: '上游',
    midstream: '中游',
    downstream: '下游'
  }
  return map[stage] || stage
}

const getStageTagType = (stage) => {
  const map = {
    upstream: 'success',
    midstream: 'warning',
    downstream: 'info'
  }
  return map[stage] || ''
}

const getQualityStatusName = (status) => {
  const map = {
    qualified: '合格',
    unqualified: '不合格',
    pending: '待检'
  }
  return map[status] || status
}

const getQualityTagType = (status) => {
  const map = {
    qualified: 'success',
    unqualified: 'danger',
    pending: 'warning'
  }
  return map[status] || ''
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await getDataOverview({
      ...filters.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })
    tableData.value = result.list
    pagination.value.total = result.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const handleReset = () => {
  filters.value = {
    dateRange: null,
    enterpriseType: '',
    batchNo: '',
    materialName: '',
    qualityStatus: ''
  }
  quickFilter.value = 'today'
  handleSearch()
}

const handleQuickFilter = (value) => {
  const today = new Date()
  const startDate = new Date()
  
  if (value === 'today') {
    filters.value.dateRange = [
      today.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ]
  } else if (value === 'week') {
    startDate.setDate(today.getDate() - 7)
    filters.value.dateRange = [
      startDate.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ]
  } else if (value === 'month') {
    startDate.setDate(today.getDate() - 30)
    filters.value.dateRange = [
      startDate.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ]
  }
  handleSearch()
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

const handleAutoRefresh = (value) => {
  if (value) {
    refreshTimer = setInterval(() => {
      loadData()
    }, refreshInterval.value * 60 * 1000)
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
}

const handleSortChange = ({ prop, order }) => {
  // 处理排序
  ElMessage.info(`按 ${prop} ${order === 'ascending' ? '升序' : '降序'} 排序`)
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleViewDetail = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const handleExport = async () => {
  try {
    const result = await exportData(filters.value, 'xlsx')
    ElMessage.success('导出成功')
    // 实际项目中应该下载文件
    window.open(result.url)
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  handleQuickFilter('today')
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.data-overview {
  padding: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.quick-filter-card {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-controls {
  display: flex;
  align-items: center;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
