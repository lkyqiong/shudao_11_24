<!-- src/views/heritage/components/HeritageListPanel.vue -->
<template>
  <div class="list-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="panel-icon">📋</span>
        筛选结果
        <span class="list-count">({{ items.length }})</span>
      </h3>
      <div class="list-actions">
        <button 
          class="action-btn" 
          :class="{ active: sortBy === 'name' }"
          @click="changeSort('name')"
          title="按名称排序"
        >
          A-Z
        </button>
        <button 
          class="action-btn" 
          :class="{ active: sortBy === 'id' }"
          @click="changeSort('id')"
          title="按ID排序"
        >
          ID
        </button>
      </div>
    </div>
    
    <div class="list-container">
      <div v-if="items.length === 0" class="empty-list">
        <div class="empty-icon">📄</div>
        <div class="empty-text">暂无数据</div>
        <div v-if="hasFilters" class="empty-hint">请调整筛选条件</div>
        <div v-else class="empty-hint">选择数据类型开始探索</div>
      </div>
      
      <div v-else class="list-items">
        <div 
          v-for="item in sortedItems" 
          :key="item.id"
          class="list-item"
          :class="{ active: selectedItem?.id === item.id }"
          @click="handleItemClick(item)"
        >
          <div class="item-header">
            <div class="item-type">{{ getItemType(item) }}</div>
            <div class="item-id">#{{ item.id }}</div>
          </div>
          <div class="item-title">{{ item.name }}</div>
          <div class="item-subtitle">{{ getItemSubtitle(item) }}</div>
          <div class="item-meta">
            <div class="item-location">
              <span class="location-icon">📍</span>
              {{ getItemLocation(item) }}
            </div>
            <div class="item-tags">
              <span v-for="tag in getItemTags(item)" :key="tag" class="item-tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="list-footer" v-if="items.length > 0">
        <div class="pagination-info">
            显示 1-{{ items.length }} 条，共 {{ totalItems }} 条
        </div>
        <div class="view-more" v-if="items.length < totalItems">
            <button @click="handleViewAll">
            查看全部 ({{ totalItems }} 条)
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Poem, Heritage, History } from '@/services/api';

interface Props {
  items: (Poem | Heritage | History)[];
  selectedItem: Poem | Heritage | History | null;
  activeCategory: 'poetry' | 'intangible' | 'history';
  hasFilters: boolean;
  totalItems?: number; // 添加总项目数属性
}

// 设置默认值
const props = withDefaults(defineProps<Props>(), {
  totalItems: undefined
});

// 计算总项目数
const actualTotalItems = computed(() => {
  return props.totalItems !== undefined ? props.totalItems : props.items.length;
});

interface Emits {
  (e: 'item-click', item: Poem | Heritage | History): void;
  (e: 'view-all'): void;
}

// const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const sortBy = ref<'name' | 'id'>('id');

// 排序后的项目
const sortedItems = computed(() => {
  const items = [...props.items];
  
  if (sortBy.value === 'name') {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    return items.sort((a, b) => Number(a.id) - Number(b.id));
  }
});

// 获取项目类型
const getItemType = (item: any): string => {
  if ('dynasty' in item) return '诗词';
  if ('rx_time' in item) return '非遗';
  if ('period' in item) return '历史';
  return '条目';
};

// 获取项目副标题
const getItemSubtitle = (item: any): string => {
  if (props.activeCategory === 'poetry') {
    return `${item.author || '未知'} · ${item.dynasty || '未知'}`;
  } else if (props.activeCategory === 'intangible') {
    return `${item.type || '未知类别'} · ${item.rx_time ? new Date(item.rx_time).getFullYear() + '年' : '未知时间'}`;
  } else if (props.activeCategory === 'history') {
    return `${item.people || '未知人物'} · ${item.period || '未知'}`;
  }
  return '';
};

// 获取项目位置
const getItemLocation = (item: any): string => {
  const parts = [];
  if (item.province) parts.push(item.province);
  if (item.city) parts.push(item.city);
  return parts.join(' · ') || '未知地点';
};

// 获取项目标签
const getItemTags = (item: any): string[] => {
  const tags: string[] = [];
  
  if (props.activeCategory === 'poetry') {
    if (item.poemtype) tags.push(item.poemtype);
    if (item.keywords) {
      const keywords = item.keywords.split(' ').slice(0, 2);
      tags.push(...keywords.filter((k: string) => k && k.trim()));
    }
  } else if (props.activeCategory === 'intangible') {
    if (item.property) tags.push(item.property);
  }
  
  return tags.slice(0, 3);
};

const handleItemClick = (item: any) => {
  emit('item-click', item);
};

const changeSort = (type: 'name' | 'id') => {
  sortBy.value = type;
};

const handleViewAll = () => {
  emit('view-all');
};
</script>

<style scoped>
.list-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  height: 100%; /* 关键：继承父容器高度 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden; /* 防止溢出 */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.list-count {
  font-size: 0.9rem;
  color: #1890ff;
  font-weight: 600;
  margin-left: 4px;
}

.list-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 4px 8px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e8e8e8;
}

.action-btn.active {
  background: #8c6e50;
  border-color: #8c6e50;
  color: white;
}

.list-container {
  flex: 1; /* 列表占据主要空间 */
  overflow-y: auto; /* 列表内部滚动 */
  margin: 0 -4px 0 0;
  padding-right: 4px;
}

.empty-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  margin-bottom: 8px;
  color: #666;
}

.empty-hint {
  font-size: 0.85rem;
  text-align: center;
  max-width: 200px;
  line-height: 1.4;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.list-item:hover {
  background: #fafafa;
  border-color: #d9d9d9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.list-item.active {
  background: #e6f7ff;
  border-color: #91d5ff;
  border-left: 4px solid #1890ff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.item-type {
  font-size: 0.75rem;
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.item-id {
  font-size: 0.75rem;
  color: #999;
}

.item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-subtitle {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #999;
}

.location-icon {
  font-size: 0.7rem;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-tag {
  font-size: 0.7rem;
  color: #666;
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.list-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.85rem;
  color: #666;
}

.view-more button {
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.view-more button:hover {
  background: #e8e8e8;
  border-color: #bfbfbf;
}

/* 滚动条样式 */
.list-container::-webkit-scrollbar {
  width: 4px;
}

.list-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}

.list-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.list-container::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>