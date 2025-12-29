<!-- src/views/scenery/components/ScenicDetailSidebar.vue -->
<template>
  <div class="scenic-detail-sidebar">
    <!-- 如果没有选中景点，显示提示 -->
    <div v-if="!selectedScenic" class="no-selection">
      <div class="placeholder-icon">🗺️</div>
      <h3>点击地图上的景点</h3>
      <p>点击地图上的景点标记，可以查看详细信息</p>
      <div class="example-tags">
        <span class="tag-example">等级</span>
        <span class="tag-example">评分</span>
        <span class="tag-example">价格</span>
        <span class="tag-example">推荐理由</span>
        <span class="tag-example">游客词云</span>
      </div>
    </div>
    
    <!-- 如果有选中景点，显示详情 -->
    <div v-else class="scenic-detail">
      <!-- 标题和关闭按钮 -->
      <div class="detail-header">
        <button class="close-btn" @click="$emit('clear-selection')" title="关闭详情">
          ✕
        </button>
        <h3 class="detail-title">{{ selectedScenic.name }}</h3>
      </div>
      
      <!-- 景点详细信息 -->
      <div class="detail-content">
        <!-- 位置信息 -->
        <div class="location-section">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ selectedScenic.place }}</span>
        </div>
        
        <!-- 基本信息：每项一行 -->
        <div class="basic-info">
          <!-- 等级 -->
          <div class="info-row">
            <div class="info-icon">🏆</div>
            <div class="info-content">
              <div class="info-label">等级</div>
              <div class="info-value">{{ selectedScenic.sight_level || '未评级' }}</div>
            </div>
          </div>
          
          <!-- 评分 -->
          <div class="info-row">
            <div class="info-icon">⭐</div>
            <div class="info-content">
              <div class="info-label">评分</div>
              <div class="info-value">
                {{ selectedScenic.score?.toFixed(1) || '暂无' }}
                <span v-if="selectedScenic.score" class="score-stars">
                  {{ getStarRating(selectedScenic.score) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 价格 -->
          <div class="info-row">
            <div class="info-icon">💰</div>
            <div class="info-content">
              <div class="info-label">价格</div>
              <div class="info-value">{{ selectedScenic.price ? `￥${selectedScenic.price}` : '免费' }}</div>
            </div>
          </div>
        </div>
        
        <!-- 推荐理由 -->
        <div
          class="recommend-section"
          v-if="selectedScenic.recommend_reason && selectedScenic.recommend_reason.trim() !== ''"
        >
          <h4 class="section-title">
            <span class="title-icon">💡</span>
            <span>推荐理由</span>
          </h4>
          <div class="recommend-content">
            {{ formatText(selectedScenic.recommend_reason) }}
          </div>
        </div>
        
        <!-- 景点描述 -->
        <div 
          class="description-section"
          v-if="selectedScenic.description && selectedScenic.description.trim() !== ''"
        >
          <h4 class="section-title">
            <span class="title-icon">📝</span>
            <span>景点介绍</span>
          </h4>
          <div class="description-content">
            {{ formatText(selectedScenic.description) }}
          </div>
        </div>
        
        <!-- 使用独立的词云组件 -->
        <WordCloud 
          v-if="selectedScenic.comment && selectedScenic.comment.trim() !== ''"
          :comment-text="selectedScenic.comment"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { Scenic } from '@/services/api';
import WordCloud from './WordCloud.vue';

interface Props {
  selectedScenic: Scenic | null;
}

interface Emits {
  (e: 'clear-selection'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 格式化长文本
const formatText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

// 获取星级评分
const getStarRating = (score: number): string => {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  
  if (halfStar) {
    stars += '½';
  }
  
  return stars;
};
</script>

<style scoped>
/* 只保留侧边栏主要样式，词云样式已移到WordCloud组件中 */
.scenic-detail-sidebar {
  height: 100%;
  background: white;
  font-size: 14px;
}

/* 未选中时的提示 */
.no-selection {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-selection h3 {
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  color: #333;
}

.no-selection p {
  margin: 0 0 24px 0;
  font-size: 0.9rem;
  color: #999;
  line-height: 1.5;
  max-width: 250px;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 250px;
}

.tag-example {
  padding: 4px 10px;
  background: #f0f0f0;
  color: #666;
  border-radius: 12px;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* 景点详情样式 */
.scenic-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #5a9090, #6ba8a8);
  color: white;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 0;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.detail-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-width: 0;
}

/* 位置信息 */
.location-section {
  display: flex;
  align-items: flex-start;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.location-icon {
  margin-right: 6px;
  margin-top: 1px;
  flex-shrink: 0;
}

.location-text {
  flex: 1;
  line-height: 1.4;
  word-break: break-word;
}

/* 基本信息：每项一行 */
.basic-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f8f8f8;
  min-width: 0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  line-height: 1;
}

.info-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

/* 评分星星样式 */
.score-stars {
  font-size: 0.85rem;
  color: #fa8c16;
  letter-spacing: 1px;
  flex-shrink: 0;
}

/* 各内容区块 */
.recommend-section,
.description-section {
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

/* 文本内容区块 */
.recommend-content,
.description-content {
  line-height: 1.5;
  color: #333;
  font-size: 0.85rem;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #5a9090;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 自定义滚动条 */
.detail-content::-webkit-scrollbar {
  width: 4px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>