<template>
  <div class="route-editor">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <h3 class="title">{{ isEditing ? '编辑路线' : '新建路线' }}</h3>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <!-- 基本信息表单 -->
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">路线名称 <span class="required">*</span></label>
        <input
          v-model="formData.name"
          type="text"
          class="form-input"
          placeholder="例如：我的蜀道之旅"
        />
      </div>

      <div class="form-group">
        <label class="form-label">路线描述</label>
        <textarea
          v-model="formData.description"
          class="form-textarea"
          placeholder="描述这条路线的特点..."
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">路线颜色</label>
        <div class="color-picker">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-option"
            :class="{ active: formData.color === color }"
            :style="{ backgroundColor: color }"
            @click="formData.color = color"
          ></div>
        </div>
      </div>
    </div>

    <!-- 点位列表 -->
    <div class="points-section">
      <div class="section-header">
        <h4 class="section-title">路线点位</h4>
        <span class="points-count">{{ formData.points.length }} 个点</span>
      </div>

      <!-- 操作提示 -->
      <div class="edit-hint" v-if="isDrawing">
        <div class="hint-icon">🖱️</div>
        <div class="hint-text">点击地图添加点位，或手动输入坐标</div>
        <button class="hint-btn" @click="stopDrawing">完成绘制</button>
      </div>

      <div class="edit-hint" v-else>
        <button class="start-draw-btn" @click="startDrawing">
          <span class="icon">📍</span>
          在地图上绘制
        </button>
      </div>

      <!-- 点位列表 -->
      <div class="points-list" ref="pointsListRef">
        <draggable
          v-model="formData.points"
          item-key="id"
          handle=".drag-handle"
          ghost-class="ghost"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div class="point-item">
              <div class="drag-handle" title="拖拽排序">⋮⋮</div>
              <div class="point-index">{{ index + 1 }}</div>
              <div class="point-inputs">
                <input
                  v-model="element.name"
                  type="text"
                  class="point-name-input"
                  placeholder="点位名称"
                />
                <div class="coord-inputs">
                  <input
                    v-model.number="element.longitude"
                    type="number"
                    step="0.0001"
                    class="coord-input"
                    placeholder="经度"
                  />
                  <input
                    v-model.number="element.latitude"
                    type="number"
                    step="0.0001"
                    class="coord-input"
                    placeholder="纬度"
                  />
                  <input
                    v-model.number="element.elevation"
                    type="number"
                    class="coord-input elevation-input"
                    placeholder="海拔(m)"
                  />
                </div>
              </div>
              <button
                class="remove-btn"
                @click="removePoint(index)"
                title="删除点位"
              >
                ✕
              </button>
            </div>
          </template>
        </draggable>

        <!-- 空状态 -->
        <div v-if="formData.points.length === 0" class="empty-points">
          <div class="empty-icon">📍</div>
          <div class="empty-text">暂无点位</div>
          <div class="empty-hint">点击上方按钮在地图上绘制，或手动添加点位</div>
        </div>
      </div>

      <!-- 手动添加点位 -->
      <button class="add-point-btn" @click="addEmptyPoint">
        <span class="icon">+</span>
        添加点位
      </button>
    </div>

    <!-- KML导入 -->
    <div class="import-section">
      <div class="section-header">
        <h4 class="section-title">导入KML文件</h4>
      </div>
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <input
          ref="fileInputRef"
          type="file"
          accept=".kml,.kmz"
          style="display: none"
          @change="handleFileSelect"
        />
        <div class="upload-icon">📁</div>
        <div class="upload-text">点击或拖拽KML文件到此处</div>
        <div class="upload-hint">支持 .kml 格式文件</div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="editor-footer">
      <button class="btn cancel-btn" @click="$emit('close')">取消</button>
      <button
        class="btn save-btn"
        :disabled="!isValid"
        @click="saveRoute"
      >
        {{ isEditing ? '保存修改' : '创建路线' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import type { CustomRoute, RoutePoint } from '@/services/routeService';
import {
  generateRouteId,
  generateRandomColor,
  parseKMLFile,
  saveCustomRoute,
} from '@/services/routeService';

// 简易的拖拽组件（如果没有安装vuedraggable，使用简单列表）
const draggable = {
  props: ['modelValue', 'itemKey', 'handle', 'ghostClass'],
  emits: ['update:modelValue', 'end'],
  template: `
    <div class="draggable-list">
      <slot v-for="(item, index) in modelValue" :element="item" :index="index" name="item"></slot>
    </div>
  `,
};

interface PointWithId extends RoutePoint {
  id: string;
}

const props = defineProps<{
  editRoute?: CustomRoute;
  isDrawing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', route: CustomRoute): void;
  (e: 'start-drawing'): void;
  (e: 'stop-drawing'): void;
  (e: 'points-updated', points: RoutePoint[]): void;
}>();

const fileInputRef = ref<HTMLInputElement>();
const pointsListRef = ref<HTMLDivElement>();

const colorOptions = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

const isEditing = computed(() => !!props.editRoute);

// 生成带ID的点位
const createPointWithId = (point?: Partial<RoutePoint>): PointWithId => ({
  id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  longitude: point?.longitude ?? 0,
  latitude: point?.latitude ?? 0,
  name: point?.name,
  elevation: point?.elevation,
});

// 表单数据
const formData = reactive<{
  name: string;
  description: string;
  color: string;
  points: PointWithId[];
}>({
  name: props.editRoute?.name || '',
  description: props.editRoute?.description || '',
  color: props.editRoute?.color || generateRandomColor(),
  points: props.editRoute?.points.map(createPointWithId) || [],
});

// 表单验证
const isValid = computed(() => {
  return (
    formData.name.trim() !== '' &&
    formData.points.length >= 2 &&
    formData.points.every(
      (p) =>
        !isNaN(p.longitude) &&
        !isNaN(p.latitude) &&
        p.longitude !== 0 &&
        p.latitude !== 0
    )
  );
});

// 监听点位变化，通知父组件更新地图
watch(
  () => formData.points,
  (newPoints) => {
    emit('points-updated', newPoints);
  },
  { deep: true }
);

// 开始绘制
const startDrawing = () => {
  emit('start-drawing');
};

// 停止绘制
const stopDrawing = () => {
  emit('stop-drawing');
};

// 添加空白点位
const addEmptyPoint = () => {
  formData.points.push(createPointWithId());
  nextTick(() => {
    // 滚动到底部
    if (pointsListRef.value) {
      pointsListRef.value.scrollTop = pointsListRef.value.scrollHeight;
    }
  });
};

// 从地图添加点位（由父组件调用）
const addPointFromMap = (point: RoutePoint) => {
  formData.points.push(createPointWithId(point));
};

// 移除点位
const removePoint = (index: number) => {
  formData.points.splice(index, 1);
};

// 拖拽结束
const onDragEnd = () => {
  emit('points-updated', formData.points);
};

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    await importKMLFile(file);
  }
  input.value = ''; // 重置以允许重新选择同一文件
};

