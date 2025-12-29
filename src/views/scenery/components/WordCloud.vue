<!-- src/views/scenery/components/WordCloud.vue -->
<template>
  <div class="wordcloud-section">
    <h4 class="section-title">
      <span class="title-icon">☁️</span>
      <span>游客评价词云</span>
    </h4>
    <div class="wordcloud-container">
      <div class="wordcloud-box" ref="wordcloudBoxRef" :style="{ height: cloudHeight + 'px' }">
        <span 
          v-for="(word, index) in wordCloudWords" 
          :key="index"
          class="wordcloud-item"
          :style="getWordStyle(word)"
          :title="`${word.text} (出现${word.frequency}次)`"
        >
          {{ word.text }}
        </span>
      </div>
      <div class="wordcloud-stats" v-if="wordCloudWords.length > 0">
        <div class="stats-item">
          <span class="stats-label">总词数：</span>
          <span class="stats-value">{{ totalWords }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">高频词：</span>
          <span class="stats-value">{{ topWords.join('、') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  commentText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  commentText: ''
});

interface WordCloudWord {
  text: string;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  weight: number;
  left: number;
  top: number;
  frequency: number;
  normalizedFreq: number;
  zIndex: number;
}

// 词云容器引用
const wordcloudBoxRef = ref<HTMLElement | null>(null);
// 词云容器高度
const cloudHeight = ref(250);

// 词云颜色数组
const colors = [
  '#1890ff', '#52c41a', '#fa8c16', '#f5222d', 
  '#722ed1', '#13c2c2', '#eb2f96', '#faad14',
  '#7cb305', '#096dd9', '#d4380d', '#531dab'
];

// 生成单词样式
const getWordStyle = (word: WordCloudWord) => ({
  fontSize: word.size + 'px',
  color: word.color,
  transform: `rotate(${word.rotation}deg) translate(-50%, -50%)`,
  opacity: word.opacity,
  fontWeight: word.weight,
  position: 'absolute',
  left: word.left + '%',
  top: word.top + '%',
  zIndex: word.zIndex,
  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
});

// 改进的词云布局算法 - 螺旋布局
const generateSpiralLayout = (words: WordCloudWord[], width = 100, height = 100) => {
  const positions: Array<{ left: number; top: number; width: number; height: number }> = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  words.forEach((word, index) => {
    // 根据词频确定起始半径（高频词更靠近中心）
    const baseRadius = 5 + (1 - word.normalizedFreq) * 25;
    const angleStep = 0.2;
    let placed = false;
    
    // 螺旋搜索位置
    for (let angle = 0; angle < Math.PI * 8; angle += angleStep) {
      const radius = baseRadius + angle * 2.5;
      const left = centerX + Math.cos(angle) * radius;
      const top = centerY + Math.sin(angle) * radius;
      
      // 计算词的实际占用空间
      const wordWidth = word.size * word.text.length * 0.5;
      const wordHeight = word.size * 1.2;
      
      // 检查边界
      if (left - wordWidth/2 < 2 || left + wordWidth/2 > width - 2 ||
          top - wordHeight/2 < 2 || top + wordHeight/2 > height - 2) {
        continue;
      }
      
      // 检查碰撞
      let collision = false;
      for (const pos of positions) {
        const distanceX = Math.abs(left - pos.left);
        const distanceY = Math.abs(top - pos.top);
        const minDistanceX = (wordWidth + pos.width) / 2 + 3;
        const minDistanceY = (wordHeight + pos.height) / 2 + 3;
        
        if (distanceX < minDistanceX && distanceY < minDistanceY) {
          collision = true;
          break;
        }
      }
      
      if (!collision) {
        word.left = Math.max(2 + wordWidth/2, Math.min(width - 2 - wordWidth/2, left));
        word.top = Math.max(2 + wordHeight/2, Math.min(height - 2 - wordHeight/2, top));
        positions.push({ left, top, width: wordWidth, height: wordHeight });
        placed = true;
        break;
      }
    }
    
    // 如果螺旋布局失败，使用改进的随机位置
    if (!placed) {
      const wordWidth = word.size * word.text.length * 0.5;
      const wordHeight = word.size * 1.2;
      const maxAttempts = 100;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const left = 2 + wordWidth/2 + Math.random() * (width - 4 - wordWidth);
        const top = 2 + wordHeight/2 + Math.random() * (height - 4 - wordHeight);
        
        let collision = false;
        for (const pos of positions) {
          const distanceX = Math.abs(left - pos.left);
          const distanceY = Math.abs(top - pos.top);
          const minDistanceX = (wordWidth + pos.width) / 2 + 2;
          const minDistanceY = (wordHeight + pos.height) / 2 + 2;
          
          if (distanceX < minDistanceX && distanceY < minDistanceY) {
            collision = true;
            break;
          }
        }
        
        if (!collision) {
          word.left = left;
          word.top = top;
          positions.push({ left, top, width: wordWidth, height: wordHeight });
          break;
        }
        
        attempts++;
      }
      
      // 最终回退方案
      if (attempts >= maxAttempts) {
        word.left = 10 + Math.random() * 80;
        word.top = 10 + Math.random() * 80;
      }
    }
  });
  
  return words;
};

