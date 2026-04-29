<template>
  <div class="enterprise-page">
    <div style="padding: 10px; background: #f5f5f5;">
      <el-button type="primary" disabled>企业端（上下游数据）</el-button>
      <el-button type="success" @click="$router.push('/consumer')" style="margin-left: 10px;">
        消费者端（农产品溯源）
      </el-button>
    </div>
    <el-container>
      <el-header>
        <h2>果蔬供应链数据管理后台</h2>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <el-menu
              default-active="1"
              class="el-menu-vertical-demo"
          >
            <el-menu-item index="1">数据上传</el-menu-item>
            <el-menu-item index="2">数据导出</el-menu-item>
            <el-menu-item index="3">分析图表</el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 数据上传 -->
          <div v-if="activeMenu === '1'">
            <el-card title="数据上传" style="margin-bottom: 20px;">
              <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  accept=".csv,.xlsx"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 .csv / .xlsx 格式，大小不超过 10MB
                  </div>
                </template>
              </el-upload>
              <el-button type="success" @click="handleUpload" style="margin-top: 15px;">
                上传数据
              </el-button>
            </el-card>
          </div>

          <!-- 数据导出 -->
          <div v-if="activeMenu === '2'">
            <el-card title="数据导出" style="margin-bottom: 20px;">
              <el-form :model="exportForm" label-width="120px">
                <el-form-item label="导出范围">
                  <el-select v-model="exportForm.range" placeholder="请选择">
                    <el-option label="全部数据" value="all"></el-option>
                    <el-option label="今日数据" value="today"></el-option>
                    <el-option label="本周数据" value="week"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="导出格式">
                  <el-radio-group v-model="exportForm.format">
                    <el-radio label="xlsx">Excel (.xlsx)</el-radio>
                    <el-radio label="csv">CSV (.csv)</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleExport">导出数据</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

          <!-- 分析图表（对应第二张图） -->
          <div v-if="activeMenu === '3'">
            <el-card title="分析图表配置" style="margin-bottom: 20px;">
              <el-form :model="chartConfig" label-width="180px">
                <el-form-item label="载荷图主成分数目">
                  <el-slider v-model="chartConfig.pc1" :min="1" :max="10"></el-slider>
                </el-form-item>
                <el-form-item label="关联热图主成分数目">
                  <el-slider v-model="chartConfig.pc2" :min="1" :max="10"></el-slider>
                </el-form-item>
                <el-form-item label="Top 方差">
                  <el-slider v-model="chartConfig.topVar" :min="1" :max="90"></el-slider>
                </el-form-item>
                <el-form-item label="相关性计算方法">
                  <el-select v-model="chartConfig.corrMethod" placeholder="请选择">
                    <el-option label="pearson" value="pearson"></el-option>
                    <el-option label="spearman" value="spearman"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="相关性计算缺失值处理">
                  <el-select v-model="chartConfig.naHandle" placeholder="请选择">
                    <el-option label="na.or.complete" value="na.or.complete"></el-option>
                    <el-option label="complete.obs" value="complete.obs"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="载荷图颜色映射">
                  <el-radio-group v-model="chartConfig.colorMap">
                    <el-radio label="low">载荷图低颜色</el-radio>
                    <el-radio label="mid">载荷图中颜色</el-radio>
                    <el-radio label="high">载荷图高颜色</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="renderCharts">提交生成图表</el-button>
                  <el-button @click="resetConfig">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 图表预览区 -->
            <el-card title="图表预览" style="margin-bottom: 20px;">
              <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
              <el-button type="success" @click="downloadCharts" style="margin-top: 15px;">
                下载图表
              </el-button>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const activeMenu = ref('1')
const exportForm = ref({
  range: 'all',
  format: 'xlsx'
})
const chartConfig = ref({
  pc1: 5,
  pc2: 10,
  topVar: 90,
  corrMethod: 'pearson',
  naHandle: 'na.or.complete',
  colorMap: 'low'
})
let chartInstance = null
const chartContainer = ref(null)

// 模拟文件上传
const handleFileChange = (file) => {
  ElMessage.info(`已选择文件：${file.name}`)
}
const handleUpload = () => {
  ElMessage.success('数据上传成功！')
}

// 模拟数据导出
const handleExport = () => {
  ElMessage.success(`已导出${exportForm.value.range}的${exportForm.value.format}文件`)
}

// 渲染图表（示例：热图 + 散点图）
const renderCharts = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value)
  }
  const option = {
    title: { text: '关联热图示例' },
    tooltip: {},
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
    yAxis: { type: 'category', data: ['1', '2', '3', '4', '5'] },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15px'
    },
    series: [
      {
        name: '相关性',
        type: 'heatmap',
        data: [
          [0, 0, 0.8], [0, 1, -0.2], [0, 2, 0.5], [0, 3, -0.7], [0, 4, 0.3],
          [1, 0, -0.3], [1, 1, 0.9], [1, 2, -0.1], [1, 3, 0.6], [1, 4, -0.4],
          [2, 0, 0.6], [2, 1, -0.5], [2, 2, 0.8], [2, 3, -0.3], [2, 4, 0.7],
          [3, 0, -0.2], [3, 1, 0.7], [3, 2, -0.6], [3, 3, 0.9], [3, 4, -0.1],
          [4, 0, 0.4], [4, 1, -0.8], [4, 2, 0.2], [4, 3, -0.5], [4, 4, 0.8]
        ]
      }
    ]
  }
  chartInstance.setOption(option)
}

// 下载图表
const downloadCharts = () => {
  const dataUrl = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2
  })
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'analysis-chart.png'
  link.click()
}

// 重置配置
const resetConfig = () => {
  chartConfig.value = {
    pc1: 5,
    pc2: 10,
    topVar: 90,
    corrMethod: 'pearson',
    naHandle: 'na.or.complete',
    colorMap: 'low'
  }
}

onMounted(() => {
  if (activeMenu.value === '3') {
    renderCharts()
  }
})
</script>

<style scoped>
.enterprise-page {
  height: 100vh;
}
.el-header {
  background: #409eff;
  color: #fff;
  line-height: 60px;
  padding: 0 20px;
}
.el-aside {
  background: #e6e6e6;
}
.el-main {
  background: #f9f9f9;
}
</style>