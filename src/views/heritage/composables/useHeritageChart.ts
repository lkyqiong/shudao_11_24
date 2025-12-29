// src/views/heritage/composables/useHeritageChart.ts
import { computed } from 'vue';
import type { Poem, Heritage, History } from '@/services/api';

export function useHeritageChart() {
  
  // 获取不同类别的图表选项
  const getChartOptions = (category: 'poetry' | 'intangible' | 'history') => {
    switch (category) {
      case 'poetry':
        return [
          { value: 'dynasty', label: '朝代分布' },
          { value: 'author', label: '诗人分布' },
          { value: 'region', label: '地区分布' },
          { value: 'poemtype', label: '诗词类型分布' }
        ];
      case 'intangible':
        return [
          { value: 'type', label: '非遗类别分布' },
          { value: 'year', label: '申报年份分布' },
          { value: 'region', label: '地区分布' },
          { value: 'property', label: '属性分布' }
        ];
      case 'history':
        return [
          { value: 'period', label: '历史时期分布' },
          { value: 'people', label: '历史人物分布' },
          { value: 'region', label: '地区分布' },
          { value: 'property', label: '属性分布' }
        ];
      default:
        return [];
    }
  };

  // 根据数据和类别生成统计信息
  const generateStatistics = (
    data: (Poem | Heritage | History)[], 
    category: 'poetry' | 'intangible' | 'history'
  ) => {
    const result: Record<string, Array<{ name: string; value: number }>> = {};
    
    if (data.length === 0) {
      return result;
    }
    
    // 通用统计：地区分布
    const regionMap = new Map<string, number>();
    
    // 根据类别生成不同的统计
    if (category === 'poetry') {
      // 诗词统计
      const dynastyMap = new Map<string, number>();
      const authorMap = new Map<string, number>();
      const poemtypeMap = new Map<string, number>();
      
      data.forEach(item => {
        const poem = item as Poem;
        
        // 朝代
        if (poem.dynasty) {
          dynastyMap.set(poem.dynasty, (dynastyMap.get(poem.dynasty) || 0) + 1);
        }
        
        // 诗人
        if (poem.author) {
          authorMap.set(poem.author, (authorMap.get(poem.author) || 0) + 1);
        }
        
        // 诗词类型
        if (poem.poemtype) {
          poemtypeMap.set(poem.poemtype, (poemtypeMap.get(poem.poemtype) || 0) + 1);
        }
        
        // 地区
        if (poem.province) {
          regionMap.set(poem.province, (regionMap.get(poem.province) || 0) + 1);
        }
      });
      
      result.dynastyDistribution = convertMapToArray(dynastyMap);
      result.authorDistribution = convertMapToArray(authorMap).slice(0, 15); // 前15诗人
      result.poemtypeDistribution = convertMapToArray(poemtypeMap);
      
    } else if (category === 'intangible') {
      // 非遗统计
      const typeMap = new Map<string, number>();
      const yearMap = new Map<string, number>();
      const propertyMap = new Map<string, number>();
      
      data.forEach(item => {
        const heritage = item as Heritage;
        
        // 类型
        if (heritage.type) {
          typeMap.set(heritage.type, (typeMap.get(heritage.type) || 0) + 1);
        }
        
        // 申报年份
        if (heritage.rx_time) {
          const year = new Date(heritage.rx_time).getFullYear().toString();
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        }
        
        // 属性（如果存在）
        if (heritage.property) {
          propertyMap.set(heritage.property, (propertyMap.get(heritage.property) || 0) + 1);
        }
        
        // 地区
        if (heritage.province) {
          regionMap.set(heritage.province, (regionMap.get(heritage.province) || 0) + 1);
        }
      });
      
      result.typeDistribution = convertMapToArray(typeMap);
      result.yearDistribution = convertMapToArray(yearMap).sort((a, b) => 
        parseInt(a.name) - parseInt(b.name)
      );
      result.propertyDistribution = convertMapToArray(propertyMap);
      
    } else if (category === 'history') {
      // 历史统计
      const periodMap = new Map<string, number>();
      const peopleMap = new Map<string, number>();
      const propertyMap = new Map<string, number>();
      
      data.forEach(item => {
        const history = item as History;
        
        // 时期
        if (history.period) {
          periodMap.set(history.period, (periodMap.get(history.period) || 0) + 1);
        }
        
        // 人物
        if (history.people) {
          peopleMap.set(history.people, (peopleMap.get(history.people) || 0) + 1);
        }
        
        // 属性
        if (history.property) {
          propertyMap.set(history.property, (propertyMap.get(history.property) || 0) + 1);
        }
        
        // 地区
        if (history.province) {
          regionMap.set(history.province, (regionMap.get(history.province) || 0) + 1);
        }
      });
      
      result.periodDistribution = convertMapToArray(periodMap);
      result.peopleDistribution = convertMapToArray(peopleMap).slice(0, 15); // 前15人物
      result.propertyDistribution = convertMapToArray(propertyMap);
    }
    
    // 地区分布（所有类别通用）
    result.regionDistribution = convertMapToArray(regionMap);
    
    return result;
  };

  // 辅助函数：将Map转换为数组
  const convertMapToArray = (map: Map<string, number>) => {
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // 获取图表标题
  const getChartTitle = (chartType: string, category: string) => {
    const categoryName = {
      poetry: '诗词',
      intangible: '非遗',
      history: '历史'
    }[category] || category;
    
    const typeName = {
      dynasty: '朝代',
      author: '诗人',
      region: '地区',
      poemtype: '诗词类型',
      type: '类别',
      year: '申报年份',
      property: '属性',
      period: '历史时期',
      people: '历史人物'
    }[chartType] || chartType;
    
    return `${categoryName}${typeName}分布`;
  };

  return {
    getChartOptions,
    generateStatistics,
    getChartTitle
  };
}