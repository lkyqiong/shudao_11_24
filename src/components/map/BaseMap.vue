<template>
  <div ref="mapContainer" class="map-container">
    <!-- 热力图控制面板 -->
    <div v-if="showHeatmapControl" class="heatmap-control">
      <button 
        class="heatmap-toggle"
        :class="{ active: showHeatmap }"
        @click="toggleHeatmap"
        :title="showHeatmap ? '关闭热力图' : '打开热力图'"
      >
        <span class="heatmap-icon">🔥</span>
        <span class="heatmap-label">热力图</span>
      </button>
      
      <!-- 热力图选项 -->
      <div v-if="showHeatmap" class="heatmap-options">
        <div class="heatmap-type-selector">
          <label>热力图类型:</label>
          <select v-model="selectedHeatmapType" class="type-select">
            <option value="combined">全部数据</option>
            <option value="poetry">诗词分布</option>
            <option value="intangible">非遗分布</option>
            <option value="history">历史分布</option>
          </select>
        </div>
        
        <div class="heatmap-intensity">
          <label>热力强度:</label>
          <div class="intensity-slider">
            <input 
              type="range" 
              v-model.number="heatmapIntensity" 
              min="5" 
              max="25" 
              step="1"
              @input="updateHeatmap"
            >
            <span class="intensity-value">{{ heatmapIntensity }}</span>
          </div>
        </div>
        
        <div class="heatmap-opacity">
          <label>透明度:</label>
          <div class="opacity-slider">
            <input 
              type="range" 
              v-model.number="heatmapOpacity" 
              min="0.1" 
              max="1" 
              step="0.1"
              @input="updateHeatmap"
            >
            <span class="opacity-value">{{ heatmapOpacity.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import { fromLonLat, toLonLat } from 'ol/proj';
  import { apply } from 'ol-mapbox-style';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import Feature from 'ol/Feature';
  import Point from 'ol/geom/Point';
  import LineString from 'ol/geom/LineString';
  import { Icon, Style, Stroke } from 'ol/style';
  import Heatmap from 'ol/layer/Heatmap'; // 导入热力图
  import { unByKey } from 'ol/Observable';

  // 通用标记点接口（所有数据类型都有经纬度）
  interface MarkerData {
    id: number | string;
    name: string;
    longitude: number;
    latitude: number;
    [key: string]: any; // 其他属性
  }

  // 热力图数据接口
  interface HeatmapDataPoint {
    longitude: number;
    latitude: number;
    intensity?: number;
    type?: 'poetry' | 'intangible' | 'history';
  }

  // 路线接口（新增）
  interface RouteData {
    id: string;
    color: string;
    points: Array<{ longitude: number; latitude: number }>;
  }

  /**
   * BaseMap 组件
   * 基于 OpenLayers 框架集成 Mapbox 底图的通用地图组件
   */

  // Props 定义
  interface Props {
    // 地图初始中心点 [经度, 纬度]，默认为四川成都
    center?: [number, number];
    // 地图初始缩放级别，默认为 7
    zoom?: number;
    // 地图最小缩放级别
    minZoom?: number;
    // 地图最大缩放级别
    maxZoom?: number;
    // 标记点数据（通用）
    markers?: MarkerData[];
    // 是否显示热力图控制
    showHeatmapControl?: boolean;
    // 热力图数据
    heatmapData?: HeatmapDataPoint[];
    // 路线数据（新增）
    routes?: RouteData[];
  }

  const props = withDefaults(defineProps<Props>(), {
    center: () => [104.066, 30.572], // 成都坐标
    zoom: 7,
    minZoom: 3,
    maxZoom: 18,
    markers: () => [],
    showHeatmapControl: true,
    heatmapData: () => [],
    routes: () => [],
  });

  // Mapbox 配置
  const MAPBOX_TOKEN =
    'pk.eyJ1IjoiaG9wZWxlZTEyMTIiLCJhIjoiY203YmEyMzZyMDA1ZDJwcTRkYno0MGo5cSJ9.sgPdR7PFyGTpfYiqEczuzw';
  const MAPBOX_STYLE_URL =
    'mapbox://styles/hopelee1212/cm7j78t0x005g01r4hj8nadpn/draft';

  // 响应式引用
  const mapContainer = ref<HTMLDivElement>();
  const mapInstance = ref<Map>();
  const markerLayer = ref<VectorLayer<VectorSource>>();
  const heatmapLayer = ref<Heatmap | null>(null);
  const routeLayer = ref<VectorLayer<VectorSource>>();

  // 热力图状态
  const showHeatmap = ref(false);
  const selectedHeatmapType = ref<'combined' | 'poetry' | 'intangible' | 'history'>('combined');
  const heatmapIntensity = ref(15); // 热力强度，控制点的大小和模糊程度
  const heatmapOpacity = ref(0.7); // 透明度

  // Emit 事件（新增 mapClick）
  const emit = defineEmits<{
    markerClick: [data: MarkerData];
    mapClick: [coordinate: { longitude: number; latitude: number }];
  }>();

  /**
   * 过滤热力图数据
   */
  const filteredHeatmapData = computed(() => {
    if (!props.heatmapData || props.heatmapData.length === 0) {
      return [];
    }
    
    if (selectedHeatmapType.value === 'combined') {
      return props.heatmapData;
    }
    
    return props.heatmapData.filter(item => item.type === selectedHeatmapType.value);
  });

  /**
   * 创建标记点图层
   */
  function createMarkerLayer(markers: MarkerData[]): VectorLayer<VectorSource> {
    const features = markers.map((marker) => {
      // 创建点要素
      const feature = new Feature({
        geometry: new Point(fromLonLat([marker.longitude, marker.latitude])),
      });

      // 将数据存储在 feature 的属性中
      feature.setProperties({
        data: marker,
      });

      return feature;
    });

    // 创建矢量数据源
    const vectorSource = new VectorSource({
      features: features,
    });

    // 创建标记点样式
    const markerStyle = new Style({
      image: new Icon({
        src: new URL('@/assets/images/marker.jpg', import.meta.url).href,
        scale: 0.5, // 缩放图标大小
        anchor: [0.5, 1], // 锚点位置（底部中心）
      }),
    });

    // 创建矢量图层
    const layer = new VectorLayer({
      source: vectorSource,
      style: markerStyle,
      zIndex: 100, // 确保标记在底图之上
    });

    return layer;
  }

  /**
   * 创建热力图图层
   */
  function createHeatmapLayer(data: HeatmapDataPoint[]): Heatmap {
    // 创建热力图数据源
    const features = data.map(item => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([item.longitude, item.latitude])),
      });
      
      // 设置权重（热力强度）
      feature.set('weight', item.intensity || 1);
      
      return feature;
    });

    const vectorSource = new VectorSource({
      features: features,
    });

    // 根据数据类型选择颜色渐变
    const getColorGradient = () => {
      const unifiedColors = ['#00f', '#0ff', '#0f0', '#ff0', '#f00']; // 蓝→青→绿→黄→红
      // 所有数据类型都使用相同的颜色渐变
      return unifiedColors;
    };

    // 创建热力图图层
    return new Heatmap({
      source: vectorSource,
      blur: heatmapIntensity.value, // 模糊半径
      radius: heatmapIntensity.value / 2, // 点半径
      opacity: heatmapOpacity.value, // 透明度
      gradient: getColorGradient(), // 颜色渐变
      zIndex: 50, // 热力图在标记点之下
    });
  }

  /**
   * 更新热力图
   */
  function updateHeatmap() {
    if (!mapInstance.value) return;

    // 移除现有的热力图图层
    if (heatmapLayer.value) {
      mapInstance.value.removeLayer(heatmapLayer.value);
      heatmapLayer.value = null;
    }

    // 如果需要显示热力图且有数据
    if (showHeatmap.value && filteredHeatmapData.value.length > 0) {
      try {
        heatmapLayer.value = createHeatmapLayer(filteredHeatmapData.value);
        mapInstance.value.addLayer(heatmapLayer.value);
        
        console.log(`🔥 热力图已更新: ${filteredHeatmapData.value.length} 个数据点，类型: ${selectedHeatmapType.value}`);
      } catch (error) {
        console.error('创建热力图失败:', error);
      }
    }
  }

  /**
   * 切换热力图显示
   */
  function toggleHeatmap() {
    showHeatmap.value = !showHeatmap.value;
    updateHeatmap();
  }

  /**
   * 更新地图上的标记点
   */
  function updateMarkers(markers: MarkerData[]) {
    if (!mapInstance.value) return;

    // 移除旧的标记图层
    if (markerLayer.value) {
      mapInstance.value.removeLayer(markerLayer.value);
    }

    // 创建并添加新的标记图层
    if (markers && markers.length > 0) {
      markerLayer.value = createMarkerLayer(markers);
      mapInstance.value.addLayer(markerLayer.value);
      console.log(`✅ 已在地图上添加 ${markers.length} 个标记点`);
    }
  }

  /**
   * 创建路线图层（新增：绘制连线）
   */
  function createRouteLayer(routes: RouteData[]): VectorLayer<VectorSource> {
    const features: Feature[] = [];

    routes.forEach((route) => {
      if (route.points.length < 2) return;

      const coordinates = route.points.map((p) => fromLonLat([p.longitude, p.latitude]));
      const lineFeature = new Feature({
        geometry: new LineString(coordinates),
      });
      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: route.color,
            width: 3,
          }),
        })
      );
      features.push(lineFeature);
    });

    return new VectorLayer({
      source: new VectorSource({ features }),
      zIndex: 50,
    });
  }

  /**
   * 更新地图上的路线（新增）
   */
  function updateRoutes(routes: RouteData[]) {
    if (!mapInstance.value) return;

    if (routeLayer.value) {
      mapInstance.value.removeLayer(routeLayer.value);
    }

    if (routes && routes.length > 0) {
      routeLayer.value = createRouteLayer(routes);
      mapInstance.value.addLayer(routeLayer.value);
      console.log(`✅ 已在地图上添加 ${routes.length} 条路线`);
    }
  }

  /**
   * 设置中心点（新增：供外部调用）
   */
  function setCenter(center: [number, number], zoom?: number) {
    if (!mapInstance.value) return;
    mapInstance.value.getView().animate({
      center: fromLonLat(center),
      zoom: zoom,
      duration: 500,
    });
  }

  // 组件挂载后初始化地图
  onMounted(() => {
    if (!mapContainer.value) return;

    // 创建 OpenLayers 地图实例
    const map = new Map({
      target: mapContainer.value,
      view: new View({
        center: fromLonLat(props.center), // 将经纬度转换为地图投影坐标
        zoom: props.zoom,
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
      }),
    });

    // 应用 Mapbox 样式
    apply(map, MAPBOX_STYLE_URL, {
      accessToken: MAPBOX_TOKEN,
    }).catch((err) => {
      console.error('加载 Mapbox 样式失败:', err);
    });

    mapInstance.value = map;

    // 添加点击事件监听（修改：增加 mapClick 事件）
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const data = feature.getProperties().data as MarkerData;
        if (data) {
          emit('markerClick', data);
          return;
        }
      }

      // 没有点击到标记点，触发 mapClick（新增）
      const lonLat = toLonLat(evt.coordinate);
      emit('mapClick', {
        longitude: lonLat[0],
        latitude: lonLat[1],
      });
    });

    // 初始化路线（新增）
    if (props.routes && props.routes.length > 0) {
      updateRoutes(props.routes);
    }

    // 初始化标记点
    if (props.markers && props.markers.length > 0) {
      updateMarkers(props.markers);
    }

    // 如果有热力图数据，初始化热力图
    if (props.heatmapData && props.heatmapData.length > 0) {
      updateHeatmap();
    }
  });

  // 监听各种变化
  watch(
    () => props.markers,
    (newMarkers) => {
      updateMarkers(newMarkers);
    }
  );

  // 监听 routes 变化（新增）
  watch(
    () => props.routes,
    (newRoutes) => {
      updateRoutes(newRoutes);
    },
    { deep: true }
  );

  watch(
    () => props.heatmapData,
    () => {
      if (showHeatmap.value) {
        updateHeatmap();
      }
    }
  );

  watch(
    [showHeatmap, selectedHeatmapType, filteredHeatmapData],
    () => {
      updateHeatmap();
    }
  );

  // 组件卸载前清理地图实例
  onUnmounted(() => {
    if (mapInstance.value) {
      mapInstance.value.setTarget(undefined);
      mapInstance.value = undefined;
    }
  });

  // 暴露地图实例和方法
  defineExpose({
    map: mapInstance,
    toggleHeatmap,
    updateHeatmap,
    setCenter,
  });
