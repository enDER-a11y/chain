<template>
  <div class="detail-page">
    <van-nav-bar
      fixed
      :placeholder="true"
    >
      <template #title>
        <div class="nav-title">
          <span class="stage-label downstream">下游</span>
          <span class="title-text">溯源：永辉超市（朝阳店）</span>
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
      <p class="video-desc">{{ traceData.videoDesc || '超市上架+冷链保鲜过程' }}</p>
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
                <div class="event-icon">🏪</div>
                <div class="event-info">
                  <div class="step-header">
                    <span class="step-time">{{ item.time }}</span>
                    <van-tag type="warning" size="small" round>{{ item.event }}</van-tag>
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
      <van-cell-group title="核心销售数据">
        <van-cell label="上架时间" :value="traceData.data.shelfTime" />
        <van-cell label="售价" :value="traceData.data.price" />
        <van-cell label="库存数量" :value="traceData.data.inventory" />
        <van-cell label="保鲜方式" :value="traceData.data.preservation" />
        <van-cell label="货架位置" :value="traceData.data.shelfLocation" />
        <van-cell label="配送范围" :value="traceData.data.deliveryRange" />
        <van-cell label="保质期" :value="traceData.data.shelfLife" />
      </van-cell-group>

      <!-- 商场信息 -->
      <van-cell-group title="商场信息" style="margin-top: 15px;">
        <van-cell label="商场名称" :value="traceData.enterpriseName" />
        <van-cell label="详细地址" :value="traceData.location" />
        <van-cell label="营业时间" :value="traceData.data.businessHours" />
        <van-cell label="联系电话" :value="traceData.data.contact + '（仅展示后4位：' + traceData.data.contact.slice(-4) + '）'" />
        <van-cell label="售后政策" :value="traceData.data.afterSale" />
      </van-cell-group>
    </div>

    <!-- 区块链核验和碳足迹 -->
    <div class="verification-section">
      <van-cell-group title="区块链溯源信息">
        <van-cell label="上链状态" value="已上链" />
        <van-cell label="区块链哈希" :value="traceData.blockchain?.hash ? (traceData.blockchain.hash.slice(0, 10) + '...' + traceData.blockchain.hash.slice(-10)) : '-'">
          <template #right-icon>
            <van-button size="mini" type="primary" @click="handleVerifyHash" :loading="verifying">
              哈希核验
            </van-button>
          </template>
        </van-cell>
        <van-cell label="上链时间" :value="traceData.blockchain?.onChainTime || '-'" />
        <van-cell label="区块高度" :value="traceData.blockchain?.blockHeight || '-'" />
      </van-cell-group>

      <van-cell-group title="碳足迹信息" style="margin-top: 15px;">
        <van-cell
          v-if="traceData.carbonFootprint"
          title="总碳足迹"
          :value="traceData.carbonFootprint.total + ' kg CO2e'"
        />
        <van-cell
          v-if="traceData.carbonFootprint"
          :title="getCarbonFootprintDescription(traceData.carbonFootprint.total)"
        />
        <van-collapse v-model="activeCarbonCollapse" :border="false">
          <van-collapse-item title="碳排放明细" name="1">
            <van-cell
              v-if="traceData.carbonFootprint"
              title="运输环节"
              :value="traceData.carbonFootprint.transport + ' kg CO2e'"
            />
            <van-cell
              v-if="traceData.carbonFootprint"
              title="生产环节"
              :value="traceData.carbonFootprint.production + ' kg CO2e'"
            />
            <van-cell
              v-if="traceData.carbonFootprint"
              title="包装回收"
              :value="traceData.carbonFootprint.packaging + ' kg CO2e'"
            />
          </van-collapse-item>
        </van-collapse>
        <van-cell v-if="!traceData.carbonFootprint" title="暂无碳足迹数据" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDownstreamTraceability, verifyBlockchainHash } from '@/utils/api'

const router = useRouter()

const handleBack = () => {
  // 确保返回到消费者首页
  router.push('/consumer')
}

const verifying = ref(false)
const verificationResult = ref(null)
const activeCarbonCollapse = ref([])

const traceData = ref({
  enterpriseName: '永辉超市（朝阳店）',
  location: '北京市朝阳区建国路88号',
  videoUrl: 'https://v-cdn.zjol.com.cn/280445.mp4',
  videoPoster: 'https://picsum.photos/300/200?supermarket',
  videoDesc: '超市上架+冷链保鲜过程',
  timeline: [],
  data: {
    shelfTime: '2024-01-15 09:00:00',
    price: '3.5元/斤（5斤装16.8元）',
    inventory: '500斤（实时更新）',
    preservation: '冷藏柜（0-4℃）',
    shelfLocation: '生鲜区A08号',
    deliveryRange: '3公里内免费配送，超出按5元/公里计费',
    shelfLife: '真空包装常温7天，冷藏15天',
    businessHours: '08:00-22:00',
    contact: '010-8888XXXX',
    afterSale: '未拆封变质可7天无理由退换'
  },
  blockchain: {
    status: 'success',
    hash: '0x' + Math.random().toString(16).substr(2, 64),
    onChainTime: '2024-01-15 10:30:00',
    blockHeight: 1234567
  },
  carbonFootprint: {
    total: 2.5,
    transport: 1.2,
    production: 0.8,
    packaging: 0.5
  }
})

const handleVerifyHash = async () => {
  if (!traceData.value.blockchain?.hash) {
    ElMessage.warning('暂无区块链哈希信息')
    return
  }
  
  verifying.value = true
  try {
    const result = await verifyBlockchainHash(traceData.value.blockchain.hash)
    verificationResult.value = result
    if (result.success) {
      ElMessage.success('核验成功，数据真实有效')
    } else {
      ElMessage.error('核验失败，数据可能被篡改')
    }
  } catch (error) {
    ElMessage.error('核验失败，请稍后重试')
  } finally {
    verifying.value = false
  }
}

const getCarbonFootprintDescription = (total) => {
  // 将碳排放转换为通俗化描述
  // 假设1棵树每天吸收约1.2kg CO2
  const trees = Math.round(total / 1.2)
  if (trees <= 0) {
    return '这件商品的碳足迹非常低，对环境友好'
  } else if (trees === 1) {
    return '相当于1棵树1天吸收的二氧化碳量'
  } else if (trees <= 5) {
    return `相当于${trees}棵树1天吸收的二氧化碳量`
  } else {
    return `相当于${trees}棵树1天吸收的二氧化碳量，建议选择更环保的产品`
  }
}

onMounted(async () => {
  try {
    const data = await getDownstreamTraceability()
    traceData.value = data
  } catch (error) {
    console.error('加载溯源数据失败', error)
  }
})
</script>

<style scoped>
.detail-page {
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 30%, #f5f5f5 100%);
  min-height: 100vh;
  padding: 10px;
  padding-bottom: 20px;
}

.video-container {
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(255, 151, 106, 0.15);
  border: 1px solid rgba(255, 151, 106, 0.1);
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
  background: linear-gradient(180deg, #ff976a 0%, #e5e5e5 100%);
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
  background: linear-gradient(135deg, #ff976a 0%, #ff6b35 100%);
  box-shadow: 0 2px 8px rgba(255, 151, 106, 0.4);
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
  border-color: #ff976a;
  box-shadow: 0 4px 12px rgba(255, 151, 106, 0.15);
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
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
  background: linear-gradient(135deg, #ff976a 0%, #ff6b35 100%);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(255, 151, 106, 0.3);
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

.verification-section {
  margin-top: 15px;
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
