<template>
  <div class="route-map-container" ref="mapContainer">
    <div id="route-map" class="map"></div>
    
    <!-- 地图控制按钮 -->
    <div class="map-controls">
      <button class="control-btn" @click="zoomIn" title="放大">+</button>
      <button class="control-btn" @click="zoomOut" title="缩小">−</button>
      <button class="control-btn" @click="resetView" title="重置视图">⟲</button>
    </div>

    <!-- 图例 -->
    <div class="map-legend" v-if="showLegend && visibleRoutes.length > 0">
      <div class="legend-title">图例</div>
      <div
        v-for="route in visibleRoutes"
        :key="route.id"
        class="legend-item"
        @click="flyToRoute(route)"
      >
        <div class="legend-color" :style="{ backgroundColor: route.color }"></div>
        <span class="legend-name">{{ route.name }}</span>
      </div>
    </div>

    <!-- 点位信息弹窗 -->
    <div
      v-if="hoveredPoint"
      class="point-popup"
      :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <div class="popup-title">{{ hoveredPoint.name || '途经点' }}</div>
      <div class="popup-coords">
        {{ hoveredPoint.longitude.toFixed(4) }}, {{ hoveredPoint.latitude.toFixed(4) }}
      </div>
      <div v-if="hoveredPoint.elevation" class="popup-elevation">
        海拔: {{ hoveredPoint.elevation }}m
      </div>
    </div>

    <!-- 绘制模式提示 -->
    <div v-if="isDrawing" class="drawing-overlay">
      <div class="drawing-hint">
        <span class="hint-icon">🖱️</span>
        <span>点击地图添加点位</span>
        <span class="hint-count">已添加 {{ drawingPoints.length }} 个点</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';
import type { ShuDaoRoute, CustomRoute, RoutePoint } from '@/services/routeService';

type RouteItem = ShuDaoRoute | CustomRoute;

const props = withDefaults(
  defineProps<{
    routes: RouteItem[];
    visibleRouteIds: string[];
    selectedRouteId?: string;
    isDrawing?: boolean;
    drawingColor?: string;
    showLegend?: boolean;
    center?: [number, number];
    zoom?: number;
  }>(),
  {
    showLegend: true,
    center: () => [105.5, 32.5],
    zoom: 7,
    drawingColor: '#FF6B6B',
  }
);

const emit = defineEmits<{
  (e: 'map-click', point: RoutePoint): void;
  (e: 'route-click', route: RouteItem): void;
}>();

const mapContainer = ref<HTMLDivElement>();

let map: Map | null = null;
let routeLayer: VectorLayer<VectorSource> | null = null;
let pointsLayer: VectorLayer<VectorSource> | null = null;
let drawingLayer: VectorLayer<VectorSource> | null = null;

const hoveredPoint = ref<RoutePoint | null>(null);
const popupPosition = ref({ x: 0, y: 0 });
const drawingPoints = ref<RoutePoint[]>([]);

const visibleRoutes = computed(() => {
  return props.routes.filter((r) => props.visibleRouteIds.includes(r.id));
});

const initMap = () => {
  if (!mapContainer.value) return;

  const routeSource = new VectorSource();
  routeLayer = new VectorLayer({
    source: routeSource,
    style: (feature) => {
      const color = feature.get('color') || '#5a9090';
      const isSelected = feature.get('routeId') === props.selectedRouteId;
      return new Style({
        stroke: new Stroke({
          color: color,
          width: isSelected ? 6 : 4,
          lineCap: 'round',
          lineJoin: 'round',
        }),
      });
    },
  });

  const pointsSource = new VectorSource();
  pointsLayer = new VectorLayer({
    source: pointsSource,
    style: (feature) => {
      const color = feature.get('color') || '#5a9090';
      const name = feature.get('name');
      const isEndpoint = feature.get('isEndpoint');

      return new Style({
        image: new CircleStyle({
          radius: isEndpoint ? 10 : 7,
          fill: new Fill({ color: color }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
        text: name
          ? new Text({
              text: name,
              offsetY: -18,
              font: 'bold 12px sans-serif',
              fill: new Fill({ color: '#2c3e50' }),
              stroke: new Stroke({ color: 'white', width: 3 }),
            })
          : undefined,
      });
    },
  });

  const drawingSource = new VectorSource();
  drawingLayer = new VectorLayer({
    source: drawingSource,
    style: (feature) => {
      const type = feature.getGeometry()?.getType();
      if (type === 'Point') {
        const index = feature.get('index');
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: props.drawingColor }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
          text: new Text({
            text: String(index + 1),
            font: 'bold 10px sans-serif',
            fill: new Fill({ color: 'white' }),
          }),
        });
      }
      return new Style({
        stroke: new Stroke({
          color: props.drawingColor,
          width: 3,
          lineDash: [10, 10],
        }),
      });
    },
  });

  map = new Map({
    target: 'route-map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlrdW55YW5nZyIsImEiOiJjbTR6cjVwcWcwNHZpMnFzOGdyZjlubHVkIn0.CBdsyN6KHRV7lLpgGbkbxw',
          tileSize: 512,
          maxZoom: 18,
        }),
      }),
      routeLayer,
      pointsLayer,
      drawingLayer,
    ],
    view: new View({
      center: fromLonLat(props.center),
      zoom: props.zoom,
    }),
  });

  map.on('click', (evt) => {
    if (props.isDrawing) {
      const coords = toLonLat(evt.coordinate);
      const point: RoutePoint = {
        longitude: coords[0],
        latitude: coords[1],
      };
      drawingPoints.value.push(point);
      updateDrawingLayer();
      emit('map-click', point);
      return;
    }

    const feature = map?.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      const routeId = feature.get('routeId');
      if (routeId) {
        const route = props.routes.find((r) => r.id === routeId);
        if (route) {
          emit('route-click', route);
        }
      }
    }
  });

  map.on('pointermove', (evt) => {
    if (!map) return;
    const pixel = evt.pixel;
    const feature = map.forEachFeatureAtPixel(pixel, (f) => f);

    if (feature && feature.get('pointData')) {
      hoveredPoint.value = feature.get('pointData');
      popupPosition.value = { x: pixel[0] + 15, y: pixel[1] - 15 };
      mapContainer.value!.style.cursor = 'pointer';
    } else {
      hoveredPoint.value = null;
      mapContainer.value!.style.cursor = props.isDrawing ? 'crosshair' : 'default';
    }
  });

  updateRoutes();
};

