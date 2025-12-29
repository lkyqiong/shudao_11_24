<!-- src/views/heritage/HeritageLayout.vue -->
<template>
  <div class="heritage-page">
    <!-- 顶部导航栏 -->
    <CommonHeader 
      :active-tab="'heritage'"
      :active-sub-tab="activeCategory"
      @go-home="goToHome"
      @go-profile="goToProfile"
      @nav-click="handleNavClick"
      @dropdown-click="handleDropdownClick"
    />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 加载状态只覆盖主内容区域 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载数据中...</div>
        </div>
      </div>
      
      <!-- 左侧：地图区域 -->
      <div class="left-panel">
        <div class="map-container">
          <BaseMap
            :center="[104.066, 30.572]"
            :zoom="7"
            :markers="filteredData"
            :show-heatmap-control="true"
            :heatmap-data="heatmapData"
            @marker-click="handleMarkerClick"
          />
        </div>
      </div>
      
      <!-- 右侧：筛选面板（分为上中下三部分） -->
      <div class="right-panel" :class="{ collapsed: rightPanelCollapsed }">
        <!-- 收起/展开按钮 -->
        <button
          class="toggle-btn right-toggle"
          @click="rightPanelCollapsed = !rightPanelCollapsed"
          :title="rightPanelCollapsed ? '展开' : '收起'"
        >
          {{ rightPanelCollapsed ? '‹' : '›' }}
        </button>

        <!-- 内容容器（处理滚动） -->
        <div class="panel-content">
          <!-- 上部：筛选条件 -->
          <div class="right-top">
            <HeritageFilterPanel
              :active-category="activeCategory"
              :filter-options="filterOptions"
              :filtered-count="filteredData.length"
              :current-filters="filters"
              @category-change="handleCategoryChange"
              @filter-change="handleFilterChange"
              @reset="resetFilters"
            />
          </div>

          <!-- 中部：统计图表 -->
          <div class="right-middle">
            <HeritageChartPanel
              :active-category="activeCategory"
              :filtered-data="filteredData"
              :total-count="filteredData.length"
            />
          </div>

          <!-- 下部：结果列表 -->
          <div class="right-bottom">
            <HeritageListPanel
              :items="limitedItems"
              :selected-item="selectedItem"
              :active-category="activeCategory"
              :has-filters="hasActiveFilters"
              :total-items="filteredData.length"
              @item-click="handleItemClick"
              @view-all="handleViewAll"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 左侧边栏：详情展示 -->
    <LeftSidebar ref="leftSidebarRef">
      <HeritageDetailSidebar
        :active-category="activeCategory"
        :selected-item="selectedItem"
        :category-name="categoryName"
        :category-icon="categoryIcon"
        @clear-selection="clearSelection"
        @switch-category="handleCategoryChange"
      />
    </LeftSidebar>
    
    <!-- 查看全部弹窗 -->
    <ViewAllModal
      :visible="showViewAllModal"
      :items="filteredData"
      :selected-item="selectedItem"
      :active-category="activeCategory"
      :has-filters="hasActiveFilters"
      :filters="filters"
      @close="closeViewAllModal"
      @item-click="handleItemClickFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseMap from '@/components/map/BaseMap.vue';
import LeftSidebar from '@/components/common/LeftSidebar.vue';
import CommonHeader from '@/components/common/Header.vue';

// 导入新组件
import HeritageFilterPanel from './components/HeritageFilterPanel.vue';
import HeritageChartPanel from './components/HeritageChartPanel.vue';
import HeritageListPanel from './components/HeritageListPanel.vue';
import HeritageDetailSidebar from './components/HeritageDetailSidebar.vue';
import ViewAllModal from './components/ViewAllModal.vue'; // 新增导入

// 导入组合式函数
import { useHeritageData } from './composables/useHeritageData';
import { useHeritageFilter } from './composables/useHeritageFilter';

const router = useRouter();

// 使用组合式函数
const {
  allPoems,
  allHeritage,
  allHistory,
  activeCategory,
  currentData,
  loadAllData
} = useHeritageData();

const {
  filters,
  filterData,
  resetFilters
} = useHeritageFilter();

// 本地状态
const loading = ref(false);
const selectedItem = ref<any>(null);
const leftSidebarRef = ref<any>(null);
const showViewAllModal = ref(false); // 控制弹窗显示
const rightPanelCollapsed = ref(true); // 默认收起

// 限制显示的项目数量（主列表只显示前50条）
const INITIAL_MAX_ITEMS = 50;

