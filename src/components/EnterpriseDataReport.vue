<template>
  <el-card title="产业链数据上报" style="width: 80%; margin: 20px auto;">
    <el-form :model="reportForm" label-width="120px" style="max-width: 800px;">
      <!-- 基础信息 -->
      <el-form-item label="企业类型">
        <el-select v-model="reportForm.enterpriseType" placeholder="请选择">
          <el-option label="上游（农户/原料厂）" value="upstream"></el-option>
          <el-option label="中游（加工厂）" value="midstream"></el-option>
          <el-option label="下游（销售商场）" value="downstream"></el-option>
        </el-select>
      </el-form-item>

      <!-- 上游专属字段 -->
      <el-form-item label="农产品名称" v-if="reportForm.enterpriseType === 'upstream'">
        <el-input v-model="reportForm.productName" placeholder="如：玉米"></el-input>
      </el-form-item>
      <el-form-item label="种植数据" v-if="reportForm.enterpriseType === 'upstream'">
        <el-input v-model="reportForm.plantData" type="textarea" placeholder="如：日晒1200小时，使用有机肥，灌溉次数20次"></el-input>
      </el-form-item>

      <!-- 中游专属字段 -->
      <el-form-item label="加工工序" v-if="reportForm.enterpriseType === 'midstream'">
        <el-input v-model="reportForm.processData" type="textarea" placeholder="如：清洗→去皮→包装，加工时间2小时"></el-input>
      </el-form-item>

      <!-- 下游专属字段 -->
      <el-form-item label="销售门店" v-if="reportForm.enterpriseType === 'downstream'">
        <el-input v-model="reportForm.storeName" placeholder="如：XX生鲜超市"></el-input>
      </el-form-item>

      <!-- 通用字段 -->
      <el-form-item label="负责人">
        <el-input v-model="reportForm.manager" placeholder="请输入负责人姓名"></el-input>
      </el-form-item>
      <el-form-item label="联系方式">
        <el-input v-model="reportForm.phone" placeholder="请输入联系电话"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交数据</el-button>
        <el-button @click="resetForm" style="margin-left: 10px;">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 上报表单数据
const reportForm = ref({
  enterpriseType: '',
  productName: '',
  plantData: '',
  processData: '',
  storeName: '',
  manager: '',
  phone: ''
})

// 提交表单
const submitForm = () => {
  if (!reportForm.value.enterpriseType) {
    ElMessage.warning('请选择企业类型')
    return
  }
  // 模拟提交成功
  ElMessage.success('数据上报成功！')
  // 可对接后端接口：axios.post('/api/report', reportForm.value)
}

// 重置表单
const resetForm = () => {
  reportForm.value = {
    enterpriseType: '',
    productName: '',
    plantData: '',
    processData: '',
    storeName: '',
    manager: '',
    phone: ''
  }
}
</script>

<style scoped>
.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-form {
  padding: 20px 0;
}
</style>