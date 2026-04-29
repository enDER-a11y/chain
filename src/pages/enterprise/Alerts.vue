<template>
  <div class="alerts-page">
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :model="filters" inline>
        <el-form-item label="预警类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <!-- 上游企业预警类型 -->
            <template v-if="enterpriseType === 'upstream'">
              <el-option label="原料质检不合格" value="material_quality" />
              <el-option label="原料延迟送达" value="material_delay" />
              <el-option label="库存不足" value="inventory_shortage" />
            </template>
            <!-- 中游企业预警类型 -->
            <template v-else-if="enterpriseType === 'midstream'">
              <el-option label="原料供应不足" value="material_shortage" />
              <el-option label="原料质检不合格" value="material_quality" />
              <el-option label="生产计划未完成" value="production_incomplete" />
              <el-option label="生产延迟" value="production_delay" />
              <el-option label="成品质检不合格" value="product_quality" />
              <el-option label="库存不足" value="inventory_shortage" />
            </template>
            <!-- 下游企业预警类型 -->
            <template v-else-if="enterpriseType === 'downstream'">
              <el-option label="原料延迟送达" value="material_delay" />
              <el-option label="成品质检不合格" value="product_quality" />
              <el-option label="库存不足" value="inventory_shortage" />
              <el-option label="库存积压" value="inventory_excess" />
              <el-option label="批次号录入错误" value="trace_error" />
              <el-option label="溯源码生成失败" value="qrcode_fail" />
            </template>
            <!-- 默认显示全部（兼容） -->
            <template v-else>
              <el-option label="原料供应不足" value="material_shortage" />
              <el-option label="原料质检不合格" value="material_quality" />
              <el-option label="原料延迟送达" value="material_delay" />
              <el-option label="生产计划未完成" value="production_incomplete" />
              <el-option label="生产延迟" value="production_delay" />
              <el-option label="成品质检不合格" value="product_quality" />
              <el-option label="库存不足" value="inventory_shortage" />
              <el-option label="库存积压" value="inventory_excess" />
              <el-option label="批次号录入错误" value="trace_error" />
              <el-option label="溯源码生成失败" value="qrcode_fail" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="filters.level" placeholder="全部" clearable>
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <!-- 预警列表 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预警列表</span>
              <el-badge :value="unprocessedCount" class="badge" />
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="alertList"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="id" label="预警ID" width="100" />
            <el-table-column prop="title" label="预警类型" width="150" />
            <el-table-column prop="level" label="紧急程度" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.level)">
                  {{ getLevelName(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="enterprise" label="涉及企业" width="150" />
            <el-table-column prop="batchNo" label="批次号" width="150" />
            <el-table-column prop="alertTime" label="预警时间" width="180" />
            <el-table-column prop="status" label="处理状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleView(row)">查看</el-button>
                <el-button
                  v-if="row.status !== 'completed'"
                  type="warning"
                  link
                  @click="handleProcess(row)"
                >
                  处理
                </el-button>
                <el-button type="info" link @click="handleRemark(row)">备注</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 预警统计 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>预警统计</span>
          </template>
          <div ref="statChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>

        <el-card style="margin-top: 20px;">
          <template #header>
            <span>处理率统计</span>
          </template>
          <div ref="processRateChartRef" style="width: 100%; height: 250px;"></div>
        </el-card>

        <el-card style="margin-top: 20px;">
          <template #header>
            <span>未处理预警TOP3</span>
          </template>
          <el-table :data="topAlerts" size="small" border>
            <el-table-column prop="enterprise" label="企业" />
            <el-table-column prop="count" label="数量" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 处理弹窗 -->
    <el-dialog v-model="processVisible" title="处理预警" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="预警类型">
          <span>{{ processForm.title }}</span>
        </el-form-item>
        <el-form-item label="处理方案" required>
          <el-input
            v-model="processForm.solution"
            type="textarea"
            :rows="4"
            placeholder="请输入处理方案"
          />
        </el-form-item>
        <el-form-item label="处理人" required>
          <el-input v-model="processForm.processor" placeholder="请输入处理人" />
        </el-form-item>
        <el-form-item label="处理时间" required>
          <el-date-picker
            v-model="processForm.processTime"
            type="datetime"
            placeholder="选择处理时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="预警详情" width="700px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="预警ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="预警类型">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getLevelTagType(detailData.level)">
            {{ getLevelName(detailData.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusTagType(detailData.status)">
            {{ getStatusName(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="涉及企业">{{ detailData.enterprise }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ detailData.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="预警时间">{{ detailData.alertTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getAlerts, handleAlert, getCurrentEnterprise } from '@/utils/api'

const loading = ref(false)
const alertList = ref([])
const unprocessedCount = ref(0)
const enterpriseType = ref('')
const filters = ref({
  type: '',
  level: '',
  status: '',
  dateRange: null
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const statChartRef = ref(null)
const processRateChartRef = ref(null)
let statChart = null
let processRateChart = null

const topAlerts = ref([])

const processVisible = ref(false)
const processForm = ref({
  id: '',
  title: '',
  solution: '',
  processor: '',
  processTime: ''
})

const detailVisible = ref(false)
const detailData = ref(null)

const getLevelName = (level) => {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[level] || level
}

const getLevelTagType = (level) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[level] || ''
}

const getStatusName = (status) => {
  const map = {
    pending: '未处理',
    processing: '处理中',
    completed: '已完成'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'danger',
    processing: 'warning',
    completed: 'success'
  }
  return map[status] || ''
}

const loadData = async () => {
  loading.value = true
  try {
    const alerts = await getAlerts(filters.value, enterpriseType.value)
    alertList.value = alerts
    pagination.value.total = alerts.length
    unprocessedCount.value = alerts.filter(a => a.status === 'pending').length
    
    // 计算TOP3
    const enterpriseCount = {}
    alerts.filter(a => a.status === 'pending').forEach(a => {
      enterpriseCount[a.enterprise] = (enterpriseCount[a.enterprise] || 0) + 1
    })
    topAlerts.value = Object.entries(enterpriseCount)
      .map(([enterprise, count]) => ({ enterprise, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    
    await nextTick()
    renderCharts(alerts)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const renderCharts = (alerts) => {
  // 预警类型分布
  if (statChartRef.value && !statChart) {
    statChart = echarts.init(statChartRef.value)
  }
  if (statChart) {
    const typeCount = {}
    alerts.forEach(a => {
      typeCount[a.title] = (typeCount[a.title] || 0) + 1
    })
    
    statChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: Object.entries(typeCount).map(([name, value]) => ({ name, value }))
        }
      ]
    })
  }

  // 处理率统计
  if (processRateChartRef.value && !processRateChart) {
    processRateChart = echarts.init(processRateChartRef.value)
  }
  if (processRateChart) {
    const total = alerts.length
    const completed = alerts.filter(a => a.status === 'completed').length
    const processing = alerts.filter(a => a.status === 'processing').length
    const pending = alerts.filter(a => a.status === 'pending').length
    
    processRateChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['已完成', '处理中', '未处理']
      },
      yAxis: {
        type: 'value',
        max: total
      },
      series: [
        {
          data: [completed, processing, pending],
          type: 'bar',
          itemStyle: {
            color: function(params) {
              const colors = ['#67c23a', '#e6a23c', '#f56c6c']
              return colors[params.dataIndex]
            }
          }
        }
      ]
    })
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const handleReset = () => {
  filters.value = {
    type: '',
    level: '',
    status: '',
    dateRange: null
  }
  handleSearch()
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleView = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const handleProcess = (row) => {
  processForm.value = {
    id: row.id,
    title: row.title,
    solution: '',
    processor: '',
    processTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  processVisible.value = true
}

const handleSubmitProcess = async () => {
  if (!processForm.value.solution || !processForm.value.processor || !processForm.value.processTime) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  try {
    await handleAlert(processForm.value.id, processForm.value.solution)
    ElMessage.success('处理成功')
    processVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

const handleRemark = (row) => {
  ElMessage.info('备注功能开发中')
}

onMounted(async () => {
  const info = await getCurrentEnterprise()
  enterpriseType.value = info.type
  await loadData()
})
</script>

<style scoped>
.alerts-page {
  padding: 0;
  min-height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  margin-left: auto;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
