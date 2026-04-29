<template>
  <div class="qr-trace-page">
    <van-nav-bar fixed :placeholder="true">
      <template #title>
        <div class="nav-title">
          <span class="title-text">溯源查询</span>
        </div>
      </template>
      <template #left>
        <van-icon name="arrow-left" @click="router.back()" />
        <span class="back-text" @click="router.back()">返回</span>
      </template>
    </van-nav-bar>

    <div style="height: 46px;"></div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else>
      <!-- 关键生产视频（对齐现有 consumer 详情页风格） -->
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
        <p class="video-desc">{{ traceData.videoDesc || '生产加工过程' }}</p>
      </div>

      <van-cell-group title="溯源核心信息">
        <van-cell label="批次号" :value="traceData.batchNo || '-'"/>
        <van-cell label="商品名称" :value="traceData.productName || '-'"/>
        <van-cell label="溯源码" :value="traceId || '-'"/>
      </van-cell-group>

      <van-cell-group title="生产信息" style="margin-top: 15px;">
        <van-cell label="生产企业" :value="traceData.enterpriseName || '-'"/>
        <van-cell label="生产地址" :value="traceData.location || '-'"/>
        <van-cell label="加工工序" :value="traceData.data?.process || '-'"/>
        <van-cell label="生产时间" :value="traceData.data?.productionTime || '-'"/>
        <van-cell label="供应方" :value="traceData.data?.supplier || '-'"/>
        <van-cell label="数量" :value="traceData.data?.quantity != null ? (traceData.data.quantity + '') : '-'"/>
      </van-cell-group>

      <div class="section-title">全流程时间轴</div>
      <div class="timeline-container">
        <div
          v-for="(item, index) in traceData.timeline || []"
          :key="index"
          class="timeline-item"
        >
          <div class="timeline-dot">
            <div class="dot-inner"></div>
          </div>
          <div class="timeline-content">
            <div class="timeline-card">
              <div class="card-header">
                <div class="event-icon">✓</div>
                <div class="event-info">
                  <div class="step-header">
                    <span class="step-time">{{ item.time || item.timestamp || '-' }}</span>
                    <van-tag type="primary" size="small" round>
                      {{ item.event || item.stageName || item.stage || '-' }}
                    </van-tag>
                  </div>
                </div>
              </div>
              <p class="step-desc">
                {{ item.description || item.enterpriseName || item.location || '' }}
              </p>
            </div>
          </div>
        </div>
        <van-empty v-if="!(traceData.timeline && traceData.timeline.length)" description="暂无时间轴数据" />
      </div>

      <div class="section-title">区块链核验</div>
      <van-cell-group title="区块链溯源信息">
        <van-cell
          label="区块链哈希"
          :value="traceData.blockchain?.hash ? (traceData.blockchain.hash.slice(0, 10) + '...' + traceData.blockchain.hash.slice(-10)) : '-'"
        />
        <van-cell
          label="上链时间"
          :value="traceData.blockchain?.onChainTime || '-'"
        />
        <van-cell
          label="区块高度"
          :value="traceData.blockchain?.blockHeight || '-'"
        />
      </van-cell-group>

      <van-cell-group title="碳足迹信息" style="margin-top: 15px;">
        <van-cell
          v-if="traceData.carbonFootprint"
          title="总碳足迹"
          :value="traceData.carbonFootprint.total + ' kg CO2e'"
        />
        <van-cell v-if="!traceData.carbonFootprint" title="暂无碳足迹数据" />
      </van-cell-group>

      <div class="verify-actions">
        <van-button type="primary" block :loading="verifying" @click="handleVerifyHash">
          哈希核验
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getConsumerTraceability, verifyBlockchainHash } from '@/utils/api'

const route = useRoute()
const router = useRouter()

const traceId = computed(() => route.query.traceId || '')
const loading = ref(true)
const verifying = ref(false)

const traceData = ref({
  timeline: [],
  data: {},
  blockchain: null,
  carbonFootprint: null
})

const fetchTrace = async () => {
  loading.value = true
  try {
    if (!traceId.value) {
      ElMessage.warning('未提供 traceId')
      return
    }
    const data = await getConsumerTraceability(traceId.value)
    traceData.value = data || {}
  } catch (e) {
    ElMessage.error('加载溯源失败')
  } finally {
    loading.value = false
  }
}

const handleVerifyHash = async () => {
  if (!traceData.value?.blockchain?.hash) {
    ElMessage.warning('暂无区块链哈希信息')
    return
  }
  verifying.value = true
  try {
    const result = await verifyBlockchainHash(traceData.value.blockchain.hash)
    if (result?.success) ElMessage.success(result.message || '核验成功')
    else ElMessage.error(result?.message || '核验失败')
  } catch (e) {
    ElMessage.error('核验失败，请稍后重试')
  } finally {
    verifying.value = false
  }
}

onMounted(() => {
  fetchTrace()
})
</script>

<style scoped>
.qr-trace-page {
  padding: 0;
  min-height: 100vh;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-text {
  margin-left: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.loading {
  padding: 20px;
  text-align: center;
}

.video-container {
  padding: 12px;
}

.main-video {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  background: #000;
}

.video-placeholder {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.video-desc {
  margin: 10px 2px 0;
  font-size: 13px;
  color: #606266;
}

.section-title {
  margin: 16px 12px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.timeline-container {
  padding: 0 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409eff;
  position: relative;
  margin-top: 6px;
}

.dot-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.timeline-content {
  flex: 1;
}

.timeline-card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.event-icon {
  font-size: 16px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-time {
  color: #606266;
  font-size: 12px;
}

.step-desc {
  margin: 8px 0 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.verify-actions {
  padding: 14px 12px 28px;
}
</style>

