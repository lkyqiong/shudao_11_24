<template>
  <div class="right-sidebar" :class="{ collapsed: !isVisible }">
    <!-- 右侧箭头控制按钮（行迹篇风格） -->
    <button
      class="toggle-btn right-toggle"
      @click="toggleSidebar"
      :title="isVisible ? '收起' : '展开'"
    >
      {{ isVisible ? '›' : '‹' }}
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
  /* ==================== 右侧边栏 ==================== */
  .right-sidebar {
    position: fixed;
    right: 0;
    top: 8vh; /* 顶部导航栏高度 */
    width: 280px;
    height: calc(100vh - 8vh);
    background: rgba(245, 240, 235, 0.95);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.15);
    z-index: 100;
    transition: transform 0.3s ease;
  }

  /* 收起时右移260px，露出20px */
  .right-sidebar.collapsed {
    transform: translateX(260px);
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

  .right-toggle {
    left: -20px;
    border-radius: 8px 0 0 8px;
    border-right: none;
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
    background: rgba(220, 220, 220, 0.3);
    border-radius: 3px;
  }

  .sidebar-inner::-webkit-scrollbar-thumb {
    background: rgba(90, 144, 144, 0.5);
    border-radius: 3px;
  }

  .sidebar-inner::-webkit-scrollbar-thumb:hover {
    background: rgba(90, 144, 144, 0.7);
  }
</style>
