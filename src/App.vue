<template>
  <div id="app">
    <!-- 路由出口：所有页面都在这里渲染 -->
    <router-view />
  </div>
</template>

<script setup>
// 无需任何逻辑，路由会自动处理页面跳转
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  min-height: 100vh;
}
</style>