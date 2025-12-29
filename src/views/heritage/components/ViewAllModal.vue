<!-- src/views/heritage/components/ViewAllModal.vue -->
<template>
  <div class="view-all-modal" v-if="visible">
    <div class="modal-overlay" @click="closeModal"></div>
    
    <div class="modal-container">
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="modal-icon">📋</span>
          全部数据
          <span class="modal-count">({{ totalItems }} 条)</span>
        </h2>
        <button class="modal-close" @click="closeModal">×</button>
      </div>
      
      <!-- 筛选信息 -->
      <div v-if="activeCategory" class="filter-info">
        <div class="category-badge">
          <span class="category-icon">{{ categoryIcon }}</span>
          <span class="category-name">{{ categoryName }}</span>
        </div>
        <div v-if="hasFilters" class="active-filters">
          <span class="filters-label">筛选条件:</span>
          <span class="filters-text">{{ getFiltersText() }}</span>
        </div>
      </div>
      
      <!-- 数据表格区域 -->
      <div class="modal-content">
        <!-- 分页信息 -->
        <div class="pagination-header">
          <div class="pagination-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
            (每页 {{ pageSize }} 条，共 {{ totalItems }} 条)
          </div>
          <div class="pagination-controls">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="pagination-btn prev"
            >
              上一页
            </button>
            
            <div class="page-numbers">
              <span 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ active: page === currentPage, ellipsis: page === '...' }"
                @click="page !== '...' ? goToPage(page as number) : null"
              >
                {{ page }}
              </span>
            </div>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="pagination-btn next"
            >
              下一页
            </button>
          </div>
        </div>
        
        <!-- 数据列表 -->
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th width="60">ID</th>
                <th width="150">类型</th>
                <th>名称</th>
                <th width="200">详细信息</th>
                <th width="120">位置</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in paginatedData" 
                :key="item.id"
                class="data-row"
                :class="{ selected: selectedItem?.id === item.id }"
                @click="handleRowClick(item)"
              >
                <td class="cell-id">#{{ item.id }}</td>
                <td class="cell-type">
                  <span class="type-badge">{{ getItemType(item) }}</span>
                </td>
                <td class="cell-name">{{ item.name || '未知' }}</td>
                <td class="cell-info">{{ getItemInfo(item) }}</td>
                <td class="cell-location">{{ getItemLocation(item) }}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- 空状态 -->
          <div v-if="paginatedData.length === 0" class="empty-table">
            <div class="empty-icon">📄</div>
            <div class="empty-text">暂无数据</div>
          </div>
        </div>
        
        <!-- 底部信息 -->
        <div class="pagination-footer">
          <div class="page-size-selector">
            <span>每页显示:</span>
            <select v-model="pageSize" @change="resetToFirstPage">
              <option value="20">20 条</option>
              <option value="50">50 条</option>
              <option value="100">100 条</option>
              <option value="200">200 条</option>
            </select>
          </div>
          
          <div class="jump-to-page">
            <span>跳转到:</span>
            <input 
              type="number" 
              v-model.number="jumpPage" 
              min="1" 
              :max="totalPages"
              @keyup.enter="goToPage(jumpPage)"
            />
            <button @click="goToPage(jumpPage)" class="jump-btn">跳转</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  visible: boolean;
  items: any[];
  selectedItem: any;
  activeCategory: 'poetry' | 'intangible' | 'history';
  hasFilters: boolean;
  filters: Record<string, any>;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'close'): void;
  (e: 'item-click', item: any): void;
}

const emit = defineEmits<Emits>();

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(50);
const jumpPage = ref(1);

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.items.length / pageSize.value);
});

// 总项目数
const totalItems = computed(() => {
  return props.items.length;
});

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.items.slice(start, end);
});

// 可见的页码（处理大量分页时的显示）
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    // 总页数小于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 总页数大于7，显示部分页码
    if (current <= 4) {
      // 当前页在前4页
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      // 当前页在后4页
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // 当前页在中间
      pages.push(1);
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages;
});

// 类别名称和图标
const categoryName = computed(() => {
  switch (props.activeCategory) {
    case 'poetry': return '诗词';
    case 'intangible': return '非遗';
    case 'history': return '历史';
    default: return '';
  }
});

