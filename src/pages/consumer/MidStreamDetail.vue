<template>
  <div class="detail-page">
    <van-nav-bar
      fixed
      :placeholder="true"
    >
      <template #title>
        <div class="nav-title">
          <span class="stage-label midstream">中游</span>
          <span class="title-text">溯源：东北农产品加工有限公司</span>
        </div>
      </template>
      <template #left>
        <van-icon name="arrow-left" @click="handleBack" />
        <span class="back-text" @click="handleBack">返回</span>
      </template>
    </van-nav-bar>
    <div style="height: 46px;"></div>

    <!-- 关键生产视频 -->
    <div class="video-container">
      <video
        v-if="traceData.videoUrl"
        :src="traceData.videoUrl"
        :poster="traceData.videoPoster"
        controls
        class="main-video"
      ></video>
      <div v-else class="video-placeholder">
        <van-icon name="play-circle-o" size="48" />
        <p>视频加载中...</p>
      </div>
      <p class="video-desc">{{ traceData.videoDesc || '玉米清洗→去皮→真空包装全过程' }}</p>
    </div>

    <!-- 全流程时间轴 -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h3>全流程信息</h3>
      </div>
      <div class="timeline-container">
        <div
          v-for="(item, index) in traceData.timeline"
          :key="index"
          class="timeline-item"
          :class="{ 'active': index < traceData.timeline.length }"
        >
          <div class="timeline-dot">
            <div class="dot-inner"></div>
          </div>
          <div class="timeline-content">
            <div class="timeline-card">
              <div class="card-header">
                <div class="event-icon">🏭</div>
                <div class="event-info">
                  <div class="step-header">
                    <span class="step-time">{{ item.time }}</span>
                    <van-tag type="primary" size="small" round>{{ item.event }}</van-tag>
                  </div>
                </div>
              </div>
              <p class="step-desc">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据展示 -->
    <div class="data-section">
      <van-cell-group title="核心加工数据">
        <van-cell label="加工工序" :value="traceData.data.process" />
        <van-cell label="加工时长" :value="traceData.data.processTime" />
        <van-cell label="质检标准" :value="traceData.data.qualityStandard" />
        <van-cell label="加工批次号" :value="traceData.data.batchNo" />
        <van-cell label="出厂时间" :value="traceData.data.productionTime" />
        <van-cell label="冷链温度" :value="traceData.data.coldChainTemp" />
        <van-cell label="包装材质" :value="traceData.data.packaging" />
      </van-cell-group>

      <!-- 加工厂信息 -->
      <van-cell-group title="加工厂信息" style="margin-top: 15px;">
        <van-cell label="工厂名称" :value="traceData.enterpriseName" />
        <van-cell label="工厂地址" :value="traceData.location" />
        <van-cell label="资质认证" :value="traceData.data.certification" />
        <van-cell label="质检报告" :value="traceData.data.qualityReport" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMidstreamTraceability } from '@/utils/api'

const router = useRouter()

const handleBack = () => {
  // 确保返回到消费者首页
  router.push('/consumer')
}

const traceData = ref({
  enterpriseName: '东北农产品加工有限公司',
  location: '黑龙江省哈尔滨市经开区XX路18号',
  videoUrl: 'https://v-cdn.zjol.com.cn/280444.mp4',
  videoPoster: 'https://picsum.photos/300/200?corn-process',
  videoDesc: '玉米清洗→去皮→真空包装全过程',
  timeline: [],
  data: {
    process: '清洗→去皮→蒸煮→冷却→真空包装',
    processTime: '2小时/批次（每批次500斤）',
    qualityStandard: '无霉变、甜度≥18°、无异物',
    batchNo: 'B20240101001',
    productionTime: '2024-01-12 16:00:00',
    coldChainTemp: '0-4℃全程冷链',
    packaging: '食品级真空包装（可回收）',
    certification: 'SC食品生产许可证（编号：SC11023010900012）',
    qualityReport: '编号：ZJ2024011201（可扫码核验）'
  }
})

onMounted(async () => {
  try {
    const data = await getMidstreamTraceability()
    traceData.value = data
  } catch (error) {
    console.error('加载溯源数据失败', error)
  }
})
</script>

<style scoped>
.detail-page {
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 30%, #f5f5f5 100%);
  min-height: 100vh;
  padding: 10px;
  padding-bottom: 20px;
}

.video-container {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.main-video {
  width: 100%;
  border-radius: 8px;
  background: #000;
}

.video-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #969799;
}

.video-placeholder p {
  margin-top: 10px;
  font-size: 14px;
}

.video-desc {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 10px;
}

.timeline-section {
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.timeline-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.timeline-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-header h3::before {
  content: '📊';
  font-size: 20px;
}

.timeline-container {
  position: relative;
  padding-left: 24px;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #1989fa 0%, #e5e5e5 100%);
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -29px;
  top: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  background: linear-gradient(135deg, #1989fa 0%, #3b82f6 100%);
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.4);
}

.timeline-item:not(.active) .timeline-dot {
  background: #e5e5e5;
}

.dot-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
}

.timeline-item.active .dot-inner {
  background: #ffffff;
}

.timeline-content {
  margin-left: 0;
}

.timeline-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-card {
  border-color: #1989fa;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.15);
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.event-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1989fa 0%, #3b82f6 100%);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(25, 137, 250, 0.3);
}

.timeline-item:not(.active) .event-icon {
  background: linear-gradient(135deg, #e5e5e5 0%, #d4d4d4 100%);
  box-shadow: none;
}

.event-info {
  flex: 1;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.step-time {
  font-size: 12px;
  color: #969799;
  font-weight: 500;
}

.step-desc {
  font-size: 14px;
  color: #323233;
  margin: 0;
  line-height: 1.6;
  padding-left: 52px;
}

.data-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-label {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

.stage-label.upstream {
  background: linear-gradient(135deg, #07c160 0%, #22c55e 100%);
  box-shadow: 0 2px 4px rgba(7, 193, 96, 0.3);
}

.stage-label.midstream {
  background: linear-gradient(135deg, #1989fa 0%, #3b82f6 100%);
  box-shadow: 0 2px 4px rgba(25, 137, 250, 0.3);
}

.stage-label.downstream {
  background: linear-gradient(135deg, #ff976a 0%, #ff6b35 100%);
  box-shadow: 0 2px 4px rgba(255, 151, 106, 0.3);
}

.title-text {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

.back-text {
  margin-left: 4px;
  font-size: 16px;
  color: #323233;
}
</style>
