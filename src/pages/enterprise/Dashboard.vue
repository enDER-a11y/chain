<template>
  <div class="dashboard">
    <!-- 预警提示栏 -->
    <el-alert
      v-if="urgentAlerts.length > 0"
      :title="`有 ${urgentAlerts.length} 条紧急预警待处理`"
      type="error"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
      @click="$router.push('/enterprise/alerts')"
    >
      <template #default>
        <div class="alert-list">
          <span
            v-for="alert in urgentAlerts.slice(0, 3)"
            :key="alert.id"
            class="alert-item"
            @click.stop="handleAlertClick(alert)"
          >
            {{ alert.title }}
          </span>
        </div>
      </template>
    </el-alert>

    <!-- 时间筛选 -->
    <el-card class="filter-card">
      <el-radio-group v-model="timeRange" @change="loadDashboardData">
        <el-radio-button label="day">今日</el-radio-button>
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 数据卡片 -->
    <div class="data-cards">
      <el-card
        v-for="(card, index) in dataCards"
        :key="index"
        class="data-card"
        shadow="hover"
      >
        <div class="card-content">
          <div class="card-icon" :style="{ background: card.color }">
            <el-icon :size="32"><component :is="card.icon" /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">{{ card.label }}</div>
            <div class="card-value">{{ formatNumber(card.value) }}{{ card.unit }}</div>
            <div v-if="card.trend" class="card-trend" :class="card.trend.type">
              <el-icon><ArrowUp v-if="card.trend.type === 'up'" /><ArrowDown v-else /></el-icon>
              {{ card.trend.value }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ chartTitles.main }}</span>
            </div>
          </template>
          <div ref="mainChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ chartTitles.secondary }}</span>
            </div>
          </template>
          <div ref="secondaryChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 饼图（如果有） -->
    <el-row v-if="pieChartData" :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ chartTitles.pie }}</span>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 供需预测模块 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>供需预测分析</span>
          <div>
            <el-button type="primary" size="small" @click="handleViewSuggestion">
              查看建议
            </el-button>
            <el-button type="success" size="small" @click="handleExportReport">
              导出报告
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 外部数据筛选 -->
      <el-form :model="supplyDemandFilters" inline style="margin-bottom: 15px;">
        <el-form-item label="预测周期">
          <el-select v-model="supplyDemandFilters.period" style="width: 120px;" @change="loadSupplyDemandData">
            <el-option label="1个月" value="1" />
            <el-option label="2个月" value="2" />
            <el-option label="3个月" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="季节因素">
          <el-select v-model="supplyDemandFilters.season" style="width: 120px;" @change="loadSupplyDemandData">
            <el-option label="春季" value="spring" />
            <el-option label="夏季" value="summer" />
            <el-option label="秋季" value="autumn" />
            <el-option label="冬季" value="winter" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域政策">
          <el-select v-model="supplyDemandFilters.policy" style="width: 150px;" @change="loadSupplyDemandData">
            <el-option label="无特殊政策" value="none" />
            <el-option label="环保限产" value="eco_limit" />
            <el-option label="补贴政策" value="subsidy" />
            <el-option label="出口限制" value="export_limit" />
          </el-select>
        </el-form-item>
        <el-form-item label="市场趋势">
          <el-select v-model="supplyDemandFilters.trend" style="width: 120px;" @change="loadSupplyDemandData">
            <el-option label="上升" value="up" />
            <el-option label="平稳" value="stable" />
            <el-option label="下降" value="down" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 供需缺口预测图 -->
      <div ref="supplyDemandChartRef" style="width: 100%; height: 400px;"></div>
    </el-card>

    <!-- 补货/清库存建议弹窗 -->
    <el-dialog v-model="suggestionVisible" title="智能调度建议" width="800px">
      <el-tabs v-model="suggestionTab">
        <el-tab-pane label="补货建议" name="replenish">
          <el-table :data="replenishSuggestions" border>
            <el-table-column prop="materialName" label="原料/成品名称" width="150" />
            <el-table-column prop="currentStock" label="当前库存" width="120">
              <template #default="{ row }">{{ row.currentStock }} kg</template>
            </el-table-column>
            <el-table-column prop="suggestedQuantity" label="建议补货量" width="120">
              <template #default="{ row }">{{ row.suggestedQuantity }} kg</template>
            </el-table-column>
            <el-table-column prop="suggestedTime" label="建议补货时间" width="180" />
            <el-table-column prop="reason" label="建议依据" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="清库存建议" name="clear">
          <el-table :data="clearSuggestions" border>
            <el-table-column prop="materialName" label="原料/成品名称" width="150" />
            <el-table-column prop="currentStock" label="当前库存" width="120">
              <template #default="{ row }">{{ row.currentStock }} kg</template>
            </el-table-column>
            <el-table-column prop="suggestedQuantity" label="建议清库存量" width="120">
              <template #default="{ row }">{{ row.suggestedQuantity }} kg</template>
            </el-table-column>
            <el-table-column prop="suggestedTime" label="建议清库存时间" width="180" />
            <el-table-column prop="reason" label="建议依据" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="suggestionVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportSuggestionReport">导出建议报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Box,
  TrendCharts,
  Document,
  Warning,
  CircleCheck,
  ShoppingCart,
  Van,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import { getCurrentEnterprise, getDashboardData, getChartData, getAlerts } from '@/utils/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const timeRange = ref('day')