const categoryIcon = computed(() => {
  switch (props.activeCategory) {
    case 'poetry': return '📜';
    case 'intangible': return '🎭';
    case 'history': return '🏛️';
    default: return '📍';
  }
});

// 获取项目类型
const getItemType = (item: any): string => {
  if ('dynasty' in item) return '诗词';
  if ('rx_time' in item) return '非遗';
  if ('period' in item) return '历史';
  return '条目';
};

// 获取项目信息
const getItemInfo = (item: any): string => {
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

// 获取筛选条件文本
const getFiltersText = (): string => {
  const filterTexts = [];
  
  if (props.filters.dynasty) filterTexts.push(`朝代: ${props.filters.dynasty}`);
  if (props.filters.author) filterTexts.push(`作者: ${props.filters.author}`);
  if (props.filters.province) filterTexts.push(`省份: ${props.filters.province}`);
  if (props.filters.poemtype) filterTexts.push(`类型: ${props.filters.poemtype}`);
  if (props.filters.type) filterTexts.push(`类别: ${props.filters.type}`);
  if (props.filters.year) filterTexts.push(`年份: ${props.filters.year}`);
  if (props.filters.period) filterTexts.push(`时期: ${props.filters.period}`);
  if (props.filters.people) filterTexts.push(`人物: ${props.filters.people}`);
  
  return filterTexts.join('; ') || '无';
};

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    jumpPage.value = currentPage.value;
    scrollToTop();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    jumpPage.value = currentPage.value;
    scrollToTop();
  }
};

const goToPage = (page: number) => {
  const validPage = Math.max(1, Math.min(page, totalPages.value));
  currentPage.value = validPage;
  jumpPage.value = validPage;
  scrollToTop();
};

const resetToFirstPage = () => {
  currentPage.value = 1;
  jumpPage.value = 1;
};

const scrollToTop = () => {
  const tableContainer = document.querySelector('.data-table-container');
  if (tableContainer) {
    tableContainer.scrollTop = 0;
  }
};

// 行点击事件
const handleRowClick = (item: any) => {
  emit('item-click', item);
};

// 关闭模态框
const closeModal = () => {
  emit('close');
};

// 监听可见性变化，重置分页
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetToFirstPage();
  }
});

// 监听数据变化，重置到第一页
watch(() => props.items, () => {
  resetToFirstPage();
}, { deep: true });
</script>

<style scoped>
.view-all-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #8c6e50 0%, #a07a64 100%);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  font-size: 1.3rem;
}

.modal-count {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 500;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;           
  height: 36px;          
  border-radius: 50%;    
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  /* transform: rotate(90deg); */
}

.filter-info {
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e6f7ff;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #91d5ff;
  color: #1890ff;
  font-weight: 500;
}

.category-icon {
  font-size: 1rem;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.filters-label {
  font-weight: 500;
  color: #333;
}

.filters-text {
  color: #1890ff;
  font-weight: 500;
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pagination-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.pagination-btn:hover:not(:disabled) {
  background: #e8e8e8;
  border-color: #bfbfbf;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.page-number:hover:not(.active):not(.ellipsis) {
  background: #f5f5f5;
  border-color: #bfbfbf;
}

.page-number.active {
  background: #8c6e50;
  border-color: #8c6e50;
  color: white;
  font-weight: 600;
}

.page-number.ellipsis {
  cursor: default;
  border: none;
  background: transparent;
  width: 24px;
}

.data-table-container {
  flex: 1;
  overflow: auto;
  padding: 0 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.data-row {
  transition: all 0.2s;
  cursor: pointer;
}

.data-row:hover {
  background: #fafafa;
}

.data-row.selected {
  background: #e6f7ff;
}

.cell-id {
  font-family: 'Courier New', monospace;
  color: #666;
  font-weight: 500;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.cell-name {
  font-weight: 500;
  color: #1a1a1a;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-info {
  color: #666;
  font-size: 0.9rem;
}

.cell-location {
  color: #666;
  font-size: 0.9rem;
}

.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  color: #666;
}

.pagination-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.page-size-selector select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
}

.jump-to-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.jump-to-page input {
  width: 60px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}

.jump-btn {
  padding: 6px 12px;
  background: #8c6e50;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.jump-btn:hover {
  background: #a07a64;
}
</style>