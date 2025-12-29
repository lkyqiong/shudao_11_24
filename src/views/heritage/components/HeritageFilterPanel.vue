<!-- src/views/heritage/components/HeritageFilterPanel.vue -->
<template>
  <div class="filter-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="panel-icon">🔍</span>
        数据筛选
      </h3>
      <button class="reset-btn" @click="handleReset" :disabled="isFiltersEmpty">
        重置
      </button>
    </div>
    
    <div class="filter-content">
      <!-- 类别选择 -->
      <div class="filter-section">
        <h4 class="section-title">数据类型</h4>
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="category-tab"
            :class="{ active: activeCategory === cat.value }"
            @click="handleCategoryChange(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
      
      <!-- 诗词筛选条件 -->
      <div v-if="activeCategory === 'poetry'" class="filter-section">
        <h4 class="section-title">诗词筛选</h4>
        <div class="filter-options">
          <div class="filter-group">
            <label>朝代</label>
            <select v-model="localFilters.dynasty" @change="handleFilterChange">
              <option value="">全部朝代</option>
              <option v-for="dynasty in filterOptions.dynasties" :key="dynasty" :value="dynasty">
                {{ dynasty }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>诗人</label>
            <select v-model="localFilters.author" @change="handleFilterChange">
              <option value="">全部诗人</option>
              <option v-for="author in filterOptions.authors" :key="author" :value="author">
                {{ author }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>诗词类型</label>
            <select v-model="localFilters.poemtype" @change="handleFilterChange">
              <option value="">全部类型</option>
              <option v-for="type in filterOptions.poemtypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 非遗筛选条件 -->
      <div v-else-if="activeCategory === 'intangible'" class="filter-section">
        <h4 class="section-title">非遗筛选</h4>
        <div class="filter-options">
          <div class="filter-group">
            <label>类别</label>
            <select v-model="localFilters.type" @change="handleFilterChange">
              <option value="">全部类别</option>
              <option v-for="type in filterOptions.types" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>申报年份</label>
            <select v-model="localFilters.year" @change="handleFilterChange">
              <option value="">全部年份</option>
              <option v-for="year in filterOptions.years" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 历史筛选条件 -->
      <div v-else-if="activeCategory === 'history'" class="filter-section">
        <h4 class="section-title">历史筛选</h4>
        <div class="filter-options">
          <div class="filter-group">
            <label>时期</label>
            <select v-model="localFilters.period" @change="handleFilterChange">
              <option value="">全部时期</option>
              <option v-for="period in filterOptions.periods" :key="period" :value="period">
                {{ period }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>人物</label>
            <select v-model="localFilters.people" @change="handleFilterChange">
              <option value="">全部人物</option>
              <option v-for="people in filterOptions.peoples" :key="people" :value="people">
                {{ people }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 通用筛选条件 -->
      <div class="filter-section">
        <h4 class="section-title">地区筛选</h4>
        <div class="filter-group">
          <label>省份</label>
          <select v-model="localFilters.province" @change="handleFilterChange">
            <option value="">全部省份</option>
            <option v-for="province in filterOptions.provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="filter-stats">
      <div class="stats-item">
        <span class="stats-label">筛选结果:</span>
        <span class="stats-value">{{ filteredCount }} 条</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">筛选条件:</span>
        <span class="stats-conditions">{{ activeConditionsText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Poem, Heritage, History } from '@/services/api';

interface Props {
  activeCategory: 'poetry' | 'intangible' | 'history';
  filterOptions: {
    dynasties: string[];
    authors: string[];
    provinces: string[];
    poemtypes: string[];
    types: string[];
    years: string[];
    periods: string[];
    peoples: string[];
  };
  filteredCount: number;
  currentFilters: any;
}

interface Emits {
  (e: 'category-change', category: 'poetry' | 'intangible' | 'history'): void;
  (e: 'filter-change', filters: any): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 本地筛选条件副本
const localFilters = ref({ ...props.currentFilters });

// 监听外部筛选条件变化
watch(() => props.currentFilters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// 类别选项
const categories = [
  { value: 'poetry', label: '诗词' },
  { value: 'intangible', label: '非遗' },
  { value: 'history', label: '历史' }
];

// 检查筛选条件是否为空
const isFiltersEmpty = computed(() => {
  return Object.values(localFilters.value).every(value => !value);
});

// 当前激活的筛选条件文本
const activeConditionsText = computed(() => {
  const conditions = [];
  
  if (localFilters.value.dynasty) conditions.push(`朝代: ${localFilters.value.dynasty}`);
  if (localFilters.value.author) conditions.push(`诗人: ${localFilters.value.author}`);
  if (localFilters.value.province) conditions.push(`省份: ${localFilters.value.province}`);
  if (localFilters.value.poemtype) conditions.push(`类型: ${localFilters.value.poemtype}`);
  if (localFilters.value.type) conditions.push(`类别: ${localFilters.value.type}`);
  if (localFilters.value.year) conditions.push(`年份: ${localFilters.value.year}`);
  if (localFilters.value.period) conditions.push(`时期: ${localFilters.value.period}`);
  if (localFilters.value.people) conditions.push(`人物: ${localFilters.value.people}`);
  
  return conditions.length > 0 ? conditions.join(' | ') : '无';
});

const handleCategoryChange = (category: 'poetry' | 'intangible' | 'history') => {
  emit('category-change', category);
};

const handleFilterChange = () => {
  emit('filter-change', { ...localFilters.value });
};

const handleReset = () => {
  localFilters.value = {
    dynasty: '',
    author: '',
    province: '',
    poemtype: '',
    type: '',
    year: '',
    period: '',
    people: ''
  };
  emit('reset');
};
</script>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-icon {
  font-size: 0.9rem;
}

.reset-btn {
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover:not(:disabled) {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.filter-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #f5f5f5;
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.category-tab {
  flex: 1;
  padding: 8px 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tab:hover {
  background: #e8e8e8;
}

.category-tab.active {
  background: #8c6e50;
  color: white;
  font-weight: 500;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-group select:hover {
  border-color: #40a9ff;
}

.filter-group select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.filter-stats {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
}

.stats-label {
  color: #666;
  flex-shrink: 0;
  min-width: 70px;
}

.stats-value {
  color: #1890ff;
  font-weight: 600;
}

.stats-conditions {
  color: #666;
  line-height: 1.4;
  word-break: break-all;
}

/* 滚动条样式 */
.filter-content::-webkit-scrollbar {
  width: 4px;
}

.filter-content::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}

.filter-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.filter-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>