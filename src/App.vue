<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
  // App.vue 是应用的根组件，所有路由页面都会在这里渲染
</script>

<style>
  /* ==================== 全局样式重置 ==================== */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    /*overflow-x: hidden;*/
  }

  /* ==================== 全局滚动条样式 ==================== */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
