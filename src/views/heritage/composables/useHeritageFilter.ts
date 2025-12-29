// src/views/heritage/composables/useHeritageFilter.ts
import { ref, computed } from 'vue';
import type { Poem, Heritage, History } from '@/services/api';

export function useHeritageFilter() {
  // 筛选条件
  const filters = ref({
    // 诗词筛选
    dynasty: '',
    author: '',
    province: '',
    poemtype: '',
    
    // 非遗筛选
    type: '',
    year: '',
    
    // 历史筛选
    period: '',
    people: ''
  });
  
  // 筛选函数
  const filterData = (data: (Poem | Heritage | History)[], category: string) => {
    return data.filter(item => {
      // 通用筛选：省份
      if (filters.value.province && 'province' in item && item.province !== filters.value.province) {
        return false;
      }
      
      // 诗词筛选
      if (category === 'poetry') {
        const poem = item as Poem;
        if (filters.value.dynasty && poem.dynasty !== filters.value.dynasty) return false;
        if (filters.value.author && poem.author !== filters.value.author) return false;
        if (filters.value.poemtype && poem.poemtype !== filters.value.poemtype) return false;
      }
      
      // 非遗筛选
      else if (category === 'intangible') {
        const heritage = item as Heritage;
        if (filters.value.type && heritage.type !== filters.value.type) return false;
        if (filters.value.year && heritage.rx_time) {
          const year = new Date(heritage.rx_time).getFullYear().toString();
          if (year !== filters.value.year) return false;
        }
      }
      
      // 历史筛选
      else if (category === 'history') {
        const history = item as History;
        if (filters.value.period && history.period !== filters.value.period) return false;
        if (filters.value.people && history.people !== filters.value.people) return false;
      }
      
      return true;
    });
  };
  
  // 重置筛选
  const resetFilters = () => {
    filters.value = {
      dynasty: '',
      author: '',
      province: '',
      poemtype: '',
      type: '',
      year: '',
      period: '',
      people: ''
    };
  };

  
  return {
    filters,
    filterData,
    resetFilters
  };
}