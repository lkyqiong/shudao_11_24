/**
 * 打卡和收藏相关服务
 */

const API_BASE_URL = 'http://localhost:8000/api/actions';

// ==================== 类型定义 ====================

export interface CheckinCreate {
  username: string;
  scenic_id: number;
  note?: string;
  image_url?: string;
}

export interface FavoriteCreate {
  username: string;
  scenic_id: number;
}

export interface Checkin {
  id: number;
  user_id: number;
  scenic_id: number;
  scenic_name?: string;
  note?: string;
  image_url?: string;
  checkin_time: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  scenic_id: number;
  scenic_name?: string;
  create_time: string;
}

// ==================== 打卡相关API ====================

/**
 * 创建打卡记录
 */
export async function createCheckin(data: CheckinCreate): Promise<Checkin> {
  try {
    const response = await fetch(`${API_BASE_URL}/checkins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '打卡失败');
    }

    return await response.json();
  } catch (error) {
    console.error('创建打卡失败:', error);
    throw error;
  }
}

/**
 * 获取用户的打卡记录
 */
export async function getCheckins(username: string): Promise<Checkin[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/checkins?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '获取打卡记录失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取打卡记录失败:', error);
    throw error;
  }
}

// ==================== 收藏相关API ====================

/**
 * 添加收藏
 */
export async function createFavorite(data: FavoriteCreate): Promise<Favorite> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '收藏失败');
    }

    return await response.json();
  } catch (error) {
    console.error('添加收藏失败:', error);
    throw error;
  }
}

/**
 * 取消收藏
 */
export async function deleteFavorite(scenic_id: number, username: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/favorites/${scenic_id}?username=${encodeURIComponent(username)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '取消收藏失败');
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    throw error;
  }
}

/**
 * 获取用户的收藏列表
 */
export async function getFavorites(username: string): Promise<Favorite[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '获取收藏列表失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    throw error;
  }
}

/**
 * 检查是否已收藏某个景点
 */
export async function checkFavorite(scenic_id: number, username: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/favorites/check/${scenic_id}?username=${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '检查收藏状态失败');
    }

    const data = await response.json();
    return data.is_favorited;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
}