// 限制显示的项目列表
const limitedItems = computed(() => {
  const data = filteredData.value;
  
  // 如果数据少于限制数量，直接显示全部
  if (data.length <= INITIAL_MAX_ITEMS) {
    return data;
  }
  
  // 否则只显示前INITIAL_MAX_ITEMS条
  return data.slice(0, INITIAL_MAX_ITEMS);
});

// 筛选后的数据
const filteredData = computed(() => {
  const data = currentData.value;
  if (data.length === 0) return [];
  
  return filterData(data, activeCategory.value);
});

// 是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => !!value);
});

// 筛选选项（从前端数据提取）
const filterOptions = computed(() => {
  const data = currentData.value;
  const options = {
    dynasties: [] as string[],
    authors: [] as string[],
    provinces: [] as string[],
    poemtypes: [] as string[],
    types: [] as string[],
    years: [] as string[],
    periods: [] as string[],
    peoples: [] as string[]
  };
  
  if (data.length === 0) return options;
  
  // 提取所有可能的筛选值
  const dynasties = new Set<string>();
  const authors = new Set<string>();
  const provinces = new Set<string>();
  const poemtypes = new Set<string>();
  const types = new Set<string>();
  const years = new Set<string>();
  const periods = new Set<string>();
  const peoples = new Set<string>();
  
  data.forEach(item => {
    if ('dynasty' in item && item.dynasty) dynasties.add(item.dynasty);
    if ('author' in item && item.author) authors.add(item.author);
    if ('province' in item && item.province) provinces.add(item.province);
    if ('poemtype' in item && item.poemtype) poemtypes.add(item.poemtype);
    if ('type' in item && item.type) types.add(item.type);
    if ('rx_time' in item && item.rx_time) {
      const year = new Date(item.rx_time).getFullYear().toString();
      years.add(year);
    }
    if ('period' in item && item.period) periods.add(item.period);
    if ('people' in item && item.people) peoples.add(item.people);
  });
  
  return {
    dynasties: Array.from(dynasties).sort(),
    authors: Array.from(authors).sort(),
    provinces: Array.from(provinces).sort(),
    poemtypes: Array.from(poemtypes).sort(),
    types: Array.from(types).sort(),
    years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
    periods: Array.from(periods).sort(),
    peoples: Array.from(peoples).sort()
  };
});

// 类别名称和图标
const categoryName = computed(() => {
  switch (activeCategory.value) {
    case 'poetry': return '诗词';
    case 'intangible': return '非遗';
    case 'history': return '历史';
    default: return '';
  }
});

const categoryIcon = computed(() => {
  switch (activeCategory.value) {
    case 'poetry': return '📜';
    case 'intangible': return '🎭';
    case 'history': return '🏛️';
    default: return '📍';
  }
});

// 计算热力图数据 - 使用筛选后的数据
const heatmapData = computed(() => {
  const data: Array<{
    longitude: number;
    latitude: number;
    intensity: number;
    type: 'poetry' | 'intangible' | 'history';
  }> = [];
  
  console.log(`🔥 热力图筛选条件:`, filters.value);
  
  // 使用筛选后的诗词数据
  const filteredPoems = filterData(allPoems.value, 'poetry');
  filteredPoems.forEach(poem => {
    const lon = parseFloat(String(poem.longitude));
    const lat = parseFloat(String(poem.latitude));
    
    if (!isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0) {
      data.push({
        longitude: lon,
        latitude: lat,
        intensity: 1.0,
        type: 'poetry'
      });
    }
  });
  
  // 使用筛选后的非遗数据
  const filteredHeritage = filterData(allHeritage.value, 'intangible');
  filteredHeritage.forEach(heritage => {
    const lon = parseFloat(String(heritage.longitude));
    const lat = parseFloat(String(heritage.latitude));
    
    if (!isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0) {
      data.push({
        longitude: lon,
        latitude: lat,
        intensity: 1.0,
        type: 'intangible'
      });
    }
  });
  
  // 使用筛选后的历史数据
  const filteredHistory = filterData(allHistory.value, 'history');
  filteredHistory.forEach(history => {
    const lon = parseFloat(String(history.longitude));
    const lat = parseFloat(String(history.latitude));
    
    if (!isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0) {
      data.push({
        longitude: lon,
        latitude: lat,
        intensity: 1.0,
        type: 'history'
      });
    }
  });
  
  console.log(`🔥 热力图数据更新: ${data.length} 个点 (已应用筛选)`);
  return data;
});

