<template>
  <div class="route-page">
    <!-- ==================== 顶部导航栏（保持原样） ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <div class="nav-menu">
        <div class="nav-item" @click="goToHeritage">古迹篇</div>
        <div class="nav-item" @click="goToScenery">新景篇</div>
        <div class="nav-item" @click="goToNetwork">脉络篇</div>
        <div class="nav-item active">行迹篇</div>
      </div>

      <div class="header-right">
        <div class="user-icon" @click="goToProfile">👤</div>
        <button class="home-btn" @click="goToHome">首页</button>
      </div>
    </div>

    <!-- ==================== 主内容区域 ==================== -->
    <div class="main-content">
      <!-- 地图 -->
      <div class="map-wrapper" ref="mapContainer">
        <BaseMap 
          ref="baseMapRef"
          :center="[105.5, 32.5]" 
          :zoom="7" 
          :markers="mapMarkers"
          :routes="mapRoutes"
          @markerClick="onMarkerClick"
          @mapClick="onMapClick"
        />
      </div>

      <!-- 左侧面板 -->
      <div class="left-panel" :class="{ collapsed: leftCollapsed }">
        <button class="toggle-btn left-toggle" @click="leftCollapsed = !leftCollapsed">
          {{ leftCollapsed ? '›' : '‹' }}
        </button>
        <div class="panel-inner" v-show="!leftCollapsed">
          <div class="panel-header">
            <h2>蜀道路线</h2>
            <button class="add-btn" @click="openModal">+ 新建</button>
          </div>
          <div class="tabs">
            <button :class="{ active: tab === 'preset' }" @click="tab = 'preset'">经典蜀道</button>
            <button :class="{ active: tab === 'custom' }" @click="tab = 'custom'">我的路线</button>
          </div>
          <div class="route-list">
            <div 
              v-for="r in displayRoutes" 
              :key="r.id" 
              class="route-item" 
              :class="{ active: selectedId === r.id }" 
              @click="selectRoute(r)"
            >
              <span class="color-dot" :style="{ background: r.color }"></span>
              <div class="route-info">
                <div class="route-name">{{ r.name }}</div>
                <div class="route-meta">📍 {{ r.points.length }}个点</div>
              </div>
              <button class="eye-btn" @click.stop="toggleVis(r.id)">
                {{ visIds.includes(r.id) ? '👁' : '👁‍🗨' }}
              </button>
              <button v-if="tab === 'custom'" class="del-btn" @click.stop="delRoute(r.id)">🗑</button>
            </div>
            <div v-if="!displayRoutes.length" class="empty-msg">
              {{ tab === 'preset' ? '暂无预设路线' : '暂无自定义路线，点击新建添加' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel" :class="{ collapsed: rightCollapsed }">
        <button class="toggle-btn right-toggle" @click="rightCollapsed = !rightCollapsed">
          {{ rightCollapsed ? '‹' : '›' }}
        </button>
        <div class="panel-inner" v-show="!rightCollapsed">
          <template v-if="current">
            <div class="detail-head">
              <span class="color-bar" :style="{ background: current.color }"></span>
              <h3>{{ current.name }}</h3>
            </div>
            <p class="desc" v-if="current.description">{{ current.description }}</p>
            
            <div class="stats">
              <div class="stat">
                <strong>{{ current.points.length }}</strong>
                <span>途经点</span>
              </div>
              <div class="stat">
                <strong>{{ totalDist }}</strong>
                <span>公里</span>
              </div>
            </div>

            <div class="selectors">
              <div class="sel-row">
                <label>起点</label>
                <select v-model="startIdx">
                  <option v-for="(p, i) in current.points" :key="i" :value="i">
                    {{ p.name || `点${i + 1}` }}
                  </option>
                </select>
              </div>
              <div class="sel-row">
                <label>终点</label>
                <select v-model="endIdx">
                  <option v-for="(p, i) in current.points" :key="i" :value="i">
                    {{ p.name || `点${i + 1}` }}
                  </option>
                </select>
              </div>
              <div class="range-dist">选段距离: <strong>{{ rangeDist }} km</strong></div>
            </div>

            <div class="elev-section">
              <div class="elev-head">
                <span>海拔剖面</span>
                <button @click="loadElev" :disabled="loadingElev">
                  {{ loadingElev ? '加载中...' : '刷新数据' }}
                </button>
              </div>
              <div class="elev-chart" v-if="elevData.length > 1">
                <svg viewBox="0 0 300 80">
                  <path :d="elevArea" fill="rgba(90,144,144,0.2)" />
                  <path :d="elevPath" fill="none" stroke="#5a9090" stroke-width="2" />
                </svg>
                <div class="elev-labels">
                  <span>{{ minElev }}m</span>
                  <span>{{ maxElev }}m</span>
                </div>
              </div>
              <div v-else class="elev-empty">点击"刷新数据"获取海拔</div>
            </div>

            <div class="actions">
              <button class="act-btn primary" @click="exportKML">📥 导出KML</button>
            </div>
          </template>
          <div v-else class="no-sel">
            <p>👈 请从左侧选择路线查看详情</p>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend" v-if="visRoutes.length && !drawing">
        <div class="legend-title">路线图例</div>
        <div v-for="r in visRoutes" :key="r.id" class="legend-item" @click="selectRoute(r)">
          <span class="leg-color" :style="{ background: r.color }"></span>
          <span>{{ r.name }}</span>
        </div>
      </div>

      <!-- 绘制模式提示条 -->
      <div class="draw-bar" v-if="drawing">
        <span class="draw-icon">📍</span>
        <span class="draw-text">点击地图添加途经点</span>
        <span class="draw-count">已添加 {{ drawPts.length }} 个点</span>
        <button class="draw-btn finish" @click="finishDraw">✓ 完成</button>
        <button class="draw-btn cancel" @click="cancelDraw">✕ 取消</button>
      </div>
    </div>

    <!-- 新建路线弹窗 -->
    <div class="modal-mask" v-if="showModal" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>新建路线</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>路线名称</label>
            <input v-model="newName" placeholder="请输入路线名称" />
          </div>

          <div class="form-group">
            <label>路线颜色</label>
            <div class="colors">
              <span 
                v-for="c in colorOpts" 
                :key="c" 
                class="color-opt" 
                :class="{ sel: newColor === c }"
                :style="{ background: c }"
                @click="newColor = c"
              ></span>
            </div>
          </div>

          <div class="form-group">
            <label>添加方式</label>
            <div class="methods">
              <button :class="{ active: method === 'manual' }" @click="method = 'manual'">
                <span>🖱️</span> 手动点击地图
              </button>
              <button :class="{ active: method === 'kml' }" @click="method = 'kml'">
                <span>📁</span> 上传KML文件
              </button>
            </div>
          </div>

          <div v-if="method === 'kml'" class="upload-box" @click="triggerFileInput">
            <input ref="fileInput" type="file" accept=".kml" style="display:none" @change="onFileChange" />
            <div class="upload-icon">📄</div>
            <p>{{ fileName || '点击选择KML文件' }}</p>
          </div>

          <div v-else class="manual-tip">
            <div class="tip-icon">💡</div>
            <div class="tip-text">
              点击"开始绘制"后，在地图上点击添加途经点位。<br />
              添加完成后点击"完成"按钮保存路线。
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="modal-btn" @click="showModal = false">取消</button>
          <button class="modal-btn primary" @click="confirmNew" :disabled="!newName.trim()">
            {{ method === 'kml' ? '创建路线' : '开始绘制' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import BaseMap from '@/components/map/BaseMap.vue';
import type { RoutePoint, ShuDaoRoute, CustomRoute } from '@/services/routeService';
import {
  getAllShuDaoRoutes,
  getCustomRoutes,
  saveCustomRoute,
  deleteCustomRoute,
  calculateTotalDistance,
  parseKMLFile,
  exportRouteToKML,
  fetchElevationForPoints,
  generateRandomColor,
} from '@/services/routeService';

type Route = ShuDaoRoute | CustomRoute;

const router = useRouter();
const goToHome = () => router.push('/home');
const goToProfile = () => router.push('/profile');
const goToHeritage = () => router.push('/heritage');
const goToScenery = () => router.push('/scenery');
const goToNetwork = () => router.push('/network');

// 获取当前用户名
const username = ref('');
onMounted(() => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    username.value = savedUsername;
  }
  loadData();
});

// Refs
const baseMapRef = ref();
const fileInput = ref<HTMLInputElement>();
const mapContainer = ref<HTMLElement>();

// 面板状态
const leftCollapsed = ref(false);
const rightCollapsed = ref(false);
const tab = ref<'preset' | 'custom'>('preset');

// 路线数据
const presets = ref<ShuDaoRoute[]>([]);
const customs = ref<CustomRoute[]>([]);
const visIds = ref<(string | number)[]>([]);
const selectedId = ref<string | number>('');
const startIdx = ref(0);
const endIdx = ref(0);

// 海拔
const loadingElev = ref(false);
const elevData = ref<number[]>([]);

// 新建弹窗
const showModal = ref(false);
const newName = ref('');
const newColor = ref('#5a9090');
const method = ref<'manual' | 'kml'>('manual');
const fileName = ref('');
const kmlPts = ref<RoutePoint[]>([]);

// 绘制模式
const drawing = ref(false);
const drawPts = ref<RoutePoint[]>([]);

// 颜色选项
const colorOpts = ['#5a9090', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// 计算属性
const allRoutes = computed(() => [...presets.value, ...customs.value]);
const displayRoutes = computed(() => (tab.value === 'preset' ? presets.value : customs.value));
const visRoutes = computed(() => allRoutes.value.filter((r) => visIds.value.includes(r.id)));
const current = computed(() => allRoutes.value.find((r) => r.id === selectedId.value));

const totalDist = computed(() => (current.value ? calculateTotalDistance(current.value.points).toFixed(1) : '0'));

const rangeDist = computed(() => {
  if (!current.value) return '0';
  const s = Math.min(startIdx.value, endIdx.value);
  const e = Math.max(startIdx.value, endIdx.value);
  return calculateTotalDistance(current.value.points.slice(s, e + 1)).toFixed(1);
});

const minElev = computed(() => (elevData.value.length ? Math.round(Math.min(...elevData.value)) : 0));
const maxElev = computed(() => (elevData.value.length ? Math.round(Math.max(...elevData.value)) : 0));

const elevPath = computed(() => {
  if (elevData.value.length < 2) return '';
  const min = minElev.value;
  const max = maxElev.value;
  const range = max - min || 1;
  return elevData.value
    .map((v, i) => {
      const x = (i / (elevData.value.length - 1)) * 300;
      const y = 70 - ((v - min) / range) * 60;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
});

const elevArea = computed(() => {
  if (elevData.value.length < 2) return '';
  return `M0,70 ${elevPath.value.replace('M', 'L')} L300,70 Z`;
});

// 地图标记点
// 地图路线数据（用于连线）
const mapRoutes = computed(() => {
  const routes: Array<{ id: string; color: string; points: Array<{ longitude: number; latitude: number }> }> = [];

  // 可见路线
  visRoutes.value.forEach((r) => {
    if (r.points.length >= 2) {
      routes.push({
        id: r.id,
        color: r.color,
        points: r.points.map((p) => ({ longitude: p.longitude, latitude: p.latitude })),
      });
    }
  });

  // 绘制中的路线
  if (drawing.value && drawPts.value.length >= 2) {
    routes.push({
      id: 'drawing',
      color: newColor.value,
      points: drawPts.value.map((p) => ({ longitude: p.longitude, latitude: p.latitude })),
    });
  }

  return routes;
});

// 地图标记点（显示原始图标）
const mapMarkers = computed(() => {
  const markers: Array<{ id: string; name: string; longitude: number; latitude: number }> = [];

  // 可见路线的点
  visRoutes.value.forEach((r) => {
    r.points.forEach((p, i) => {
      markers.push({
        id: `${r.id}-${i}`,
        name: p.name || `${r.name} - 点${i + 1}`,
        longitude: p.longitude,
        latitude: p.latitude,
      });
    });
  });

  // 绘制中的点
  if (drawing.value) {
    drawPts.value.forEach((p, i) => {
      markers.push({
        id: `draw-${i}`,
        name: `新点位 ${i + 1}`,
        longitude: p.longitude,
        latitude: p.latitude,
      });
    });
  }

  return markers;
});

// 方法
const loadData = async () => {
  presets.value = getAllShuDaoRoutes();
  // 从API获取自定义路线（传递用户名筛选）
  if (username.value) {
    customs.value = await getCustomRoutes(username.value);
  }
  // 默认不显示任何路线，用户点击后才显示
  visIds.value = [];
  // 默认不选中任何路线
  selectedId.value = '';
};

const selectRoute = async (r: Route) => {
  selectedId.value = r.id;
  startIdx.value = 0;
  endIdx.value = r.points.length - 1;
  
  // 先显示预设的高程数据
  elevData.value = r.points.map((p) => p.elevation || 0);
  
  // 添加到可见列表
  if (!visIds.value.includes(r.id)) {
    visIds.value.push(r.id);
  }
  
  // 自动获取真实高程数据
  autoFetchElevation(r);
};

// 自动获取高程（静默获取，不显示loading）
const autoFetchElevation = async (r: Route) => {
  try {
    const data = await fetchElevationForPoints(r.points);
    // 只有当这条路线仍然被选中时才更新
    if (selectedId.value === r.id) {
      elevData.value = data;
    }
  } catch (e) {
    // 静默失败，使用预设值
    console.warn('自动获取高程失败，使用预设值');
  }
};

const toggleVis = (id: string) => {
  const i = visIds.value.indexOf(id);
  if (i >= 0) {
    visIds.value.splice(i, 1);
  } else {
    visIds.value.push(id);
  }
};

const delRoute = async (id: string | number) => {
  if (confirm('确定删除这条路线吗？')) {
    const success = await deleteCustomRoute(Number(id));
    if (success) {
      // 重新加载自定义路线（传递用户名）
      if (username.value) {
        customs.value = await getCustomRoutes(username.value);
      }
      const vi = visIds.value.indexOf(String(id));
      if (vi >= 0) visIds.value.splice(vi, 1);
      if (selectedId.value === String(id)) selectedId.value = '';
    } else {
      alert('删除失败，请重试');
    }
  }
};

const loadElev = async () => {
  if (!current.value || loadingElev.value) return;
  loadingElev.value = true;
  try {
    const data = await fetchElevationForPoints(current.value.points);
    elevData.value = data;
  } catch (e) {
    console.error('获取海拔失败:', e);
  }
  loadingElev.value = false;
};

const exportKML = () => {
  if (!current.value) return;
  const kml = exportRouteToKML(current.value);
  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${current.value.name}.kml`;
  a.click();
  URL.revokeObjectURL(a.href);
};

// 新建路线
const openModal = () => {
  showModal.value = true;
  newName.value = '';
  newColor.value = generateRandomColor();
  method.value = 'manual';
  fileName.value = '';
  kmlPts.value = [];
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = async (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  try {
    kmlPts.value = await parseKMLFile(f);
    fileName.value = f.name;
    if (!newName.value) {
      newName.value = f.name.replace(/\.kml$/i, '');
    }
  } catch {
    alert('KML文件解析失败');
  }
};

const confirmNew = () => {
  if (!newName.value.trim()) return;

  if (method.value === 'kml') {
    if (kmlPts.value.length < 2) {
      alert('请上传包含至少2个点的KML文件');
      return;
    }
    saveNewRoute(kmlPts.value);
  } else {
    // 手动绘制模式
    showModal.value = false;
    drawing.value = true;
    drawPts.value = [];
  }
};

// 地图点击处理 - 通过BaseMap的mapClick事件获取精确坐标
const onMapClick = async (coordinate: { longitude: number; latitude: number }) => {
  if (!drawing.value) return;

  const point: RoutePoint = {
    longitude: coordinate.longitude,
    latitude: coordinate.latitude,
    name: `点位${drawPts.value.length + 1}`,
  };
  
  drawPts.value.push(point);
  
  // 自动获取该点的高程
  fetchSinglePointElevation(drawPts.value.length - 1);
};

// 获取单个点的高程
const fetchSinglePointElevation = async (index: number) => {
  const point = drawPts.value[index];
  if (!point) return;
  
  try {
    const elevations = await fetchElevationForPoints([point]);
    if (elevations.length > 0 && elevations[0] !== undefined) {
      drawPts.value[index] = { ...point, elevation: elevations[0] };
    }
  } catch (e) {
    console.warn('获取高程失败');
  }
};

const finishDraw = async () => {
  if (drawPts.value.length < 2) {
    alert('请至少添加2个点位');
    return;
  }

  // 尝试获取海拔数据
  try {
    const elevs = await fetchElevationForPoints(drawPts.value);
    drawPts.value = drawPts.value.map((p, i) => ({
      ...p,
      elevation: elevs[i],
    }));
  } catch (e) {
    console.warn('获取海拔失败，使用默认值');
  }

  saveNewRoute(drawPts.value);
  drawing.value = false;
  drawPts.value = [];
};

const cancelDraw = () => {
  drawing.value = false;
  drawPts.value = [];
};

const saveNewRoute = async (pts: RoutePoint[]) => {
  const routeData = {
    name: newName.value.trim(),
    description: '',
    points: pts,
  };

  // 保存路线时传递用户名
  const savedRoute = await saveCustomRoute(routeData, username.value);

  if (savedRoute) {
    // 重新加载自定义路线（传递用户名）
    if (username.value) {
      customs.value = await getCustomRoutes(username.value);
    }
    // 添加到可见列表
    visIds.value.push(String(savedRoute.id));
    // 选中新创建的路线
    const newRoute = customs.value.find(r => r.id === savedRoute.id);
    if (newRoute) {
      selectRoute(newRoute);
    }
    showModal.value = false;
    tab.value = 'custom';
  } else {
    alert('保存路线失败，请重试');
  }
};

const onMarkerClick = (marker: any) => {
  console.log('点击标记:', marker);
};
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.route-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* ==================== 顶部导航栏（保持原样式） ==================== */
.header {
  background: #5a9090;
  padding: 1vh 3vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 8vh;
  flex-shrink: 0;
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

/* ==================== 主内容区 ==================== */
.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* ==================== 侧边面板 ==================== */
.left-panel,
.right-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 280px;
  background: rgba(245, 240, 235, 0.95);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 50;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.left-panel {
  left: 0;
  border-right: 1px solid rgba(90, 144, 144, 0.2);
}

.left-panel.collapsed {
  transform: translateX(-260px);
}

.right-panel {
  right: 0;
  border-left: 1px solid rgba(90, 144, 144, 0.2);
}

.right-panel.collapsed {
  transform: translateX(260px);
}

.toggle-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background: rgba(245, 240, 235, 0.95);
  border: 1px solid rgba(90, 144, 144, 0.3);
  cursor: pointer;
  font-size: 14px;
  color: #5a9090;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-toggle {
  right: -20px;
  border-radius: 0 8px 8px 0;
  border-left: none;
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

.panel-inner {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #5a9090;
}

.add-btn {
  background: #5a9090;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #4a7a7a;
}

/* 标签栏 */
.tabs {
  display: flex;
  border-bottom: 2px solid rgba(90, 144, 144, 0.2);
  margin-bottom: 12px;
}

.tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 10px 0;
  cursor: pointer;
  color: #888;
  font-size: 0.9rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tabs button.active {
  color: #5a9090;
  font-weight: 600;
  border-bottom-color: #5a9090;
}

/* 路线列表 */
.route-list {
  flex: 1;
  overflow-y: auto;
}

.route-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.route-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.route-item.active {
  border-color: #5a9090;
  background: rgba(90, 144, 144, 0.1);
}

.color-dot {
  width: 6px;
  height: 32px;
  border-radius: 3px;
  margin-right: 12px;
  flex-shrink: 0;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-meta {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}

.eye-btn,
.del-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.5;
  padding: 4px;
  transition: opacity 0.2s;
}

.eye-btn:hover,
.del-btn:hover {
  opacity: 1;
}

.del-btn:hover {
  color: #ef4444;
}

.empty-msg {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 0.9rem;
}

/* ==================== 右侧详情 ==================== */
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.color-bar {
  width: 5px;
  height: 32px;
  border-radius: 3px;
}

.detail-head h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px;
}

.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat {
  flex: 1;
  background: rgba(90, 144, 144, 0.1);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.stat strong {
  display: block;
  font-size: 1.3rem;
  color: #5a9090;
}

.stat span {
  font-size: 0.75rem;
  color: #888;
}

.selectors {
  margin-bottom: 16px;
}

.sel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sel-row label {
  width: 40px;
  font-size: 0.85rem;
  color: #666;
}

.sel-row select {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid rgba(90, 144, 144, 0.3);
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.sel-row select:focus {
  border-color: #5a9090;
}

.range-dist {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  background: rgba(90, 144, 144, 0.1);
  padding: 8px;
  border-radius: 6px;
}

.range-dist strong {
  color: #5a9090;
}

/* 海拔剖面 */
.elev-section {
  margin-bottom: 16px;
}

.elev-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.elev-head span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.elev-head button {
  padding: 4px 12px;
  border: 1px solid rgba(90, 144, 144, 0.3);
  border-radius: 4px;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  color: #5a9090;
  transition: all 0.2s;
}

.elev-head button:hover:not(:disabled) {
  background: #5a9090;
  color: white;
}

.elev-head button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.elev-chart {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 12px;
}

.elev-chart svg {
  width: 100%;
  height: 80px;
}

.elev-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #888;
  margin-top: 4px;
}

.elev-empty {
  text-align: center;
  color: #999;
  padding: 24px;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.act-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(90, 144, 144, 0.3);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  color: #5a9090;
  transition: all 0.2s;
}

.act-btn:hover {
  background: rgba(90, 144, 144, 0.1);
}

.act-btn.primary {
  background: #5a9090;
  border-color: #5a9090;
  color: white;
}

.act-btn.primary:hover {
  background: #4a7a7a;
}

.no-sel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}

/* ==================== 图例 ==================== */
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.legend-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5a9090;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(90, 144, 144, 0.2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #333;
  padding: 4px 0;
  cursor: pointer;
}

.legend-item:hover {
  color: #5a9090;
}

.leg-color {
  width: 20px;
  height: 4px;
  border-radius: 2px;
}

/* ==================== 绘制模式提示条 ==================== */
.draw-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #5a9090;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.draw-icon {
  font-size: 1.2rem;
}

.draw-text {
  font-size: 0.9rem;
}

.draw-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.draw-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.draw-btn.finish {
  background: white;
  color: #5a9090;
}

.draw-btn.finish:hover {
  background: #f0f0f0;
}

.draw-btn.cancel {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.draw-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ==================== 弹窗 ==================== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  border-radius: 16px;
  width: 420px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #eee;
}

.modal-head h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #5a9090;
}

.colors {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-opt {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.color-opt:hover {
  transform: scale(1.1);
}

.color-opt.sel {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px currentColor;
}

.methods {
  display: flex;
  gap: 12px;
}

.methods button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  transition: all 0.2s;
}

.methods button span {
  font-size: 1.3rem;
}

.methods button:hover {
  border-color: #ccc;
}

.methods button.active {
  border-color: #5a9090;
  background: rgba(90, 144, 144, 0.05);
  color: #5a9090;
}

.upload-box {
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-box:hover {
  border-color: #5a9090;
  background: rgba(90, 144, 144, 0.02);
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.upload-box p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.manual-tip {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(90, 144, 144, 0.08);
  border-radius: 10px;
}

.tip-icon {
  font-size: 1.2rem;
}

.tip-text {
  font-size: 0.85rem;
  color: #5a9090;
  line-height: 1.5;
}

.modal-foot {
  display: flex;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-btn:first-child {
  background: #f5f5f5;
  color: #666;
}

.modal-btn:first-child:hover {
  background: #eee;
}

.modal-btn.primary {
  background: #5a9090;
  color: white;
}

.modal-btn.primary:hover {
  background: #4a7a7a;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 滚动条 */
.panel-inner::-webkit-scrollbar,
.route-list::-webkit-scrollbar {
  width: 6px;
}

.panel-inner::-webkit-scrollbar-track,
.route-list::-webkit-scrollbar-track {
  background: transparent;
}

.panel-inner::-webkit-scrollbar-thumb,
.route-list::-webkit-scrollbar-thumb {
  background: rgba(90, 144, 144, 0.3);
  border-radius: 3px;
}

.panel-inner::-webkit-scrollbar-thumb:hover,
.route-list::-webkit-scrollbar-thumb:hover {
  background: rgba(90, 144, 144, 0.5);
}
</style>