// 生成优化后的词云数据
const wordCloudWords = computed(() => {
  if (!props.commentText || props.commentText.trim() === '') {
    return [];
  }
  
  const commentText = props.commentText;
  
  // 将评论按空格分割成词语数组
  const words = commentText.split(' ').filter(word => 
    word.trim() !== '' && word.length > 1  // 过滤单字词
  );
  
  if (words.length === 0) return [];
  
  // 统计词频
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // 按词频排序并截断，最多显示20个词
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  
  if (sortedWords.length === 0) return [];
  
  // 获取词频范围用于归一化
  const maxFrequency = sortedWords[0][1];
  const minFrequency = sortedWords[sortedWords.length - 1][1];
  const freqRange = maxFrequency - minFrequency;
  
  // 生成基础词云数据
  const baseWordCloudData = sortedWords.map(([text, frequency], index): WordCloudWord => {
    // 归一化频率 (0.3 - 1.0)
    const normalizedFreq = freqRange > 0 
      ? 0.3 + (frequency - minFrequency) / freqRange * 0.7
      : 1.0;
    
    // 字体大小 (12px - 30px)
    const size = 12 + normalizedFreq * 18;
    
    // 透明度 (0.6 - 1.0)
    const opacity = 0.6 + normalizedFreq * 0.4;
    
    // 颜色选择
    const color = colors[index % colors.length];
    
    // 轻微旋转角度 (-15° 到 15°)
    const rotation = (index % 11) * 3 - 15;
    
    // 字体粗细
    const weight = frequency > 1 ? 600 : 400;
    
    // z-index: 频率越高，层级越高（显示在最上面）
    const zIndex = 1000 + frequency * 10;
    
    return {
      text,
      size,
      color,
      opacity,
      rotation,
      weight,
      left: 50,
      top: 50,
      frequency,
      normalizedFreq,
      zIndex
    };
  });
  
  // 使用改进的螺旋布局算法，高频词优先布局在中心
  return generateSpiralLayout(baseWordCloudData);
});

// 统计信息
const totalWords = computed(() => {
  if (!props.commentText) return 0;
  const words = props.commentText.split(' ').filter(word => word.trim() !== '');
  return words.length;
});

const topWords = computed(() => {
  if (wordCloudWords.value.length === 0) return [];
  return wordCloudWords.value
    .slice(0, 3)
    .map(word => word.text);
});

// 自适应调整词云高度
const updateCloudHeight = () => {
  if (wordcloudBoxRef.value && wordcloudBoxRef.value.parentElement) {
    const parentWidth = wordcloudBoxRef.value.parentElement.clientWidth;
    // 根据宽度调整高度，保持16:9比例，限制在200-300px之间
    cloudHeight.value = Math.min(300, Math.max(200, parentWidth * 0.6));
  }
};

// 监听窗口大小变化
const handleResize = () => {
  updateCloudHeight();
};

// 监听词云容器变化
watch(wordcloudBoxRef, () => {
  if (wordcloudBoxRef.value) {
    updateCloudHeight();
  }
});

// 监听评论文本变化
watch(() => props.commentText, () => {
  // 重新计算词云时，稍后更新高度
  setTimeout(updateCloudHeight, 100);
});

onMounted(() => {
  // 初始调整高度
  setTimeout(updateCloudHeight, 100);
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.wordcloud-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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

.wordcloud-container {
  background: #fafafa;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #e8e8e8;
}

.wordcloud-box {
  position: relative;
  width: 100%;
  height: 250px; /* 默认高度，会被JS动态调整 */
  min-height: 200px;
  max-height: 300px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden !important; /* 确保词不会溢出 */
  margin-bottom: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.wordcloud-item {
  position: absolute;
  display: inline-block;
  padding: 2px 6px;
  margin: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  transform-origin: center center;
  pointer-events: auto;
  z-index: 1;
  line-height: 1.2;
  transform: translate(-50%, -50%); /* 使词的中心点对齐坐标 */
}

.wordcloud-item:hover {
  transform: translate(-50%, -50%) scale(1.15) !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.95);
}

/* 统计信息样式 */
.wordcloud-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: #666;
  background: #fff;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.stats-item {
  display: flex;
  align-items: center;
}

.stats-label {
  color: #999;
  margin-right: 4px;
}

.stats-value {
  color: #333;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .wordcloud-box {
    height: 220px !important;
  }
}

@media (max-width: 480px) {
  .wordcloud-box {
    height: 200px !important;
  }
}
</style>