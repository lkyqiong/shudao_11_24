<template>
  <div class="route-detail" v-if="route">
    <!-- 头部信息 -->
    <div class="detail-header" :style="{ borderLeftColor: route.color }">
      <h2 class="route-name">{{ route.name }}</h2>
      <div class="route-badges">
        <span v-if="'difficulty' in route" class="badge difficulty">
          {{ route.difficulty }}
        </span>
        <span v-if="'historicalPeriod' in route" class="badge period">
          {{ route.historicalPeriod }}
        </span>
      </div>
    </div>

    <!-- 描述 -->
    <div class="detail-section">
      <p class="description">{{ route.description || '暂无描述' }}</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ route.points.length }}</div>
        <div class="stat-label">途经点</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalDistance }}</div>
        <div class="stat-label">公里</div>
      </div>
      <div class="stat-item" v-if="elevationRange">
        <div class="stat-value">{{ elevationRange }}</div>
        <div class="stat-label">海拔范围</div>
      </div>
    </div>

    <!-- 沿途亮点 -->
    <div class="detail-section" v-if="'highlights' in route && route.highlights?.length">
      <h4 class="section-title">🏛️ 沿途亮点</h4>
      <div class="highlights-list">
        <span v-for="(highlight, index) in route.highlights" :key="index" class="highlight-tag">
          {{ highlight }}
        </span>
      </div>
    </div>

    <!-- 途经点列表 -->
    <div class="detail-section">
      <h4 class="section-title">📍 途经点位</h4>
      <div class="points-timeline">
        <div
          v-for="(point, index) in route.points"
          :key="index"
          class="point-item"
          @click="$emit('focus-point', point)"
        >
          <div class="point-marker" :style="{ backgroundColor: route.color }">
            {{ index + 1 }}
          </div>
          <div class="point-info">
            <div class="point-name">{{ point.name || `点位 ${index + 1}` }}</div>
            <div class="point-coords">
              {{ point.longitude.toFixed(4) }}, {{ point.latitude.toFixed(4) }}
              <span v-if="point.elevation" class="elevation">
                · {{ point.elevation }}m
              </span>
            </div>
          </div>
          <div v-if="index < route.points.length - 1" class="point-distance">
            {{ getDistanceToNext(index) }} km
          </div>
        </div>
      </div>
    </div>

    <!-- 海拔剖面图 -->
    <div class="detail-section" v-if="hasElevationData">
      <h4 class="section-title">📊 海拔剖面</h4>
      <div class="elevation-chart">
        <svg viewBox="0 0 400 120" class="chart-svg">
          <!-- 背景网格 -->
          <defs>
            <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="route.color" stop-opacity="0.6" />
              <stop offset="100%" :stop-color="route.color" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          
          <!-- 海拔区域 -->
          <path :d="elevationAreaPath" fill="url(#elevationGradient)" />
          
          <!-- 海拔线 -->
          <path :d="elevationLinePath" fill="none" :stroke="route.color" stroke-width="2" />
          
          <!-- 数据点 -->
          <circle
            v-for="(point, index) in elevationPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="route.color"
            class="data-point"
          />
        </svg>
        
        <!-- 图例 -->
        <div class="chart-legend">
          <span>最低: {{ minElevation }}m</span>
          <span>最高: {{ maxElevation }}m</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-btn primary" @click="$emit('export-kml')">
        <span class="btn-icon">📥</span>
        导出KML
      </button>
    </div>
  </div>

  <!-- 空状态 -->
  <div class="empty-detail" v-else>
    <div class="empty-icon">🗺️</div>
    <div class="empty-title">选择一条路线</div>
    <div class="empty-desc">从左侧列表选择一条蜀道路线，查看详细信息</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ShuDaoRoute, CustomRoute, RoutePoint } from '@/services/routeService';
import { calculateDistance, calculateTotalDistance } from '@/services/routeService';

type RouteItem = ShuDaoRoute | CustomRoute;

const props = defineProps<{
  route?: RouteItem;
}>();

defineEmits<{
  (e: 'focus-point', point: RoutePoint): void;
  (e: 'export-kml'): void;
}>();

// 计算总距离
const totalDistance = computed(() => {
  if (!props.route) return 0;
  return calculateTotalDistance(props.route.points);
});

