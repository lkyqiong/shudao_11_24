<template>
  <div class="left-sidebar" :class="{ collapsed: !isVisible }">
    <!-- 左侧箭头控制按钮（行迹篇风格） -->
    <button
      class="toggle-btn left-toggle"
      @click="toggleSidebar"
      :title="isVisible ? '收起' : '展开'"
    >
      {{ isVisible ? '‹' : '›' }}
    </button>

    <!-- 边栏内容 -->
    <div class="sidebar-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  // 边栏是否可见
  const isVisible = ref(false);

  /**
   * 切换边栏显示状态
   */
  const toggleSidebar = () => {
    isVisible.value = !isVisible.value;
  };

  // 暴露控制方法（可选）
  defineExpose({
    isVisible,
    toggleSidebar,
  });
</script>

<style scoped>
  /* ==================== 左侧边栏 ==================== */
  .left-sidebar {
    position: fixed;
    left: 0;
    top: 8vh; /* 顶部导航栏高度 */
    width: 280px;
    height: calc(100vh - 8vh);
    background: rgba(245, 240, 235, 0.95);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
    z-index: 100;
    transition: transform 0.3s ease;
  }

  /* 收起时左移260px，露出20px */
  .left-sidebar.collapsed {
    transform: translateX(-260px);
  }

  .sidebar-inner {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 2vh 1.5vw;
  }

  /* ==================== 切换按钮（行迹篇风格） ==================== */
  .toggle-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(245, 240, 235, 0.95);
    border: 1px solid rgba(90, 144, 144, 0.3);
    color: #5a9090;
    font-size: 14px;
    font-weight: normal;
    width: 20px;
    height: 60px;
    cursor: pointer;
    z-index: 5;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .left-toggle {
    right: -20px;
    border-radius: 0 8px 8px 0;
    border-left: none;
  }

  .toggle-btn:hover {
    background: #5a9090;
    color: white;
  }

  /* ==================== 滚动条样式 ==================== */
  .sidebar-inner::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-inner::-webkit-scrollbar-track {
    background: rgba(200, 180, 150, 0.3);
    border-radius: 3px;
  }

  .sidebar-inner::-webkit-scrollbar-thumb {
    background: rgba(140, 110, 80, 0.5);
    border-radius: 3px;
  }

  .sidebar-inner::-webkit-scrollbar-thumb:hover {
    background: rgba(140, 110, 80, 0.7);
  }
</style>
