<!-- src/views/heritage/components/detail/HistoryDetail.vue -->
<template>
  <div class="history-detail">
    <!-- 基本信息 -->
    <div class="basic-info">
      <div class="info-row">
        <div class="info-label">人物：</div>
        <div class="info-value">{{ history.people || '未知' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">时期：</div>
        <div class="info-value">{{ history.period || '未知' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">地区：</div>
        <div class="info-value">{{ formatLocation(history) }}</div>
      </div>
    </div>
    
    <!-- 描述 -->
    <div class="content-section" v-if="history.description && history.description.trim() !== ''">
      <h4 class="section-title">
        <span class="title-icon">📜</span>
        <span>历史描述</span>
      </h4>
      <div class="history-content">
        {{ formatText(history.description) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { History } from '@/services/api';

interface Props {
  history: History;
}

defineProps<Props>();

// 格式化文本
const formatText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

// 格式化地理位置
const formatLocation = (history: History): string => {
  const parts = [];
  if (history.province) parts.push(history.province);
  if (history.city) parts.push(history.city);
  if (history.county) parts.push(history.county);
  return parts.length > 0 ? parts.join(' / ') : '未知';
};
</script>

<style scoped>
.history-detail {
  padding: 16px 0;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  color: #666;
  font-size: 0.85rem;
  min-width: 60px;
}

.info-value {
  color: #333;
  font-weight: 500;
  flex: 1;
}

.content-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.title-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.history-content {
  line-height: 1.6;
  color: #333;
  font-size: 0.9rem;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #fa8c16;
  word-break: break-word;
}
</style>