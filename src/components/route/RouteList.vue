<template>
  <div class="route-list">
    <!-- 标题栏 -->
    <div class="list-header">
      <h3 class="title">{{ title }}</h3>
      <div class="header-actions">
        <button
          v-if="showAddButton"
          class="add-btn"
          @click="$emit('add-route')"
          title="新建路线"
        >
          <span class="icon">+</span>
        </button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索路线..."
        class="search-input"
      />
    </div>

    <!-- 路线列表 -->
    <div class="routes-container">
      <div
        v-for="route in filteredRoutes"
        :key="route.id"
        class="route-item"
        :class="{ active: selectedRouteId === route.id }"
        @click="selectRoute(route)"
      >
        <!-- 路线颜色标识 -->
        <div class="route-color" :style="{ backgroundColor: route.color }"></div>

        <!-- 路线信息 -->
        <div class="route-info">
          <div class="route-name">{{ route.name }}</div>
          <div class="route-meta">
            <span v-if="route.difficulty" class="difficulty">
              {{ route.difficulty }}
            </span>
            <span v-if="route.points" class="points-count">
              {{ route.points.length }} 个点位
            </span>
            <span v-if="route.historicalPeriod" class="period">
              {{ route.historicalPeriod }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="route-actions">
          <button
            v-if="route.id && showVisibilityToggle"
            class="action-btn visibility-btn"
            :class="{ hidden: !isRouteVisible(route.id) }"
            @click.stop="toggleVisibility(route.id)"
            :title="isRouteVisible(route.id) ? '隐藏路线' : '显示路线'"
          >
            {{ isRouteVisible(route.id) ? '👁' : '👁‍🗨' }}
          </button>
          <button
            v-if="showDeleteButton"
            class="action-btn delete-btn"
            @click.stop="$emit('delete-route', route.id)"
            title="删除路线"
          >
            🗑
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredRoutes.length === 0" class="empty-state">
        <div class="empty-icon">🛤️</div>
        <div class="empty-text">{{ emptyText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ShuDaoRoute, CustomRoute } from '@/services/routeService';

type RouteItem = ShuDaoRoute | CustomRoute;

const props = withDefaults(
  defineProps<{
    title: string;
    routes: RouteItem[];
    selectedRouteId?: string;
    visibleRouteIds?: string[];
    showAddButton?: boolean;
    showDeleteButton?: boolean;
    showVisibilityToggle?: boolean;
    emptyText?: string;
  }>(),
  {
    showAddButton: false,
    showDeleteButton: false,
    showVisibilityToggle: true,
    emptyText: '暂无路线',
  }
);

const emit = defineEmits<{
  (e: 'select-route', route: RouteItem): void;
  (e: 'toggle-visibility', routeId: string): void;
  (e: 'delete-route', routeId: string): void;
  (e: 'add-route'): void;
}>();

const searchQuery = ref('');

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return props.routes;
  const query = searchQuery.value.toLowerCase();
  return props.routes.filter(
    (route) =>
      route.name.toLowerCase().includes(query) ||
      route.description?.toLowerCase().includes(query)
  );
});

const selectRoute = (route: RouteItem) => {
  emit('select-route', route);
};

const toggleVisibility = (routeId: string) => {
  emit('toggle-visibility', routeId);
};

const isRouteVisible = (routeId: string): boolean => {
  return props.visibleRouteIds?.includes(routeId) ?? true;
};
</script>

<style scoped>
.route-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #5a9090 0%, #4a7c7c 100%);
  color: white;
}

.title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.add-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.search-box {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  border-color: #5a9090;
  box-shadow: 0 0 0 3px rgba(90, 144, 144, 0.1);
}

.routes-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.route-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.route-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.route-item.active {
  border-color: #5a9090;
  background: rgba(90, 144, 144, 0.08);
}

.route-color {
  width: 8px;
  height: 40px;
  border-radius: 4px;
  margin-right: 14px;
  flex-shrink: 0;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.route-meta span {
  font-size: 0.75rem;
  color: #7f8c8d;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.difficulty {
  color: #e67e22 !important;
  background: rgba(230, 126, 34, 0.1) !important;
}

.route-actions {
  display: flex;
  gap: 6px;
  margin-left: 10px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #f0f2f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.visibility-btn:hover {
  background: #e3f2fd;
}

.visibility-btn.hidden {
  opacity: 0.5;
}

.delete-btn:hover {
  background: #ffebee;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #95a5a6;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  font-size: 0.95rem;
  text-align: center;
}

/* 滚动条样式 */
.routes-container::-webkit-scrollbar {
  width: 6px;
}

.routes-container::-webkit-scrollbar-track {
  background: transparent;
}

.routes-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.routes-container::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>