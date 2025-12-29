// src/views/heritage/composables/useHeritageData.ts
import { ref, computed } from 'vue';
import { fetchPoems, fetchHeritage, fetchHistory, type Poem, type Heritage, type History } from '@/services/api';

// 格式化函数：将所有类型的空值替换为"未知"
const formatValue = (value: any): any => {
  // 检查各种空值和无效值
  if (value === null || value === undefined || value === '') {
    return '未知';
  }
  
  // 处理字符串类型的 nan, null, undefined
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'nan' || lower === 'null' || lower === 'undefined' || lower === 'none') {
      return '未知';
    }
    return trimmed; // 返回去除空格的字符串
  }
  
  // 处理数字类型的 NaN
  if (typeof value === 'number' && isNaN(value)) {
    return '未知';
  }
  
  // 处理布尔值和其他类型
  return value;
};

// 格式化单个数据项
const formatItem = (item: any): any => {
  if (!item || typeof item !== 'object') {
    return item;
  }
  
  const formatted: any = { ...item };
  
  // 遍历所有属性进行格式化
  Object.keys(formatted).forEach(key => {
    formatted[key] = formatValue(formatted[key]);
  });
  
  return formatted;
};

// 格式化整个数组
const formatArray = <T>(array: T[]): T[] => {
  if (!Array.isArray(array)) return [];
  return array.map(item => formatItem(item));
};

export function useHeritageData() {
  // 原始数据（存储格式化后的数据）
  const allPoems = ref<Poem[]>([]);
  const allHeritage = ref<Heritage[]>([]);
  const allHistory = ref<History[]>([]);
  
  // 当前类别
  const activeCategory = ref<'poetry' | 'intangible' | 'history'>('poetry');
  
  // 当前数据（根据类别）
  const currentData = computed(() => {
    switch (activeCategory.value) {
      case 'poetry': return allPoems.value;
      case 'intangible': return allHeritage.value;
      case 'history': return allHistory.value;
      default: return [];
    }
  });
  
  // 加载所有数据并在加载时格式化
  const loadAllData = async () => {
    try {
      console.log('开始加载所有古迹数据...');
      
      // 获取原始数据
      const [rawPoems, rawHeritage, rawHistory] = await Promise.all([
        fetchPoems(),
        fetchHeritage(),
        fetchHistory()
      ]);
      
      console.log('原始数据加载完成:', {
        poems: rawPoems.length,
        heritage: rawHeritage.length,
        history: rawHistory.length
      });
      
      // 格式化数据
      allPoems.value = formatArray(rawPoems);
      allHeritage.value = formatArray(rawHeritage);
      allHistory.value = formatArray(rawHistory);
      
      console.log('数据格式化完成:', {
        poems: allPoems.value.length,
        heritage: allHeritage.value.length,
        history: allHistory.value.length
      });
      
      // 检查是否有 nan 被替换了（可选，用于调试）
      checkAndLogNanReplacements(rawPoems, allPoems.value, '诗词');
      checkAndLogNanReplacements(rawHeritage, allHeritage.value, '非遗');
      checkAndLogNanReplacements(rawHistory, allHistory.value, '历史');
      
    } catch (error) {
      console.error('加载数据失败:', error);
      // 即使出错也确保返回空数组而不是 undefined
      allPoems.value = [];
      allHeritage.value = [];
      allHistory.value = [];
    }
  };
  
  // 调试函数：检查 nan 替换情况
  const checkAndLogNanReplacements = (rawArray: any[], formattedArray: any[], category: string) => {
    let nanCount = 0;
    let nullCount = 0;
    let emptyCount = 0;
    let undefinedCount = 0;
    
    rawArray.forEach((item, index) => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          const rawValue = item[key];
          const formattedValue = formattedArray[index]?.[key];
          
          if (rawValue === null) nullCount++;
          if (rawValue === undefined) undefinedCount++;
          if (rawValue === '') emptyCount++;
          if (typeof rawValue === 'string' && rawValue.toLowerCase().trim() === 'nan') nanCount++;
          if (typeof rawValue === 'number' && isNaN(rawValue)) nanCount++;
        });
      }
    });
    
    if (nanCount > 0 || nullCount > 0 || emptyCount > 0 || undefinedCount > 0) {
      console.log(`${category}数据格式化统计:`, {
        替换nan数量: nanCount,
        替换null数量: nullCount,
        替换空字符串数量: emptyCount,
        替换undefined数量: undefinedCount,
        总计替换: nanCount + nullCount + emptyCount + undefinedCount
      });
    }
  };
  
  // 单独格式化单个数据的函数（可用于后续操作）
  const formatSingleItem = (item: any): any => {
    return formatItem(item);
  };
  
  // 格式化单个值的函数
  const formatSingleValue = (value: any): any => {
    return formatValue(value);
  };
  
  return {
    allPoems,
    allHeritage,
    allHistory,
    activeCategory,
    currentData,
    loadAllData,
    formatSingleItem,
    formatSingleValue
  };
}