// 处理拖放
const handleDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files[0];
  if (file && (file.name.endsWith('.kml') || file.name.endsWith('.kmz'))) {
    await importKMLFile(file);
  }
};

// 导入KML文件
const importKMLFile = async (file: File) => {
  try {
    const points = await parseKMLFile(file);
    if (points.length > 0) {
      formData.points = points.map(createPointWithId);
      // 如果没有设置名称，使用文件名
      if (!formData.name) {
        formData.name = file.name.replace(/\.(kml|kmz)$/i, '');
      }
    }
  } catch (error) {
    console.error('KML导入失败:', error);
    alert('KML文件导入失败，请检查文件格式');
  }
};

// 保存路线
const saveRoute = () => {
  if (!isValid.value) return;

  const route: CustomRoute = {
    id: props.editRoute?.id || generateRouteId(),
    name: formData.name.trim(),
    description: formData.description.trim(),
    color: formData.color,
    points: formData.points.map(({ longitude, latitude, name, elevation }) => ({
      longitude,
      latitude,
      name,
      elevation,
    })),
    createdAt: props.editRoute?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  saveCustomRoute(route);
  emit('save', route);
};

// 暴露方法给父组件
defineExpose({
  addPointFromMap,
});
</script>

<style scoped>
.route-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.editor-header {
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
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.form-section {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #5a9090;
  box-shadow: 0 0 0 3px rgba(90, 144, 144, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 3px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #2c3e50;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.2);
}

.points-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.points-count {
  font-size: 0.8rem;
  color: #7f8c8d;
  background: #f0f2f5;
  padding: 4px 10px;
  border-radius: 12px;
}

.edit-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f4f4 0%, #d4ebeb 100%);
  border-radius: 10px;
  margin-bottom: 12px;
}

.hint-icon {
  font-size: 1.2rem;
}

.hint-text {
  flex: 1;
  font-size: 0.85rem;
  color: #5a9090;
}

.hint-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: #5a9090;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s;
}

.hint-btn:hover {
  background: #4a7c7c;
}

.start-draw-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 2px dashed #5a9090;
  border-radius: 10px;
  background: transparent;
  color: #5a9090;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-draw-btn:hover {
  background: rgba(90, 144, 144, 0.1);
}

.points-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.point-item:hover {
  background: #e9ecef;
}

.point-item.ghost {
  opacity: 0.5;
  background: #e3f2fd;
}

.drag-handle {
  cursor: grab;
  color: #bdc3c7;
  font-size: 1rem;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.point-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #5a9090;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.point-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.point-name-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
}

.coord-inputs {
  display: flex;
  gap: 6px;
}

.coord-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
  min-width: 0;
}

.elevation-input {
  max-width: 70px;
}

.coord-input:focus,
.point-name-input:focus {
  border-color: #5a9090;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #e74c3c;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #ffebee;
}

.empty-points {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #95a5a6;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
  opacity: 0.6;
}

.empty-text {
  font-weight: 600;
  color: #7f8c8d;
}

.empty-hint {
  font-size: 0.8rem;
  margin-top: 4px;
}

.add-point-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: transparent;
  color: #7f8c8d;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-point-btn:hover {
  border-color: #5a9090;
  color: #5a9090;
  background: rgba(90, 144, 144, 0.05);
}

.import-section {
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #5a9090;
  background: rgba(90, 144, 144, 0.05);
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 0.9rem;
  color: #5a6c7d;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.75rem;
  color: #95a5a6;
  margin-top: 4px;
}

.editor-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #e9ecef;
  color: #5a6c7d;
}

.cancel-btn:hover {
  background: #dee2e6;
}

.save-btn {
  background: linear-gradient(135deg, #5a9090 0%, #4a7c7c 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 144, 144, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 滚动条 */
.points-list::-webkit-scrollbar {
  width: 6px;
}

.points-list::-webkit-scrollbar-track {
  background: transparent;
}

.points-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
</style>