// 事件处理
const handleCategoryChange = (category: 'poetry' | 'intangible' | 'history') => {
  activeCategory.value = category;
  resetFilters();
};

const handleFilterChange = (newFilters: any) => {
  Object.assign(filters.value, newFilters);
};

const handleMarkerClick = (data: any) => {
  selectedItem.value = data;
  openLeftSidebar();
};

const handleItemClick = (item: any) => {
  selectedItem.value = item;
  openLeftSidebar();
};

// 从弹窗点击项目
const handleItemClickFromModal = (item: any) => {
  selectedItem.value = item;
  openLeftSidebar();
};

// 查看全部功能 - 打开弹窗
const handleViewAll = () => {
  showViewAllModal.value = true;
  console.log('打开查看全部弹窗，数据量:', filteredData.value.length);
};

// 关闭查看全部弹窗
const closeViewAllModal = () => {
  showViewAllModal.value = false;
};

const openLeftSidebar = () => {
  if (leftSidebarRef.value) {
    leftSidebarRef.value.isVisible = true;
  }
};

const clearSelection = () => {
  selectedItem.value = null;
};

const handleDropdownClick = (parent: string, child: string) => {
  if (parent === 'heritage') {
    handleCategoryChange(child as 'poetry' | 'intangible' | 'history');
  }
};

// 导航方法
const goToHome = () => router.push('/home');
const goToProfile = () => router.push('/profile');

const handleNavClick = (name: string) => {
  switch (name) {
    case 'scenery':
      router.push('/scenery');
      break;
    case 'network':
      router.push('/network');
      break;
    case 'route':
      router.push('/route');
      break;
  }
};

// 初始化
onMounted(() => {
  initData();
});

// 加载数据
const initData = async () => {
  loading.value = true;
  try {
    await loadAllData();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.heritage-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 0.1vh 0.1vw; /* 与新景篇一致 */
  overflow: hidden; /* 防止外部滚动 */
  position: relative; /* 为加载状态定位 */
}

/* 左侧地图区域 - 占据全宽 */
.left-panel {
  flex: 1;
  width: 100%;
  min-width: 0;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 右侧边栏区域 - fixed定位，不占据布局空间 */
.right-panel {
  position: fixed;
  right: 0;
  top: 8vh; /* 顶部导航栏高度 */
  width: 400px;
  height: calc(100vh - 8vh);
  background: rgba(245, 240, 235, 0.95);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: visible; /* 不裁剪按钮 */

  /* 添加过渡动画 */
  transition: transform 0.3s ease;
}

/* 收起时右移380px，露出20px */
.right-panel.collapsed {
  transform: translateX(380px);
}

/* 内容容器 - 处理滚动 */
.panel-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;

  /* 美化滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f5f5f5;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 切换按钮样式 */
.right-panel .toggle-btn {
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

.right-panel .right-toggle {
  left: -20px;
  border-radius: 8px 0 0 8px;
  border-right: none;
}

.right-panel .toggle-btn:hover {
  background: #5a9090;
  color: white;
}

/* 顶部和中部面板固定高度或最小高度 */
.right-top {
  min-height: 250px;
  flex-shrink: 0;
}

.right-middle {
  min-height: 280px;
  flex-shrink: 0;
}

/* 列表面板占据所有剩余空间 */
.right-bottom {
  flex: 1 1 auto; /* 关键：允许增长和收缩 */
  min-height: 500px;
  overflow: auto; /* 内容超出时显示滚动条 */
}

/* 确保三个面板内部内容也正确滚动 */
.right-top > *,
.right-middle > *,
.right-bottom > * {
  height: 100%;
}

/* 修改加载状态，只覆盖主内容区域 */
.loading-overlay {
  position: absolute; /* 相对于.main-content定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px; /* 可选：圆角效果 */
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8c6e50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-text {
  font-size: 0.9rem;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-height: 800px) {
  .right-panel {
    width: 380px;
  }

  .right-panel.collapsed {
    transform: translateX(360px); /* 380px - 20px */
  }

  .right-top,
  .right-middle,
  .right-bottom {
    min-height: 300px; /* 在小屏幕上减小最小高度 */
  }
}

@media (max-height: 1000px) {
  .right-panel {
    width: 360px;
  }

  .right-panel.collapsed {
    transform: translateX(340px); /* 360px - 20px */
  }

  .right-top {
    min-height: 220px;
  }

  .right-middle {
    min-height: 200px;
  }

  .right-bottom {
    min-height: 500px;
  }
}
</style>