<!-- src/views/heritage/components/HeritageChartPanel.vue -->
<template>
  <div class="chart-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <span class="panel-icon">📊</span>
        {{ chartTitle }}
      </h3>
      <select v-model="selectedChartType" class="chart-type-select">
        <option 
          v-for="option in chartOptions" 
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <div class="chart-container" ref="chartContainer"></div>
    
    <div class="chart-summary">
      <!-- 动态显示摘要信息 -->
      <div class="summary-item" v-if="summaryText">
        <div class="summary-label">{{ summaryLabel }}:</div>
        <div class="summary-value">{{ summaryText }}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">数据总量:</div>
        <div class="summary-value">{{ totalCount }} 条</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useHeritageChart } from '../composables/useHeritageChart';

interface Props {
  activeCategory: 'poetry' | 'intangible' | 'history';
  filteredData: any[];  // 改为传入筛选后的数据
  totalCount: number;
}

const props = defineProps<Props>();

// 使用图表组合式函数
const { getChartOptions, generateStatistics, getChartTitle } = useHeritageChart();

const chartContainer = ref<HTMLElement | null>(null);
const selectedChartType = ref(''); // 初始为空，根据类别设置默认值
let chartInstance: echarts.ECharts | null = null;

// 图表选项（根据类别动态变化）
const chartOptions = computed(() => {
  return getChartOptions(props.activeCategory);
});

// 统计信息（根据数据和类别实时生成）
const statistics = computed(() => {
  return generateStatistics(props.filteredData, props.activeCategory);
});

// 当前图表数据
const currentChartData = computed(() => {
  if (!selectedChartType.value || !statistics.value[selectedChartType.value + 'Distribution']) {
    return [];
  }
  return statistics.value[selectedChartType.value + 'Distribution'] || [];
});

// 图表标题
const chartTitle = computed(() => {
  return getChartTitle(selectedChartType.value, props.activeCategory);
});

// 摘要信息
const summaryText = computed(() => {
  if (!currentChartData.value.length) return '';
  
  const data = currentChartData.value;
  // 显示前3个主要项
  const topItems = data.slice(0, 3).map(item => `${item.name}(${item.value})`);
  return topItems.join('、');
});

const summaryLabel = computed(() => {
  const labels = {
    dynasty: '主要朝代',
    author: '代表诗人',
    region: '主要地区',
    poemtype: '主要类型',
    type: '主要类别',
    year: '主要年份',
    property: '主要属性',
    period: '主要时期',
    people: '主要人物'
  };
  return labels[selectedChartType.value] || '主要项目';
});

// 设置默认图表类型
const setDefaultChartType = () => {
  const options = chartOptions.value;
  if (options.length > 0) {
    selectedChartType.value = options[0].value;
  }
};

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || currentChartData.value.length === 0) {
    // ... 空状态处理 ...
    return;
  }
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartContainer.value);
  
  // 获取数据项数量
  const dataLength = currentChartData.value.length;
  
  // 智能选择图表类型和布局
  let chartType = 'pie';
  let useHorizontalLegend = false;
  
  // 判断是否使用水平图例
  if (dataLength <= 5) {
    useHorizontalLegend = true;
  }
//   else if (dataLength > 15) {
//     // 数据项太多时使用柱状图更合适
//     chartType = 'bar';
//   }
  
  // 如果是年份数据，强制使用柱状图
  if (selectedChartType.value === 'year') {
    chartType = 'bar';
  }
  
  // 构建图表配置
  const option = {
    title: {
      text: chartTitle.value,
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      type: useHorizontalLegend ? 'plain' : 'scroll',
      orient: useHorizontalLegend ? 'horizontal' : 'vertical',
      left: useHorizontalLegend ? 'center' : 'auto',
      right: useHorizontalLegend ? 'auto' : 10,
      top: useHorizontalLegend ? 'auto' : 35,
      bottom: useHorizontalLegend ? 5 : 'auto',
      textStyle: {
        fontSize: 10,
        color: '#666'
      },
      itemGap: useHorizontalLegend ? 15 : 8,
      itemWidth: 10,
      itemHeight: 10,
      pageTextStyle: {
        fontSize: 9
      },
      formatter: function(name: string) {
        // 名称截断处理
        const maxLength = useHorizontalLegend ? 8 : 12;
        if (name.length > maxLength) {
          return name.substring(0, maxLength) + '...';
        }
        return name;
      }
    },
    grid: chartType === 'bar' ? {
      left: '12%',
      right: '8%',
      top: '20%',
      bottom: '15%',
      containLabel: true
    } : undefined,
    series: [
      {
        name: '分布统计',
        type: chartType,
        data: currentChartData.value.map(item => ({
          name: item.name,
          value: item.value
        })),
        ...(chartType === 'pie' ? {
          radius: dataLength > 10 ? ['40%', '55%'] : ['45%', '65%'],
          center: useHorizontalLegend ? ['50%', '45%'] : ['35%', '50%'],
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          label: {
            show: dataLength <= 8, // 只有数据项较少时才显示标签
            formatter: function(params: any) {
              return `${params.name}\n${params.value}(${params.percent}%)`;
            },
            fontSize: 10,
            lineHeight: 16
          },
          labelLine: {
            show: dataLength <= 8,
            length: 15,
            length2: 10
          }
        } : {
          // 柱状图配置
          barMaxWidth: 40,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8c6e50' },
              { offset: 0.5, color: '#a07a64' },
              { offset: 1, color: '#8c6e50' }
            ]),
            borderRadius: [3, 3, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            color: '#333'
          }
        })
      }
    ],
    ...(chartType === 'bar' ? {
      xAxis: {
        type: 'category',
        data: currentChartData.value.map(item => item.name),
        axisLabel: {
          rotate: dataLength > 8 ? 45 : 0,
          fontSize: 10,
          interval: 0
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '数量',
        nameTextStyle: {
          fontSize: 11
        },
        axisLabel: {
          fontSize: 10
        }
      }
    } : {})
  };
  
  chartInstance.setOption(option);
};

// 监听变化
watch([currentChartData, chartContainer, selectedChartType, () => props.activeCategory], () => {
  if (chartContainer.value) {
    initChart();
  }
}, { immediate: true });

// 监听类别变化，重置图表类型
watch(() => props.activeCategory, () => {
  setDefaultChartType();
}, { immediate: true });

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  setDefaultChartType();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
.chart-panel {
  background: white;
  border-radius: 8px;
  padding: 12px; /* 减小内边距，为图表留更多空间 */
  height: 100%;
  min-height: 350px; /* 增加最小高度 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden; /* 防止溢出 */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 0.95rem; /* 稍小字体 */
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-icon {
  font-size: 0.85rem;
}

.chart-type-select {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.8rem; /* 更小字体 */
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 100px; /* 更小宽度 */
}

.chart-container {
  flex: 1;
  min-height: 250px; /* 增加最小高度 */
  margin-bottom: 12px;
}

.chart-summary {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 0.8rem; /* 更小字体 */
}

.summary-label {
  color: #666;
  flex-shrink: 0;
  min-width: 65px;
}

.summary-value {
  color: #333;
  font-weight: 500;
  line-height: 1.3;
}
</style>