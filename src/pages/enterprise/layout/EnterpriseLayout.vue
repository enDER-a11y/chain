<template>
  <div class="enterprise-layout">
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <h2>产业链溯源管理系统</h2>
        </div>
        <div class="header-right">
          <el-select
            v-model="enterpriseInfo.type"
            @change="handleTypeChange"
            style="width: 120px; margin-right: 15px;"
          >
            <el-option label="上游企业" value="upstream" />
            <el-option label="中游企业" value="midstream" />
            <el-option label="下游企业" value="downstream" />
          </el-select>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :src="enterpriseInfo.avatar" :size="32" />
              <span class="enterprise-name">{{ enterpriseInfo.name }}</span>
              <span class="enterprise-type">{{ getEnterpriseTypeName(enterpriseInfo.type) }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">账号信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="message">消息通知</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="250px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            router
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/enterprise/dashboard">
              <el-icon><DataBoard /></el-icon>
              <span>数据看板</span>
            </el-menu-item>
            <el-menu-item index="/enterprise/overview">
              <el-icon><Document /></el-icon>
              <span>数据总览</span>
            </el-menu-item>
            <el-menu-item index="/enterprise/alerts">
              <el-icon><Warning /></el-icon>
              <span>预警管理</span>
              <el-badge v-if="unreadAlerts > 0" :value="unreadAlerts" class="alert-badge" />
            </el-menu-item>
            <el-menu-item index="/enterprise/report">
              <el-icon><Edit /></el-icon>
              <span>数据上报</span>
            </el-menu-item>
            <el-menu-item index="/enterprise/upstream-downstream">
              <el-icon><Connection /></el-icon>
              <span>上下游数据</span>
            </el-menu-item>
            <el-menu-item v-if="enterpriseInfo.type === 'downstream'" index="/enterprise/batch">
              <el-icon><Box /></el-icon>
              <span>批次管理</span>
            </el-menu-item>
            <el-menu-item index="/enterprise/emergency-response">
              <el-icon><Warning /></el-icon>
              <span>应急响应</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 快捷操作按钮（悬浮） -->
    <div class="quick-actions">
      <el-button
        type="primary"
        :icon="Edit"
        circle
        size="large"
        @click="$router.push('/enterprise/report')"
        title="数据上报"
      />
      <el-button
        type="success"
        :icon="View"
        circle
        size="large"
        @click="$router.push('/enterprise/upstream-downstream')"
        title="上下游数据"
      />
      <el-button
        v-if="enterpriseInfo.type === 'midstream'"
        type="warning"
        :icon="Calendar"
        circle
        size="large"
        @click="handleProductionPlan"
        title="生产计划"
      />
      <el-button
        v-if="enterpriseInfo.type === 'downstream'"
        type="info"
        :icon="Aim"
        circle
        size="large"
        @click="$router.push('/enterprise/batch')"
        title="二维码生成"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataBoard,
  Document,
  Warning,
  Edit,
  Connection,
  Box,
  View,
  Calendar,
  Aim
} from '@element-plus/icons-vue'
import { getCurrentEnterprise, setCurrentEnterpriseType } from '@/utils/api'

const router = useRouter()
const activeMenu = ref('/enterprise/dashboard')
const unreadAlerts = ref(0)
const enterpriseInfo = ref({
  id: '',
  name: '',
  type: '',
  avatar: ''
})

const getEnterpriseTypeName = (type) => {
  const typeMap = {
    upstream: '上游企业',
    midstream: '中游企业',
    downstream: '下游企业'
  }
  return typeMap[type] || ''
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('账号信息功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'message':
      ElMessage.info('消息通知功能开发中')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        router.push('/consumer')
        ElMessage.success('已退出登录')
      })
      break
  }
}

const handleProductionPlan = () => {
  ElMessage.info('生产计划编辑功能开发中')
}

const handleTypeChange = (type) => {
  setCurrentEnterpriseType(type)
  enterpriseInfo.value.type = type
  // 触发页面重新加载数据
  window.location.reload()
}

onMounted(async () => {
  const info = await getCurrentEnterprise()
  enterpriseInfo.value = info
  // 根据当前路由设置激活菜单
  activeMenu.value = router.currentRoute.value.path || '/enterprise/dashboard'
})
</script>

<style scoped>
.enterprise-layout {
  height: 100vh;
  overflow: hidden;
}

.header {
  background: #409eff;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.enterprise-name {
  font-weight: 500;
}

.enterprise-type {
  font-size: 12px;
  opacity: 0.8;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.alert-badge {
  margin-left: auto;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}

.quick-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.quick-actions .el-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
