import { ref, computed } from 'vue';
import { fetchPoems, fetchHeritage, fetchHistory } from '@/services/api';
import type { Poem, Heritage, History } from '@/services/api';

export const useOptimizedHeritageData = () => {
  const allPoems = ref<Poem[]>([]);
  const allHeritage = ref<Heritage[]>([]);
  const allHistory = ref<History[]>([]);
  const activeCategory = ref<'poetry' | 'intangible' | 'history'>('poetry');
  
  // 当前显示的数据（根据activeCategory）
  const currentData = computed(() => {
    switch (activeCategory.value) {
      case 'poetry': return allPoems.value;
      case 'intangible': return allHeritage.value;
      case 'history': return allHistory.value;
      default: return [];
    }
  });
  
  // 增量加载诗词数据
  const loadPoemsIncrementally = async (chunkSize = 500) => {
    try {
      // 第一次请求获取总数量
      const response = await fetchPoems({ page: 1, limit: 1 });
      const total = response.total || 0;
      
      const chunks: Poem[][] = [];
      for (let i = 0; i < total; i += chunkSize) {
        const page = Math.floor(i / chunkSize) + 1;
        const chunkResponse = await fetchPoems({ page, limit: chunkSize });
        chunks.push(chunkResponse.data || []);
        
        // 可以在这里更新进度
        if (typeof (window as any).onPoetryProgress === 'function') {
          (window as any).onPoetryProgress(i + chunkResponse.data.length, total);
        }
        
        // 避免一次性阻塞，短暂延迟
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      allPoems.value = chunks.flat();
    } catch (error) {
      console.error('加载诗词数据失败:', error);
      throw error;
    }
  };
  
  // 加载其他数据
  const loadHeritageData = async () => {
    try {
      const response = await fetchHeritage();
      allHeritage.value = response.data || [];
    } catch (error) {
      console.error('加载非遗数据失败:', error);
    }
  };
  
  const loadHistoryData = async () => {
    try {
      const response = await fetchHistory();
      allHistory.value = response.data || [];
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  };
  
  // 优化加载策略
  const loadAllData = async () => {
    // 并行加载非遗和历史数据（数据量小）
    await Promise.all([
      loadHeritageData(),
      loadHistoryData()
    ]);
    
    // 增量加载诗词数据（大数据量）
    await loadPoemsIncrementally();
  };
  
  // 获取轻量版本数据（用于初始显示）
  const getLightData = async () => {
    // 只加载前1000条诗词数据用于初始显示
    const poemsResponse = await fetchPoems({ page: 1, limit: 1000 });
    allPoems.value = poemsResponse.data || [];
  };
  
  return {
    allPoems,
    allHeritage,
    allHistory,
    activeCategory,
    currentData,
    loadAllData,
    loadPoemsIncrementally,
    getLightData
  };
};