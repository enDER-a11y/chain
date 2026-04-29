<template>
  <div class="consumer-trace">
    <!-- 商品基础信息 -->
    <van-card
        title="东北甜玉米"
        desc="产地：黑龙江省哈尔滨市"
        style="margin-bottom: 10px;"
    >
      <template #cover>
        <img src="https://picsum.photos/200/100?corn" alt="玉米商品图" />
      </template>
    </van-card>

    <!-- 产业链环节折叠面板 -->
    <van-collapse v-model="activeNames">
      <!-- 上游：农户种植 -->
      <van-collapse-item title="上游：张大爷玉米种植户" name="upstream">
        <van-list>
          <!-- 使用原生 video 标签代替 van-video -->
          <video
              controls
              poster="https://picsum.photos/300/200?corn-farm"
              style="width: 100%; margin-bottom: 15px; border-radius: 8px;"
          >
            <source src="https://v-cdn.zjol.com.cn/280443.mp4" type="video/mp4">
            您的浏览器不支持视频标签
          </video>

          <!-- 种植数据 -->
          <van-cell-group title="种植核心数据">
            <van-cell label="种植周期" value="120天" />
            <van-cell label="累计日晒" value="1200小时" />
            <van-cell label="施肥类型" value="有机肥（大豆肥+草木灰）" />
            <van-cell label="灌溉次数" value="20次（地下水灌溉）" />
            <van-cell label="亩产" value="1200斤" />
            <van-cell label="采摘时间" value="2026-02-28" />
          </van-cell-group>
        </van-list>
      </van-collapse-item>

      <!-- 中游：加工厂 -->
      <van-collapse-item title="中游：XX农产品加工厂" name="midstream">
        <van-list>
          <video
              controls
              poster="https://picsum.photos/300/200?corn-process"
              style="width: 100%; margin-bottom: 15px; border-radius: 8px;"
          >
            <source src="https://v-cdn.zjol.com.cn/280444.mp4" type="video/mp4">
            您的浏览器不支持视频标签
          </video>

          <van-cell-group title="加工核心数据">
            <van-cell label="加工工序" value="清洗→去皮→蒸煮→真空包装" />
            <van-cell label="加工时长" value="2小时/批次" />
            <van-cell label="质检标准" value="无农残、无霉变，甜度≥18°" />
            <van-cell label="加工批次号" value="YM2026030201" />
            <van-cell label="出厂时间" value="2026-03-02 16:00" />
          </van-cell-group>
        </van-list>
      </van-collapse-item>

      <!-- 下游：销售商场 -->
      <van-collapse-item title="下游：XX生鲜超市（朝阳店）" name="downstream">
        <van-list>
          <van-image
              src="https://picsum.photos/300/200?supermarket"
              alt="超市上架图"
              style="width: 100%; margin-bottom: 15px;"
          />
          <van-cell-group title="销售核心数据">
            <van-cell label="上架时间" value="2026-03-03 09:00" />
            <van-cell label="售价" value="3.5元/斤" />
            <van-cell label="库存数量" value="500斤" />
            <van-cell label="门店地址" value="北京市朝阳区XX路88号" />
            <van-cell label="保鲜方式" value="冷藏（0-4℃）" />
          </van-cell-group>
        </van-list>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 默认展开上游
const activeNames = ref(['upstream'])
</script>

<style scoped>
.consumer-trace {
  padding: 10px;
  background: #fff;
  min-height: 100vh;
}
.van-collapse {
  --van-collapse-item-content-padding: 10px;
}
video {
  width: 100%;
  margin-bottom: 15px;
  border-radius: 8px;
  background: #f0f0f0;
}
</style>