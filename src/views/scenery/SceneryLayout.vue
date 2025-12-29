<!-- src/views/scenery/SceneryLayout.vue（简化版） -->
<template>
  <div class="scenery-page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <div class="nav-menu">
        <div class="nav-item" @click="goToHeritage">古迹篇</div>
        <div class="nav-item active">新景篇</div>
        <div class="nav-item" @click="goToNetwork">脉络篇</div>
        <div class="nav-item" @click="goToRoute">行迹篇</div>
      </div>

      <div class="header-right">
        <div class="user-icon" @click="goToProfile">👤</div>
        <button class="home-btn" @click="goToHome">首页</button>
      </div>
    </div>

    <!-- ==================== 主内容区域 ==================== -->
    <div class="main-content">
      <div class="map-wrapper">
        <BaseMap
          :center="[104.066, 30.572]"
          :zoom="7"
          :markers="scenics"
          @marker-click="handleMarkerClick"
        />
      </div>
    </div>

    <!-- ==================== 左右边栏 ==================== -->
    <LeftSidebar ref="leftSidebarRef">
      <!-- 使用拆分的侧边栏组件 -->
      <ScenicDetailSidebar
        :selected-scenic="selectedScenic"
        @clear-selection="clearSelection"
      />
    </LeftSidebar>

    <RightSidebar ref="rightSidebarRef">
      <!-- 使用打卡和收藏侧边栏组件 -->
      <ScenicActionSidebar
        :selected-scenic="selectedScenic"
        @clear-selection="clearSelection"
      />
    </RightSidebar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseMap from '@/components/map/BaseMap.vue';
import LeftSidebar from '@/components/common/LeftSidebar.vue';
import RightSidebar from '@/components/common/RightSidebar.vue';
import { fetchScenic, type Scenic } from '@/services/api';

// 导入拆分后的侧边栏组件
import ScenicDetailSidebar from './components/ScenicDetailSidebar.vue';
import ScenicActionSidebar from './components/ScenicActionSidebar.vue';

const router = useRouter();

// 景点数据
const scenics = ref<Scenic[]>([]);
// 当前选中的景点
const selectedScenic = ref<Scenic | null>(null);
// 左侧边栏引用
const leftSidebarRef = ref<any>(null);

// 加载景点数据
const loadScenics = async () => {
  scenics.value = await fetchScenic();
};

// 标记点点击事件
const handleMarkerClick = (data: Scenic) => {
  console.log('点击了景点：', data.name, data);
  
  // 直接从已加载的景点数据中查找
  const scenic = scenics.value.find(s => s.id === data.id);
  
  if (scenic) {
    selectedScenic.value = scenic;
    console.log('找到景点数据，推荐理由:', scenic.recommend_reason || '无');
    // console.log('评论分词:', scenic.comment || '无');
  } else {
    // 如果没找到，使用点击的数据（包含基础信息）
    selectedScenic.value = {
      ...data,
      recommend_reason: '',
      comment: ''
    };
  }

  // 关键：点击景点后自动打开左侧边栏
  if (leftSidebarRef.value) {
    leftSidebarRef.value.isVisible = true;
    console.log('左侧边栏已自动打开');
  }
};

// 清空选择
const clearSelection = () => {
  selectedScenic.value = null;
};

// 页面加载时自动获取数据
onMounted(() => {
  loadScenics();
});

// 导航方法
const goToHome = () => router.push('/home');
const goToProfile = () => router.push('/profile');
const goToHeritage = () => router.push('/heritage');
const goToNetwork = () => router.push('/network');
const goToRoute = () => router.push('/route');
</script>

<style scoped>
/* 只保留页面布局样式，侧边栏样式已移到组件中 */
.scenery-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  background: #5a9090;
  padding: 1vh 3vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 8vh;
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
}

.nav-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2vw;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item.active {
  color: white;
  font-weight: bold;
}

.nav-item:hover {
  color: white;
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

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.1vh 0.1vw;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header {
    padding: 1vh 2vw;
  }
  
  .logo-text {
    font-size: 1.5vw;
  }
  
  .nav-item {
    font-size: 1vw;
  }
  
  .search-box {
    width: 15vw;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1.2rem;
  }
  
  .nav-menu {
    gap: 1.5vw;
  }
  
  .nav-item {
    font-size: 0.9rem;
  }
  
  .search-box {
    display: none;
  }
  
  .ai-btn, .user-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .home-btn {
    padding: 0.5vh 1vw;
    font-size: 0.9rem;
  }
}
</style>