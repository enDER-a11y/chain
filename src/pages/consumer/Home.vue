<template>
  <div class="consumer-home">
    <!-- 顶部导航 -->
    <van-nav-bar title="农产品溯源查询" fixed :placeholder="true" />
    <div style="height: 46px;"></div>

    <!-- 产品信息卡片 -->
    <div class="product-card">
      <van-card
        :title="productInfo.name"
        :desc="productInfo.batchNo"
        :thumb="productInfo.image"
      >
        <template #tags>
          <van-tag type="success" style="margin-right: 5px;">已认证</van-tag>
          <van-tag type="primary">绿色食品</van-tag>
        </template>
        <template #footer>
          <div class="product-footer">
            <div class="footer-item">
              <span class="label">批次号</span>
              <span class="value">{{ productInfo.batchNo }}</span>
            </div>
            <div class="footer-item">
              <span class="label">生产日期</span>
              <span class="value">{{ productInfo.productionDate }}</span>
            </div>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 全流程概览 -->
    <div class="overview-section">
      <van-cell-group title="全流程概览">
        <van-cell
          v-for="(stage, index) in stages"
          :key="index"
          :title="stage.name"
          :label="stage.enterprise"
          :value="stage.status"
          is-link
          @click="handleStageClick(stage.route)"
        >
          <template #icon>
            <div class="stage-icon" :class="stage.iconClass">
              {{ stage.icon }}
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 上中下游入口卡片 -->
    <div class="chain-cards">
      <div class="section-title">查看各环节详情</div>
      
      <!-- 上游：种植户 -->
      <van-card
        class="chain-card"
        @click="$router.push('/consumer/upstream')"
      >
        <template #title>
          <div class="card-title">
            <span class="stage-badge upstream">上游</span>
            <span>张大爷玉米种植户</span>
          </div>
        </template>
        <template #desc>
          <div class="card-desc">
            <van-icon name="location-o" /> 黑龙江省哈尔滨市松北区种植基地
          </div>
        </template>
        <template #cover>
          <img src="https://picsum.photos/100/80?corn-farm" alt="种植基地" />
        </template>
        <template #footer>
          <div class="card-footer">
            <span>查看种植详情</span>
            <van-icon name="arrow" />
          </div>
        </template>
      </van-card>

      <!-- 中游：加工厂 -->
      <van-card
        class="chain-card"
        @click="$router.push('/consumer/midstream')"
      >
        <template #title>
          <div class="card-title">
            <span class="stage-badge midstream">中游</span>
            <span>东北农产品加工有限公司</span>
          </div>
        </template>
        <template #desc>
          <div class="card-desc">
            <van-icon name="location-o" /> 专业玉米清洗/包装/冷链加工
          </div>
        </template>
        <template #cover>
          <img src="https://picsum.photos/100/80?corn-process" alt="加工厂" />
        </template>
        <template #footer>
          <div class="card-footer">
            <span>查看加工详情</span>
            <van-icon name="arrow" />
          </div>
        </template>
      </van-card>

      <!-- 下游：销售商场 -->
      <van-card
        class="chain-card"
        @click="$router.push('/consumer/downstream')"
      >
        <template #title>
          <div class="card-title">
            <span class="stage-badge downstream">下游</span>
            <span>永辉超市（朝阳店）</span>
          </div>
        </template>
        <template #desc>
          <div class="card-desc">
            <van-icon name="location-o" /> 北京市朝阳区建国路88号
          </div>
        </template>
        <template #cover>
          <img src="https://picsum.photos/100/80?supermarket" alt="超市" />
        </template>
        <template #footer>
          <div class="card-footer">
            <span>查看销售详情</span>
            <van-icon name="arrow" />
          </div>
        </template>
      </van-card>
    </div>

    <!-- 底部说明 -->
    <div class="tips">
      <van-icon name="info-o" />
      <p>点击对应环节，查看完整溯源信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const productInfo = ref({
  name: '甜玉米粒',
  batchNo: 'B20240101001',
  image: 'https://picsum.photos/100/100?corn',
  productionDate: '2024-01-12'
})

const stages = ref([
  {
    name: '上游种植',
    enterprise: '张大爷玉米种植户',
    status: '已完成',
    route: '/consumer/upstream',
    icon: '🌾',
    iconClass: 'upstream'
  },
  {
    name: '中游加工',
    enterprise: '东北农产品加工有限公司',
    status: '已完成',
    route: '/consumer/midstream',
    icon: '🏭',
    iconClass: 'midstream'
  },
  {
    name: '下游销售',
    enterprise: '永辉超市（朝阳店）',
    status: '进行中',
    route: '/consumer/downstream',
    icon: '🏪',
    iconClass: 'downstream'
  }
])

const handleStageClick = (routePath) => {
  // 使用 Vue Router 进行导航
  if (routePath) {
    router.push(routePath)
  }
}

onMounted(() => {
  // 可以从路由参数或扫码获取批次号等信息
  const traceId = route.query.traceId || route.query.batchNo
  if (traceId) {
    // 根据traceId获取产品信息
    productInfo.value.batchNo = traceId
  }
})
</script>

<style scoped>
.consumer-home {
  background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f5f5f5 100%);
  min-height: 100vh;
  padding-bottom: 20px;
}

.product-card {
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-item .label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.footer-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.overview-section {
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #ffffff;
}

.stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.chain-cards {
  margin: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
  padding: 0 4px;
}

.chain-card {
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.chain-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.chain-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.stage-badge.upstream {
  background: #07c160;
}

.stage-badge.midstream {
  background: #1989fa;
}

.stage-badge.downstream {
  background: #ff976a;
}

.card-desc {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: #1989fa;
  font-size: 14px;
}

.tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #969799;
  font-size: 12px;
  margin-top: 20px;
  padding: 0 20px;
}

.tips p {
  margin: 0;
}
</style>
