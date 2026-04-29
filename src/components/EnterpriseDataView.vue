<template>
  <el-card title="产业链上下游数据总览" style="width: 80%; margin: 20px auto;">
    <!-- 数据筛选 -->
    <div style="margin-bottom: 20px;">
      <el-select v-model="filterType" placeholder="筛选企业类型" style="width: 200px; margin-right: 10px;">
        <el-option label="全部" value="all"></el-option>
        <el-option label="上游（农户/原料厂）" value="upstream"></el-option>
        <el-option label="中游（加工厂）" value="midstream"></el-option>
        <el-option label="下游（销售商场）" value="downstream"></el-option>
      </el-select>
      <el-button type="primary" @click="refreshData">刷新数据</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%;">
      <el-table-column prop="id" label="序号" width="80"></el-table-column>
      <el-table-column prop="enterpriseName" label="企业/农户名称" min-width="150"></el-table-column>
      <el-table-column prop="enterpriseType" label="环节类型" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.enterpriseType === 'upstream'" type="success">上游</el-tag>
          <el-tag v-if="scope.row.enterpriseType === 'midstream'" type="warning">中游</el-tag>
          <el-tag v-if="scope.row.enterpriseType === 'downstream'" type="primary">下游</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="产品名称" width="120"></el-table-column>
      <el-table-column prop="dataDesc" label="核心数据" min-width="200"></el-table-column>
      <el-table-column prop="manager" label="负责人" width="100"></el-table-column>
      <el-table-column prop="phone" label="联系方式" width="120"></el-table-column>
      <el-table-column prop="createTime" label="上报时间" width="180"></el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 筛选条件
const filterType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)

// 模拟数据源
const rawData = ref([
  { id: 1, enterpriseName: '张大爷（玉米种植户）', enterpriseType: 'upstream', productName: '玉米', dataDesc: '日晒1200小时，有机肥，灌溉20次，亩产1200斤', manager: '张大爷', phone: '13800138000', createTime: '2026-03-01 10:20:30' },
  { id: 2, enterpriseName: 'XX农产品加工厂', enterpriseType: 'midstream', productName: '玉米', dataDesc: '清洗→去皮→真空包装，加工时间2小时，质检合格', manager: '李经理', phone: '13900139000', createTime: '2026-03-02 09:15:20' },
  { id: 3, enterpriseName: 'XX生鲜超市（朝阳店）', enterpriseType: 'downstream', productName: '玉米', dataDesc: '上架时间2026-03-03，售价3.5元/斤，库存500斤', manager: '王店长', phone: '13700137000', createTime: '2026-03-03 08:30:15' },
  { id: 4, enterpriseName: '李大妈（玉米种植户）', enterpriseType: 'upstream', productName: '玉米', dataDesc: '日晒1150小时，农家肥，灌溉18次，亩产1150斤', manager: '李大妈', phone: '13600136000', createTime: '2026-03-01 11:10:05' }
])

// 筛选后的数据
const tableData = computed(() => {
  if (filterType.value === 'all') {
    return rawData.value
  }
  return rawData.value.filter(item => item.enterpriseType === filterType.value)
})

// 刷新数据
const refreshData = () => {
  ElMessage.info('数据已刷新')
  // 模拟对接后端接口：axios.get('/api/data/list', { params: { type: filterType.value, page: currentPage.value, size: pageSize.value } })
}

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
}
const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style scoped>
.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-pagination {
  margin-top: 15px;
}
</style>