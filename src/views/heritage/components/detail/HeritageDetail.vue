<!-- src/views/heritage/components/detail/HeritageDetail.vue -->
<template>
  <div class="heritage-detail">
    <!-- 基本信息 -->
    <div class="basic-info">
      <div class="info-row">
        <div class="info-label">申报时间：</div>
        <div class="info-value">{{ heritage.rx_time || '未知' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">类别：</div>
        <div class="info-value">{{ heritage.type || '未知' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">地区：</div>
        <div class="info-value">{{ heritage.province || '未知' }}</div>
      </div>
    </div>
    
    <!-- 内容描述 -->
    <div class="content-section" v-if="heritage.content && heritage.content.trim() !== ''">
      <h4 class="section-title">
        <span class="title-icon">📝</span>
        <span>内容描述</span>
      </h4>
      <div class="heritage-content">
        {{ formatText(heritage.content) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Heritage } from '@/services/api';

interface Props {
  heritage: Heritage;
}

defineProps<Props>();

// 格式化文本
const formatText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};
</script>

<style scoped>
.heritage-detail {
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
  min-width: 80px;
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

.heritage-content {
  line-height: 1.6;
  color: #333;
  font-size: 0.9rem;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #722ed1;
  word-break: break-word;
}
</style>