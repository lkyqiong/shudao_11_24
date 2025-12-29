<!-- src/views/heritage/components/HeritageDetailSidebar.vue -->
<template>
  <div class="heritage-detail-sidebar">
    <!-- 没有选中项目时的提示 -->
    <div v-if="!selectedItem" class="no-selection">
      <div class="placeholder-icon">{{ categoryIcon }}</div>
      <h3>点击地图上的{{ categoryName }}标记</h3>
      <p>点击地图上的标记点，查看{{ categoryName }}详细信息</p>
      <div class="category-switch">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          class="category-btn"
          :class="{ active: activeCategory === cat.value }"
          @click="$emit('switch-category', cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>
    
    <!-- 选中项目时的详情 -->
    <div v-else class="detail-content">
      <div class="detail-header">
        <button class="close-btn" @click="$emit('clear-selection')" title="关闭详情">
          ✕
        </button>
        <h3 class="detail-title">{{ selectedItem.name }}</h3>
      </div>
      
      <!-- 动态渲染对应类型的详情 -->
      <div class="detail-body">
        <!-- 诗词类型 -->
        <PoetryDetail 
          v-if="activeCategory === 'poetry'" 
          :poem="selectedItem as Poem" 
        />
        
        <!-- 非遗类型 -->
        <HeritageDetail 
          v-else-if="activeCategory === 'intangible'" 
          :heritage="selectedItem as Heritage" 
        />
        
        <!-- 历史类型 -->
        <HistoryDetail 
          v-else-if="activeCategory === 'history'" 
          :history="selectedItem as History" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Poem, type Heritage, type History } from '@/services/api';
import PoetryDetail from './detail/PoetryDetail.vue';
import HeritageDetail from './detail/HeritageDetail.vue';
import HistoryDetail from './detail/HistoryDetail.vue';

interface Props {
  activeCategory: 'poetry' | 'intangible' | 'history';
  selectedItem: Poem | Heritage | History | null;
  categoryName: string;
  categoryIcon: string;
}

interface Emits {
  (e: 'clear-selection'): void;
  (e: 'switch-category', category: 'poetry' | 'intangible' | 'history'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 类别选项
const categories = [
  { value: 'poetry', label: '诗词' },
  { value: 'intangible', label: '非遗' },
  { value: 'history', label: '历史' }
];
</script>

<style scoped>
.heritage-detail-sidebar {
  height: 100%;
  background: white;
  font-size: 14px;
}

/* 未选中时的提示 */
.no-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-selection h3 {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  color: #333;
}

.no-selection p {
  margin: 0 0 24px 0;
  font-size: 0.9rem;
  color: #999;
  line-height: 1.5;
  max-width: 250px;
}

.category-switch {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.category-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  background: #e0e0e0;
}

.category-btn.active {
  background: #8c6e50;
  color: white;
  font-weight: bold;
}

/* 详情样式 */
.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #8c6e50, #a07a64);
  color: white;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 0;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.detail-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

/* 自定义滚动条 */
.detail-body::-webkit-scrollbar {
  width: 4px;
}

.detail-body::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.detail-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.detail-body::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>