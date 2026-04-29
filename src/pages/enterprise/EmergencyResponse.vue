<template>
  <div class="emergency-response">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应急供应链响应</span>
          <el-button type="primary" @click="handleGenerateSuggestion">一键生成调配建议</el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :model="filters" inline style="margin-bottom: 20px;">
        <el-form-item label="区域选择">
          <el-select v-model="filters.region" placeholder="请选择区域" style="width: 200px;" @change="handleRegionChange">
            <el-option label="全国" value="all" />
            <el-option label="华东地区" value="east" />
            <el-option label="华南地区" value="south" />
            <el-option label="华北地区" value="north" />
            <el-option label="西南地区" value="southwest" />
          </el-select>
        </el-form-item>
        <el-form-item label="物资类型">
          <el-select v-model="filters.materialType" placeholder="全部" clearable style="width: 150px;" @change="handleFilterChange">
            <el-option label="原料" value="material" />
            <el-option label="成品" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-select v-model="filters.urgency" placeholder="全部" clearable style="width: 150px;" @change="handleFilterChange">
            <el-option label="紧急" value="urgent" />
            <el-option label="一般" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="20">
        <!-- 左侧：地图可视化 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <span>区域库存/运力分布</span>
            </template>
            <div ref="mapContainer" class="map-container">
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-dot" style="background: #67c23a;"></span>
                  <span>库存充足</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot" style="background: #e6a23c;"></span>
                  <span>库存一般</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot" style="background: #f56c6c;"></span>
                  <span>库存不足</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：数据统计和调配建议 -->
        <el-col :span="8">
          <el-card style="margin-bottom: 20px;">
            <template #header>
              <span>区域统计</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="总库存量">
                {{ statistics.totalInventory }} kg
              </el-descriptions-item>
              <el-descriptions-item label="总运力">
                {{ statistics.totalCapacity }} 车次
              </el-descriptions-item>
              <el-descriptions-item label="紧急需求">
                {{ statistics.urgentDemand }} 项
              </el-descriptions-item>
              <el-descriptions-item label="可调配企业">
                {{ statistics.availableEnterprises }} 家
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card>
            <template #header>
              <span>调配建议</span>
            </template>
            <div v-if="suggestions.length === 0" class="empty-suggestion">
              <el-empty description="暂无调配建议" :image-size="80" />
            </div>
            <el-timeline v-else>
              <el-timeline-item
                v-for="(item, index) in suggestions"
                :key="index"
                :timestamp="item.time"
                placement="top"
              >
                <el-card>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <el-tag :type="item.urgency === 'urgent' ? 'danger' : 'warning'" style="margin-top: 10px;">
                    {{ item.urgency === 'urgent' ? '紧急' : '一般' }}
                  </el-tag>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getEmergencyOverview, getMapConfig } from '@/utils/api'

const filters = ref({
  region: 'all',
  materialType: '',
  urgency: ''
})

const statistics = ref({
  totalInventory: 0,
  totalCapacity: 0,
  urgentDemand: 0,
  availableEnterprises: 0
})

const suggestions = ref([])
const mapContainer = ref(null)
let mapInstance = null
let markerList = []

const markerColor = {
  adequate: '#67c23a',
  warning: '#e6a23c',
  shortage: '#f56c6c'
}

const handleRegionChange = () => {
  loadStatistics()
}

const handleFilterChange = () => {
  loadStatistics()
}

const handleSearch = () => {
  loadStatistics()
}

const handleReset = () => {
  filters.value = {
    region: 'all',
    materialType: '',
    urgency: ''
  }
  loadStatistics()
}

const loadStatistics = async () => {
  const result = await getEmergencyOverview(filters.value)
  statistics.value = result.statistics
  suggestions.value = result.suggestions || []
  renderMapPoints(result.points || [])
}

const handleGenerateSuggestion = () => {
  ElMessage.success('正在基于实时库存与运力生成调配建议...')
  loadStatistics().then(() => ElMessage.success('调配建议已刷新'))
}

const clearMarkers = () => {
  markerList.forEach(marker => marker.setMap(null))
  markerList = []
}

const renderMapPoints = (points) => {
  if (!mapInstance || !window.AMap) return
  clearMarkers()
  points.forEach((point) => {
    const marker = new window.AMap.CircleMarker({
      center: [point.lng, point.lat],
      radius: 10,
      strokeColor: '#fff',
      strokeWeight: 1,
      fillColor: markerColor[point.inventoryLevel] || '#409eff',
      fillOpacity: 0.9,
      title: point.name
    })
    marker.setMap(mapInstance)
    marker.on('click', () => {
      ElMessage.info(`${point.name} | 库存: ${point.inventory}kg | 运力: ${point.capacity}车次`)
    })
    markerList.push(marker)
  })
  if (points.length > 0) {
    mapInstance.setFitView(markerList, false, [80, 80, 80, 80])
  }
}

const loadAmapScript = (jsKey) => {
  if (window.AMap) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${jsKey}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('高德地图脚本加载失败'))
    document.head.appendChild(script)
  })
}

const initMap = async () => {
  const config = await getMapConfig()
  if (!config.jsKey) {
    ElMessage.warning('未配置高德地图 key，请在后端配置 AMAP_JS_KEY')
    return
  }
  await loadAmapScript(config.jsKey)
  mapInstance = new window.AMap.Map(mapContainer.value, {
    zoom: 5,
    center: [116.397428, 39.90923]
  })
}

onMounted(() => {
  initMap()
    .then(() => loadStatistics())
    .catch((error) => {
      ElMessage.error(error.message || '地图初始化失败')
    })
})
</script>

<style scoped>
.emergency-response {
  padding: 0;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  width: 100%;
  height: 600px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.map-legend {
  position: absolute;
  z-index: 10;
  left: 16px;
  bottom: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.empty-suggestion {
  padding: 20px 0;
}
</style>
