<!-- src/components/common/Header.vue -->
<template>
  <div class="header">
    <div class="logo-section">
      <div class="logo-icon"></div>
      <div class="logo-text">云游蜀道</div>
    </div>

    <div class="nav-menu">
      <div
        class="nav-item"
        :class="{ active: activeTab === 'heritage' }"
        @click="$emit('nav-click', 'heritage')"
      >
        古迹篇
        <!-- 下拉菜单 -->
        <div v-if="activeTab === 'heritage'" class="dropdown-menu">
          <div
            class="dropdown-item"
            :class="{ active: activeSubTab === 'poetry' }"
            @click.stop="$emit('dropdown-click', 'heritage', 'poetry')"
          >
            诗词
          </div>
          <div
            class="dropdown-item"
            :class="{ active: activeSubTab === 'heritage' }"
            @click.stop="$emit('dropdown-click', 'heritage', 'heritage')"
          >
            非遗
          </div>
          <div
            class="dropdown-item"
            :class="{ active: activeSubTab === 'history' }"
            @click.stop="$emit('dropdown-click', 'heritage', 'history')"
          >
            历史
          </div>
        </div>
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'scenery' }"
        @click="$emit('nav-click', 'scenery')"
      >
        新景篇
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'network' }"
        @click="$emit('nav-click', 'network')"
      >
        脉络篇
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'route' }"
        @click="$emit('nav-click', 'route')"
      >
        行迹篇
      </div>
    </div>

    <div class="header-right">
      <div class="user-icon" @click="$emit('go-profile')">👤</div>
      <button class="home-btn" @click="$emit('go-home')">首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTab?: string;
  activeSubTab?: string;
}

defineProps<Props>();

defineEmits<{
  'go-home': [];
  'go-profile': [];
  'nav-click': [name: string];
  'dropdown-click': [parent: string, child: string];
}>();
</script>

<style scoped>
.header {
  background: #5a9090;
  padding: 1vh 3vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 8vh;
  position: relative;
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1vw;
}

.logo-icon {
  width: 3vw;
  height: 3vw;
  background: white;
  border-radius: 5px;
  background-image: url('@/assets/images/logo.png');
  background-size: cover;
  background-position: center;
}

.logo-text {
  font-size: 1.8vw;
  color: white;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 2.5vw;
  align-items: center;
}

.nav-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2vw;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding: 0.5vh 0;
}

.nav-item.active {
  color: white;
  font-weight: bold;
}

.nav-item:hover {
  color: white;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5vh 0;
  margin-top: 0.5vh;
  min-width: 120px;
  z-index: 1000;
}

.dropdown-item {
  padding: 1vh 1.5vw;
  color: #333;
  font-size: 1vw;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.dropdown-item:hover {
  background: #f0f0f0;
  color: #5a9090;
}

.dropdown-item.active {
  background: #5a9090;
  color: white;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5vw;
}

.ai-btn {
  background: white;
  border-radius: 50%;
  width: 3.5vw;
  height: 3.5vw;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1vw;
  color: #5a9090;
  cursor: pointer;
  font-weight: bold;
}

.search-box {
  width: 20vw;
  padding: 0.8vh 1.5vw;
  border: none;
  border-radius: 25px;
  font-size: 0.9vw;
  outline: none;
}

.user-icon {
  width: 3.5vw;
  height: 3.5vw;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8vw;
  color: #5a9090;
}

.home-btn {
  background: white;
  color: #5a9090;
  padding: 0.8vh 2vw;
  border: none;
  border-radius: 20px;
  font-size: 1vw;
  cursor: pointer;
  font-weight: bold;
}

.home-btn:hover {
  background: #f0f0f0;
}
</style>