// 获取到下一个点的距离
const getDistanceToNext = (index: number): string => {
  if (!props.route || index >= props.route.points.length - 1) return '0';
  const dist = calculateDistance(
    props.route.points[index],
    props.route.points[index + 1]
  );
  return dist.toFixed(1);
};

// 是否有海拔数据
const hasElevationData = computed(() => {
  return props.route?.points.some((p) => p.elevation !== undefined);
});

// 海拔范围
const elevationRange = computed(() => {
  if (!hasElevationData.value || !props.route) return null;
  const elevations = props.route.points
    .map((p) => p.elevation)
    .filter((e): e is number => e !== undefined);
  if (elevations.length === 0) return null;
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  return `${min}-${max}m`;
});

// 最低/最高海拔
const minElevation = computed(() => {
  if (!props.route) return 0;
  const elevations = props.route.points
    .map((p) => p.elevation)
    .filter((e): e is number => e !== undefined);
  return elevations.length > 0 ? Math.min(...elevations) : 0;
});

const maxElevation = computed(() => {
  if (!props.route) return 0;
  const elevations = props.route.points
    .map((p) => p.elevation)
    .filter((e): e is number => e !== undefined);
  return elevations.length > 0 ? Math.max(...elevations) : 0;
});

// 海拔图数据点
const elevationPoints = computed(() => {
  if (!props.route || !hasElevationData.value) return [];
  
  const points = props.route.points;
  const elevations = points.map((p) => p.elevation || 0);
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const range = max - min || 1;
  
  const chartWidth = 400;
  const chartHeight = 100;
  const padding = 10;
  
  return points.map((point, index) => {
    const x = padding + (index / (points.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((point.elevation || 0) - min) / range * (chartHeight - 2 * padding);
    return { x, y, elevation: point.elevation };
  });
});

// 海拔线路径
const elevationLinePath = computed(() => {
  if (elevationPoints.value.length < 2) return '';
  return elevationPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
});

// 海拔区域路径
const elevationAreaPath = computed(() => {
  if (elevationPoints.value.length < 2) return '';
  const points = elevationPoints.value;
  const chartHeight = 100;
  const padding = 10;
  const bottomY = chartHeight - padding;
  
  let path = `M ${points[0].x} ${bottomY}`;
  points.forEach((p) => {
    path += ` L ${p.x} ${p.y}`;
  });
  path += ` L ${points[points.length - 1].x} ${bottomY} Z`;
  
  return path;
});
</script>

<style scoped>
.route-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.98);
}

.detail-header {
  border-left: 5px solid;
  padding-left: 16px;
  margin-bottom: 20px;
}

.route-name {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.route-badges {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.difficulty {
  background: rgba(230, 126, 34, 0.15);
  color: #e67e22;
}

.badge.period {
  background: rgba(90, 144, 144, 0.15);
  color: #5a9090;
}

.detail-section {
  margin-bottom: 24px;
}

.description {
  color: #5a6c7d;
  line-height: 1.7;
  font-size: 0.95rem;
  margin: 0;
}

.section-title {
  margin: 0 0 14px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #34495e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-top: 4px;
}

.highlights-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-tag {
  background: linear-gradient(135deg, #5a9090 0%, #4a8080 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.points-timeline {
  position: relative;
}

.point-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.point-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.point-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.point-info {
  flex: 1;
  min-width: 0;
}

.point-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.point-coords {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-top: 2px;
}

.elevation {
  color: #27ae60;
  font-weight: 500;
}

.point-distance {
  font-size: 0.75rem;
  color: #5a9090;
  font-weight: 600;
  background: rgba(90, 144, 144, 0.1);
  padding: 4px 8px;
  border-radius: 10px;
}

.elevation-chart {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.chart-svg {
  width: 100%;
  height: 120px;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 6;
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f0f2f5;
  color: #5a6c7d;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.primary {
  background: linear-gradient(135deg, #5a9090 0%, #4a7c7c 100%);
  color: white;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 空状态 */
.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #95a5a6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 0.9rem;
  max-width: 200px;
}

/* 滚动条 */
.route-detail::-webkit-scrollbar {
  width: 6px;
}

.route-detail::-webkit-scrollbar-track {
  background: transparent;
}

.route-detail::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
</style>