</script>

<style scoped>
  .map-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
  }

  /* 热力图控制面板 */
  .heatmap-control {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .heatmap-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: white;
    border: 2px solid #8c6e50;
    border-radius: 25px;
    color: #8c6e50;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    min-width: 100px;
    justify-content: center;
  }

  .heatmap-toggle:hover {
    background: #f8f5f2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .heatmap-toggle.active {
    background: linear-gradient(135deg, #8c6e50, #a07a64);
    color: white;
    border-color: #8c6e50;
  }

  .heatmap-toggle.active:hover {
    background: linear-gradient(135deg, #a07a64, #8c6e50);
  }

  .heatmap-icon {
    font-size: 1.1rem;
  }

  .heatmap-label {
    font-weight: 600;
  }

  /* 热力图选项面板 */
  .heatmap-options {
    background: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 220px;
    border: 1px solid #e8e8e8;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .heatmap-type-selector,
  .heatmap-intensity,
  .heatmap-opacity {
    margin-bottom: 15px;
  }

  .heatmap-type-selector:last-child,
  .heatmap-intensity:last-child,
  .heatmap-opacity:last-child {
    margin-bottom: 0;
  }

  .heatmap-options label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
  }

  .type-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #333;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-select:focus {
    outline: none;
    border-color: #8c6e50;
    box-shadow: 0 0 0 3px rgba(140, 110, 80, 0.1);
  }

  .intensity-slider,
  .opacity-slider {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .intensity-slider input,
  .opacity-slider input {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: #f0f0f0;
    outline: none;
    -webkit-appearance: none;
  }

  .intensity-slider input::-webkit-slider-thumb,
  .opacity-slider input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #8c6e50;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .intensity-slider input::-moz-range-thumb,
  .opacity-slider input::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #8c6e50;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .intensity-value,
  .opacity-value {
    font-size: 0.85rem;
    color: #666;
    min-width: 30px;
    text-align: right;
    font-weight: 500;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .heatmap-control {
      bottom: 10px;
      right: 10px;
    }
    
    .heatmap-toggle {
      padding: 8px 14px;
      font-size: 0.9rem;
      min-width: 90px;
    }
    
    .heatmap-options {
      padding: 12px;
      min-width: 200px;
    }
  }

  @media (max-width: 480px) {
    .heatmap-control {
      bottom: 8px;
      right: 8px;
    }
    
    .heatmap-toggle {
      padding: 6px 12px;
      font-size: 0.85rem;
      min-width: 80px;
    }
    
    .heatmap-options {
      padding: 10px;
      min-width: 180px;
    }
    
    .heatmap-options label {
      font-size: 0.8rem;
    }
    
    .type-select {
      font-size: 0.8rem;
      padding: 6px 10px;
    }
  }
</style>