const enterpriseInfo = ref({})
const dataCards = ref([])
const urgentAlerts = ref([])
const mainChartRef = ref(null)
const secondaryChartRef = ref(null)
const pieChartRef = ref(null)
const supplyDemandChartRef = ref(null)
let mainChart = null
let secondaryChart = null
let pieChart = null
let supplyDemandChart = null

const supplyDemandFilters = ref({
  period: '3',
  season: '',
  policy: 'none',
  trend: 'stable'
})

const suggestionVisible = ref(false)
const suggestionTab = ref('replenish')
const replenishSuggestions = ref([])
const clearSuggestions = ref([])

const chartTitles = ref({
  main: '',
  secondary: '',
  pie: ''
})

const pieChartData = ref(null)

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const loadDashboardData = async () => {
  const data = await getDashboardData(enterpriseInfo.value.type, timeRange.value)
  const chartData = await getChartData(enterpriseInfo.value.type, 'line', timeRange.value)
  
  // 根据企业类型设置数据卡片
  if (enterpriseInfo.value.type === 'upstream') {
    dataCards.value = [
      {
        label: '今日原料上报量',
        value: data.todayMaterialReport,
        unit: 'kg',
        color: '#409eff',
        icon: Document,
        trend: { type: 'up', value: '+5.2%' }
      },
      {
        label: '库存余量',
        value: data.inventoryRemainder,
        unit: 'kg',
        color: '#67c23a',
        icon: Box
      },
      {
        label: '下游待接收量',
        value: data.downstreamPendingReceive,
        unit: 'kg',
        color: '#e6a23c',
        icon: ShoppingCart
      },
      {
        label: '供货稳定率',
        value: data.supplyStabilityRate,
        unit: '%',
        color: '#909399',
        icon: TrendCharts
      },
      {
        label: '质检合格数',
        value: data.qualityPassCount,
        unit: '批次',
        color: '#67c23a',
        icon: CircleCheck
      }
    ]
    chartTitles.value = {
      main: '原料上报量趋势',
      secondary: '库存变化趋势',
      pie: '质检合格率分布'
    }
  } else if (enterpriseInfo.value.type === 'midstream') {
    dataCards.value = [
      {
        label: '上游原料供应量',
        value: data.upstreamSupply,
        unit: 'kg',
        color: '#409eff',
        icon: Box
      },
      {
        label: '最大可生产量',
        value: data.maxProduction,
        unit: 'kg',
        color: '#67c23a',
        icon: TrendCharts
      },
      {
        label: '系统建议生产量',
        value: data.suggestedProduction,
        unit: 'kg',
        color: '#e6a23c',
        icon: Warning
      },
      {
        label: '今日生产计划',
        value: data.todayProductionPlan,
        unit: 'kg',
        color: '#909399',
        icon: Document
      },
      {
        label: '成品已上报量',
        value: data.productReported,
        unit: 'kg',
        color: '#409eff',
        icon: Document
      },
      {
        label: '下游待提货量',
        value: data.downstreamPendingPickup,
        unit: 'kg',
        color: '#f56c6c',
        icon: ShoppingCart
      }
    ]
    chartTitles.value = {
      main: '生产量趋势',
      secondary: '原料供应与生产对比',
      pie: null
    }
  } else if (enterpriseInfo.value.type === 'downstream') {
    dataCards.value = [
      {
        label: '中游成品到货量',
        value: data.midstreamArrival,
        unit: 'kg',
        color: '#409eff',
        icon: Van
      },
      {
        label: '溯源码生成数',
        value: data.traceCodeGenerated,
        unit: '个',
        color: '#67c23a',
        icon: Document
      },
      {
        label: '已贴码商品数',
        value: data.labeledProducts,
        unit: '个',
        color: '#e6a23c',
        icon: CircleCheck
      },
      {
        label: '物流发货单数量',
        value: data.logisticsOrders,
        unit: '单',
        color: '#909399',
        icon: Van
      }
    ]
    chartTitles.value = {
      main: '到货量趋势',
      secondary: '批次库存分布',
      pie: null
    }
    pieChartData.value = data.batchInventory
  }

  // 加载预警数据（传入企业类型）
  const alerts = await getAlerts({ level: 'high', status: 'pending' }, enterpriseInfo.value.type)
  urgentAlerts.value = alerts

  // 渲染图表
  await nextTick()
  renderCharts(chartData)
}

