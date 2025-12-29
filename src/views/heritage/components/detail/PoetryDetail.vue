<!-- src/views/heritage/components/detail/PoetryDetail.vue -->
<template>
  <div class="poetry-detail">
    <!-- 作者信息 -->
    <div class="author-section">
      <div class="author-name">{{ poem.author }}</div>
      <div class="dynasty">{{ poem.dynasty }}</div>
    </div>
    
    <!-- 诗词内容 -->
    <div class="content-section">
      <h4 class="section-title">
        <span class="title-icon">📖</span>
        <span>诗词内容</span>
      </h4>
      <div class="poetry-content">
        {{ formatText(poem.content) }}
      </div>
    </div>
    
    <!-- 关键词 -->
    <div class="keywords-section" v-if="poem.keywords && poem.keywords.trim() !== ''">
      <h4 class="section-title">
        <span class="title-icon">🏷️</span>
        <span>关键词</span>
      </h4>
      <div class="keywords-tags">
        <span 
          v-for="(keyword, index) in keywordsArray" 
          :key="index"
          class="keyword-tag"
        >
          {{ keyword }}
        </span>
      </div>
    </div>
    
    <!-- 地理信息 -->
    <div class="location-section">
      <h4 class="section-title">
        <span class="title-icon">📍</span>
        <span>地理信息</span>
      </h4>
      <div class="location-info">
        <div class="location-item">
          <span class="location-label">省份：</span>
          <span class="location-value">{{ poem.province || '未知' }}</span>
        </div>
        <div class="location-item">
          <span class="location-label">城市：</span>
          <span class="location-value">{{ poem.city || '未知' }}</span>
        </div>
        <div class="location-item">
          <span class="location-label">区县：</span>
          <span class="location-value">{{ poem.county || '未知' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 诗词类型 -->
    <div class="type-section" v-if="poem.poemtype && poem.poemtype.trim() !== ''">
      <h4 class="section-title">
        <span class="title-icon">🎭</span>
        <span>诗词类型</span>
      </h4>
      <div class="type-content">{{ poem.poemtype }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Poem } from '@/services/api';

interface Props {
  poem: Poem;
}

const props = defineProps<Props>();

// 格式化文本
const formatText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

// 关键词数组
const keywordsArray = computed(() => {
  if (!props.poem.keywords) return [];
  return props.poem.keywords.split(' ').filter(k => k.trim() !== '');
});
</script>

<style scoped>
.poetry-detail {
  padding: 16px 0;
}

.author-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.author-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.dynasty {
  font-size: 0.9rem;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.content-section {
  margin-bottom: 20px;
}

.poetry-content {
  line-height: 1.8;
  color: #333;
  font-size: 1rem;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #8c6e50;
  white-space: pre-line;
  word-break: break-word;
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

.keywords-section {
  margin-bottom: 20px;
}

.keywords-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 4px 10px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid #91d5ff;
}

.location-section {
  margin-bottom: 20px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-item {
  display: flex;
  align-items: center;
}

.location-label {
  color: #666;
  font-size: 0.85rem;
  min-width: 60px;
}

.location-value {
  color: #333;
  font-weight: 500;
}

.type-section {
  margin-bottom: 20px;
}

.type-content {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
}
</style>