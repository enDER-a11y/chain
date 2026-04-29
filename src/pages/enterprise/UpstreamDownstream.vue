<template>
  <div class="upstream-downstream">
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
        <el-form-item label="批次号">
          <el-input v-model="filters.batchNo" placeholder="请输入批次号" clearable />
        </el-form-item>
        <el-form-item label="原料/成品名称">
          <el-input v-model="filters.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标签切换 -->
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 上游数据（仅中游和下游显示） -->
        <el-tab-pane
          v-if="showUpstream"
          label="上游数据"
          name="upstream"
        >
          <template #label>
            <span>上游数据 <el-badge :value="upstreamData.length" class="badge" /></span>
          </template>
          
          <!-- 中游专属：生产决策计算 -->
          <div v-if="enterpriseType === 'midstream'" class="production-decision">
            <el-card>
              <template #header>
                <span>生产决策计算</span>
              </template>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-statistic title="上游原料供应量" :value="productionData.upstreamSupply" suffix="kg" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="最大可生产量" :value="productionData.maxProduction" suffix="kg" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="系统建议生产量" :value="productionData.suggestedProduction" suffix="kg">
                    <template #suffix>
                      <el-input-number
                        v-model="productionData.suggestedProduction"
                        :min="0"
                        :max="productionData.maxProduction"
                        size="small"
                        style="width: 100px; margin-left: 10px;"
                      />
                    </template>
                  </el-statistic>
                </el-col>
              </el-row>
              <el-button type="primary" style="margin-top: 15px;" @click="handleCalculateProduction">
                重新计算
              </el-button>
            </el-card>

            <!-- 供需预测模块 -->
            <el-card style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>供需预测分析</span>
                  <el-button type="primary" size="small" @click="handleGenerateDispatchSuggestion">
                    生成调配建议
                  </el-button>
                </div>
              </template>
              
              <el-form :model="supplyDemandFilters" inline style="margin-bottom: 15px;">
                <el-form-item label="合作企业">
                  <el-select v-model="supplyDemandFilters.partnerEnterprise" placeholder="全部" clearable style="width: 150px;">
                    <el-option
                      v-for="enterprise in upstreamData"
                      :key="enterprise.id"
                      :label="enterprise.enterpriseName"
                      :value="enterprise.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="预测周期">
                  <el-select v-model="supplyDemandFilters.period" style="width: 120px;">
                    <el-option label="1个月" value="1" />
                    <el-option label="2个月" value="2" />
                    <el-option label="3个月" value="3" />
                  </el-select>
                </el-form-item>
              </el-form>

              <div ref="supplyDemandChartRef" style="width: 100%; height: 350px;"></div>
            </el-card>
          </div>

          <el-table
            v-loading="loading"
            :data="upstreamData"
            stripe
            border
            style="width: 100%; margin-top: 20px;"
          >
            <el-table-column prop="enterpriseName" label="企业名称" width="180" />
            <el-table-column prop="materialName" label="原料名称" width="150" />
            <el-table-column prop="batchNo" label="批次号" width="150">
              <template #default="{ row }">
                <el-link type="primary" @click="handleViewTrace(row.batchNo)">
                  {{ row.batchNo }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="supply"
              label="供应量"
              width="120"
            >
              <template #default="{ row }">
                {{ row.supply }} kg
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="stabilityRate"
              label="供货稳定率"
              width="120"
            >
              <template #default="{ row }">
                {{ row.stabilityRate }}%
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="qualityStatus"
              label="质检状态"
              width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getQualityTagType(row.qualityStatus)">
                  {{ getQualityStatusName(row.qualityStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'downstream'"
              prop="productName"
              label="成品名称"
              width="150"
            />
            <el-table-column
              v-if="enterpriseType === 'downstream'"
              prop="productionQuantity"
              label="生产数量"
              width="120"
            >
              <template #default="{ row }">
                {{ row.productionQuantity }} kg
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'downstream'"
              prop="qualityStatus"
              label="质检状态"
              width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getQualityTagType(row.qualityStatus)">
                  {{ getQualityStatusName(row.qualityStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'downstream'"
              prop="planArrivalTime"
              label="计划到货时间"
              width="180"
            />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleViewDetail(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 下游数据（仅上游和中游显示） -->
        <el-tab-pane
          v-if="showDownstream"
          label="下游数据"
          name="downstream"
        >
          <template #label>
            <span>下游数据 <el-badge :value="downstreamData.length" class="badge" /></span>
          </template>

          <el-table
            v-loading="loading"
            :data="downstreamData"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="enterpriseName" label="企业名称" width="180" />
            <el-table-column
              v-if="enterpriseType === 'upstream'"
              prop="materialReceive"
              label="原料接收量"
              width="120"
            >
              <template #default="{ row }">
                {{ row.materialReceive }} kg
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'upstream'"
              prop="pendingReceive"
              label="未接收量"
              width="120"
            >
              <template #default="{ row }">
                {{ row.pendingReceive }} kg
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'upstream'"
              prop="planProductionTime"
              label="计划生产时间"
              width="180"
            />
            <el-table-column
              v-if="enterpriseType === 'upstream'"
              prop="responsible"
              label="负责人"
              width="120"
            />
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="productPendingReceive"
              label="成品待接收量"
              width="150"
            >
              <template #default="{ row }">
                {{ row.productPendingReceive }} kg
              </template>
            </el-table-column>
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="planPickupTime"
              label="计划提货时间"
              width="180"
            />
            <el-table-column
              v-if="enterpriseType === 'midstream'"
              prop="logisticsArrangement"
              label="物流安排"
              width="150"
            />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleViewDetail(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 导出按钮 -->
      <div class="export-actions">
        <el-button type="primary" :icon="Download" @click="handleExport">
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="数据详情" width="700px">
      <el-descriptions :column="2" border v-if="detailData">
        <!-- 上游数据详情（中游和下游查看） -->
        <template v-if="activeTab === 'upstream'">
          <el-descriptions-item label="企业名称">{{ detailData.enterpriseName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="原料名称">{{ detailData.materialName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ detailData.batchNo || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="供应量">
            {{ detailData.supply ? detailData.supply + ' kg' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="供货稳定率">
            {{ detailData.stabilityRate ? detailData.stabilityRate + '%' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="质检状态">
            <el-tag :type="getQualityTagType(detailData.qualityStatus)">
              {{ getQualityStatusName(detailData.qualityStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'downstream'" label="成品名称">
            {{ detailData.productName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'downstream'" label="生产数量">
            {{ detailData.productionQuantity ? detailData.productionQuantity + ' kg' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'downstream'" label="质检状态">
            <el-tag :type="getQualityTagType(detailData.qualityStatus)">
              {{ getQualityStatusName(detailData.qualityStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'downstream'" label="计划到货时间">
            {{ detailData.planArrivalTime || '-' }}
          </el-descriptions-item>
        </template>
        
        <!-- 下游数据详情（上游和中游查看） -->
        <template v-else-if="activeTab === 'downstream'">
          <el-descriptions-item label="企业名称">{{ detailData.enterpriseName || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'upstream'" label="原料接收量">
            {{ detailData.materialReceive ? detailData.materialReceive + ' kg' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'upstream'" label="未接收量">
            {{ detailData.pendingReceive ? detailData.pendingReceive + ' kg' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'upstream'" label="计划生产时间">
            {{ detailData.planProductionTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'upstream'" label="负责人">
            {{ detailData.responsible || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="成品待接收量">
            {{ detailData.productPendingReceive ? detailData.productPendingReceive + ' kg' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="计划提货时间">
            {{ detailData.planPickupTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="enterpriseType === 'midstream'" label="物流安排">
            {{ detailData.logisticsArrangement || '-' }}
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </el-dialog>

    <!-- 溯源详情弹窗 -->
    <el-dialog v-model="traceVisible" title="溯源详情" width="800px">
      <el-timeline v-if="traceData">
        <el-timeline-item timestamp="上游环节" placement="top">
          <el-card>
            <h4>{{ traceData.upstream?.enterpriseName }}</h4>
            <p>原料名称：{{ traceData.upstream?.materialName }}</p>
            <p>批次号：{{ traceData.upstream?.batchNo }}</p>
            <p>数量：{{ traceData.upstream?.quantity }} kg</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="中游环节" placement="top">
          <el-card>
            <h4>{{ traceData.midstream?.enterpriseName }}</h4>
            <p>成品名称：{{ traceData.midstream?.productName }}</p>
            <p>批次号：{{ traceData.midstream?.batchNo }}</p>
            <p>数量：{{ traceData.midstream?.quantity }} kg</p>
            <p>生产时间：{{ traceData.midstream?.productionTime }}</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="下游环节" placement="top">
          <el-card>
            <h4>{{ traceData.downstream?.enterpriseName }}</h4>
            <p>接收时间：{{ traceData.downstream?.receiveTime }}</p>
            <p>数量：{{ traceData.downstream?.quantity }} kg</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { getCurrentEnterprise, getUpstreamDownstreamData, getBatchDetail, exportData } from '@/utils/api'

const enterpriseType = ref('')
const activeTab = ref('upstream')
const loading = ref(false)
const filters = ref({
  dateRange: null,
  batchNo: '',
  name: ''
})

const upstreamData = ref([])
const downstreamData = ref([])

const productionData = ref({
  upstreamSupply: 0,
  maxProduction: 0,
  suggestedProduction: 0
})

const detailVisible = ref(false)
const detailData = ref(null)

const traceVisible = ref(false)
const traceData = ref(null)

const supplyDemandChartRef = ref(null)
let supplyDemandChart = null
const supplyDemandFilters = ref({
  partnerEnterprise: '',
  period: '3'
})

const showUpstream = computed(() => {
  return enterpriseType.value === 'midstream' || enterpriseType.value === 'downstream'
})

const showDownstream = computed(() => {
  return enterpriseType.value === 'upstream' || enterpriseType.value === 'midstream'
})

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
    const result = await getUpstreamDownstreamData(enterpriseType.value, activeTab.value)
    
    if (activeTab.value === 'upstream') {
      upstreamData.value = result.upstream || []
      // 如果是中游，计算生产决策数据
      if (enterpriseType.value === 'midstream') {
        const totalSupply = upstreamData.value.reduce((sum, item) => sum + (item.supply || 0), 0)
        productionData.value = {
          upstreamSupply: totalSupply,
          maxProduction: Math.floor(totalSupply * 0.9),
          suggestedProduction: Math.floor(totalSupply * 0.8)
        }
      }
    } else {
      downstreamData.value = result.downstream || []
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  loadData()
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  filters.value = {
    dateRange: null,
    batchNo: '',
    name: ''
  }
  handleSearch()
}

const handleCalculateProduction = async () => {
  ElMessage.info('重新计算生产量')
  // 这里可以调用后端算法接口
  loadData()
}

const loadSupplyDemandChart = async () => {
  if (!supplyDemandChartRef.value || enterpriseType.value !== 'midstream') return
  
  await nextTick()
  if (!supplyDemandChart) {
    supplyDemandChart = echarts.init(supplyDemandChartRef.value)
  }
  
  const period = parseInt(supplyDemandFilters.value.period)
  const months = Array.from({ length: period }, (_, i) => `${i + 1}月后`)
  
  supplyDemandChart.setOption({
    title: {
      text: '供需缺口预测',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['供应量', '需求量', '缺口'],
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '数量(kg)'
    },
    series: [
      {
        name: '供应量',
        type: 'line',
        data: months.map(() => Math.floor(Math.random() * 2000) + 2000),
        smooth: true
      },
      {
        name: '需求量',
        type: 'line',
        data: months.map(() => Math.floor(Math.random() * 2000) + 2000),
        smooth: true
      },
      {
        name: '缺口',
        type: 'bar',
        data: months.map(() => Math.floor(Math.random() * 500) - 250),
        itemStyle: {
          color: function(params) {
            return params.value > 0 ? '#f56c6c' : '#67c23a'
          }
        }
      }
    ]
  })
}

const handleGenerateDispatchSuggestion = () => {
  ElMessage.success('调配建议已生成，请查看详情')
}

const handleViewDetail = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const handleViewTrace = async (batchNo) => {
  try {
    const data = await getBatchDetail(batchNo)
    traceData.value = data
    traceVisible.value = true
  } catch (error) {
    ElMessage.error('加载溯源数据失败')
  }
}

const handleExport = async () => {
  try {
    const result = await exportData(filters.value, 'xlsx')
    ElMessage.success('导出成功')
    window.open(result.url)
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

onMounted(async () => {
  const info = await getCurrentEnterprise()
  enterpriseType.value = info.type
  
  // 根据企业类型设置默认标签
  if (enterpriseType.value === 'upstream') {
    activeTab.value = 'downstream'
  } else if (enterpriseType.value === 'downstream') {
    activeTab.value = 'upstream'
  } else {
    activeTab.value = 'upstream'
  }
  
  await loadData()
  await loadSupplyDemandChart()
})
</script>

<style scoped>
.upstream-downstream {
  padding: 0;
  min-height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.badge {
  margin-left: 5px;
}

.production-decision {
  margin-bottom: 20px;
}

.export-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