const renderCharts = (chartData) => {
  // 主图表（折线图）
  if (mainChartRef.value && !mainChart) {
    mainChart = echarts.init(mainChartRef.value)
  }
  if (mainChart) {
    mainChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: chartData.labels
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: chartData.datasets,
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }
      ]
    })
  }

  // 次要图表（柱状图）
  if (secondaryChartRef.value && !secondaryChart) {
    secondaryChart = echarts.init(secondaryChartRef.value)
  }
  if (secondaryChart) {
    secondaryChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: chartData.labels
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: chartData.datasets.map(v => v * 0.8),
          type: 'bar',
          itemStyle: {
            color: '#67c23a'
          }
        }
      ]
    })
  }

  // 饼图（如果有）
  if (pieChartData.value && pieChartRef.value) {
    if (!pieChart) {
      pieChart = echarts.init(pieChartRef.value)
    }
    pieChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: pieChartData.value.map(item => ({
            value: item.quantity,
            name: `${item.productName} (${item.batchNo})`
          }))
        }
      ]
    })
  }
}

const handleAlertClick = (alert) => {
  router.push({
    path: '/enterprise/alerts',
    query: { alertId: alert.id }
  })
}

const loadSupplyDemandData = async () => {
  // 模拟供需预测数据
  await nextTick()
  if (supplyDemandChartRef.value && !supplyDemandChart) {
    supplyDemandChart = echarts.init(supplyDemandChartRef.value)
  }
  if (supplyDemandChart) {
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
}

const handleViewSuggestion = async () => {
  // 模拟获取建议数据
  replenishSuggestions.value = [
    {
      materialName: '玉米',
      currentStock: 500,
      suggestedQuantity: 2000,
      suggestedTime: '2024-02-01',
      reason: '根据历史数据和季节因素，预计2月份需求将增加30%'
    }
  ]
  clearSuggestions.value = [
    {
      materialName: '玉米粉',
      currentStock: 3000,
      suggestedQuantity: 1000,
      suggestedTime: '2024-01-20',
      reason: '库存积压超过30天，建议加快销售'
    }
  ]
  suggestionVisible.value = true
}

const handleExportReport = () => {
  ElMessage.success('供需预测报告导出成功')
}

const handleExportSuggestionReport = () => {
  ElMessage.success('调度建议报告导出成功')
}

onMounted(async () => {
  enterpriseInfo.value = await getCurrentEnterprise()
  await loadDashboardData()
  await loadSupplyDemandData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  min-height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-trend.up {
  color: #67c23a;
}

.card-trend.down {
  color: #f56c6c;
}

.alert-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.alert-item {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.card-header {
  font-weight: 500;
}
</style>
