/**
 * API 服务 - 连接后端 FastAPI
 */

const API_BASE_URL = 'http://localhost:8000';

export interface Poem {
  id: number;
  name: string;
  author: string;
  dynasty: string;
  content: string;
  keywords: string;
  poemtype: string;
  city: string;
  county: string;
  province: number;
  longitude: number;
  latitude: number;
}

export interface Heritage {
  id: number;
  name: string;
  rx_time: string;
  content: string;
  province: number;
  type: string;
  longitude: number;
  latitude: number;
}

export interface History {
  id: number;
  name: string;
  people: string;
  description: string;
  province: number;
  property: string;
  city: string;
  county: string;
  period: string;
  longitude: number;
  latitude: number;
}

export interface Scenic {
  id: number;
  name: string;
  description: string;
  place: string;
  score: number;
  sight_level: string;
  price: number;
  longitude: number;
  latitude: number;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

/**
 * 获取所有诗词数据
 */
export async function fetchPoems(): Promise<Poem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/poems`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Poem[]> = await response.json();

    if (result.success) {
      console.log(`✅ 成功获取 ${result.count} 条诗词数据`);
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ 获取诗词数据失败:', error);
    return [];
  }
}

/**
 * 根据 ID 获取单个诗词详情
 */
export async function fetchPoemById(id: number): Promise<Poem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/poems/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Poem> = await response.json();

    if (result.success) {
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取诗词详情失败:', error);
    return null;
  }
}

/**
 * 获取所有非遗数据
 */
export async function fetchHeritage(): Promise<Heritage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heritage`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Heritage[]> = await response.json();

    if (result.success) {
      console.log(`✅ 成功获取 ${result.count} 条非遗数据`);
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ 获取非遗数据失败:', error);
    return [];
  }
}

/**
 * 获取所有历史数据
 */
export async function fetchHistory(): Promise<History[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<History[]> = await response.json();

    if (result.success) {
      console.log(`✅ 成功获取 ${result.count} 条历史数据`);
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ 获取历史数据失败:', error);
    return [];
  }
}

/**
 * 获取所有景点数据（包含推荐理由和评论）
 */
export async function fetchScenic(): Promise<Scenic[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scenic`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Scenic[]> = await response.json();

    if (result.success) {
      console.log(`✅ 成功获取 ${result.count} 条景点数据`);
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ 获取景点数据失败:', error);
    return [];
  }
}

/**
 * 筛选选项接口
 */
export interface FilterOptions {
  dynasties: string[];
  authors: string[];
  poemtypes: string[];
  keywords: string[];
  rx_times: string[];
  heritage_types: string[];
  people: string[];
  periods: string[];
  properties: string[];
  sight_levels: string[];
  provinces: string[];
  cities: string[];
  counties: string[];
  places: string[];
  score_range: { min: number; max: number };
}

/**
 * 获取筛选选项
 */
export async function fetchFilterOptions(): Promise<FilterOptions | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/filters/options`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<FilterOptions> = await response.json();

    if (result.success) {
      console.log('✅ 成功获取筛选选项');
      return result.data;
    } else {
      console.error('❌ API 返回错误:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 获取筛选选项失败:', error);
    return null;
  }
}