const updateRoutes = () => {
  if (!routeLayer || !pointsLayer) return;

  const routeSource = routeLayer.getSource()!;
  const pointsSource = pointsLayer.getSource()!;

  routeSource.clear();
  pointsSource.clear();

  visibleRoutes.value.forEach((route) => {
    if (route.points.length < 2) return;

    const coordinates = route.points.map((p) => fromLonLat([p.longitude, p.latitude]));
    const lineFeature = new Feature({
      geometry: new LineString(coordinates),
      routeId: route.id,
      color: route.color,
    });
    routeSource.addFeature(lineFeature);

    route.points.forEach((point, index) => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        routeId: route.id,
        color: route.color,
        name: point.name,
        index: index,
        isEndpoint: index === 0 || index === route.points.length - 1,
        pointData: point,
      });
      pointsSource.addFeature(pointFeature);
    });
  });
};

const updateDrawingLayer = () => {
  if (!drawingLayer) return;
  const source = drawingLayer.getSource()!;
  source.clear();

  drawingPoints.value.forEach((point, index) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([point.longitude, point.latitude])),
      index: index,
    });
    source.addFeature(feature);
  });

  if (drawingPoints.value.length >= 2) {
    const coordinates = drawingPoints.value.map((p) =>
      fromLonLat([p.longitude, p.latitude])
    );
    const lineFeature = new Feature({
      geometry: new LineString(coordinates),
    });
    source.addFeature(lineFeature);
  }
};

const flyToRoute = (route: RouteItem) => {
  if (!map || route.points.length === 0) return;
  const coordinates = route.points.map((p) => fromLonLat([p.longitude, p.latitude]));
  const extent = new LineString(coordinates).getExtent();
  map.getView().fit(extent, { padding: [80, 80, 80, 80], duration: 1000 });
};

const flyToPoint = (point: RoutePoint) => {
  if (!map) return;
  map.getView().animate({
    center: fromLonLat([point.longitude, point.latitude]),
    zoom: 12,
    duration: 800,
  });
};

const zoomIn = () => {
  if (!map) return;
  const view = map.getView();
  view.animate({ zoom: (view.getZoom() || 7) + 1, duration: 300 });
};

const zoomOut = () => {
  if (!map) return;
  const view = map.getView();
  view.animate({ zoom: (view.getZoom() || 7) - 1, duration: 300 });
};

const resetView = () => {
  if (!map) return;
  map.getView().animate({
    center: fromLonLat(props.center),
    zoom: props.zoom,
    duration: 500,
  });
};

const clearDrawing = () => {
  drawingPoints.value = [];
  if (drawingLayer) {
    drawingLayer.getSource()?.clear();
  }
};

const getDrawingPoints = (): RoutePoint[] => {
  return [...drawingPoints.value];
};

watch(
  () => [props.routes, props.visibleRouteIds, props.selectedRouteId],
  () => updateRoutes(),
  { deep: true }
);

watch(
  () => props.isDrawing,
  (isDrawing) => {
    if (mapContainer.value) {
      mapContainer.value.style.cursor = isDrawing ? 'crosshair' : 'default';
    }
  }
);

watch(() => props.drawingColor, () => updateDrawingLayer());

onMounted(() => initMap());

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
  }
});

defineExpose({
  flyToRoute,
  flyToPoint,
  clearDrawing,
  getDrawingPoints,
  zoomIn,
  zoomOut,
  resetView,
});
</script>

<style scoped>
.route-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a6c7d;
}

.control-btn:hover {
  background: #f8f9fa;
  transform: scale(1.05);
}

.map-legend {
  position: absolute;
  bottom: 30px;
  left: 20px;
  background: white;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.legend-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #5a6c7d;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
  transition: opacity 0.3s;
}

.legend-item:hover {
  opacity: 0.7;
}

.legend-color {
  width: 20px;
  height: 4px;
  border-radius: 2px;
}

.legend-name {
  font-size: 0.85rem;
  color: #2c3e50;
}

.point-popup {
  position: absolute;
  background: white;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 200;
  pointer-events: none;
  min-width: 150px;
}

.popup-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.popup-coords {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.popup-elevation {
  font-size: 0.8rem;
  color: #27ae60;
  margin-top: 4px;
}

.drawing-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.drawing-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #5a9090 0%, #4a7c7c 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
}

.hint-icon {
  font-size: 1.1rem;
}

.hint-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>