"""
actions_api.py - 用户行为相关API（打卡、收藏）
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

router = APIRouter(prefix="/api/actions", tags=["actions"])

# 数据库配置
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "shudao",
    "user": "postgres",
    "password": "123456"
}

# ==================== 数据模型 ====================

class CheckinCreate(BaseModel):
    username: str
    scenic_id: int
    note: Optional[str] = None
    image_url: Optional[str] = None

class FavoriteCreate(BaseModel):
    username: str
    scenic_id: int

class CheckinResponse(BaseModel):
    id: int
    user_id: int
    scenic_id: int
    scenic_name: Optional[str] = None
    note: Optional[str] = None
    image_url: Optional[str] = None
    checkin_time: str

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    scenic_id: int
    scenic_name: Optional[str] = None
    create_time: str

# ==================== 辅助函数 ====================

def get_user_id_by_username(username: str) -> Optional[int]:
    """根据用户名获取用户ID"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id FROM users.users WHERE username = %s", (username,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result['id'] if result else None
    except Exception as e:
        print(f"获取用户ID失败: {e}")
        return None

# ==================== 打卡相关API ====================

@router.post("/checkins", response_model=CheckinResponse)
async def create_checkin(checkin: CheckinCreate):
    """创建打卡记录"""
    try:
        # 获取user_id
        user_id = get_user_id_by_username(checkin.username)
        if not user_id:
            raise HTTPException(status_code=404, detail="用户不存在")

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # 插入打卡记录
        cursor.execute(
            """
            INSERT INTO actions.checkins (user_id, scenic_id, note, image_url, checkin_time)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id, user_id, scenic_id, note, image_url, checkin_time
            """,
            (user_id, checkin.scenic_id, checkin.note, checkin.image_url)
        )
        result = cursor.fetchone()

        # 获取景点名称
        cursor.execute("SELECT name FROM scenic.scenic WHERE id = %s", (checkin.scenic_id,))
        scenic = cursor.fetchone()
        scenic_name = scenic['name'] if scenic else None

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": result['id'],
            "user_id": result['user_id'],
            "scenic_id": result['scenic_id'],
            "scenic_name": scenic_name,
            "note": result['note'],
            "image_url": result['image_url'],
            "checkin_time": result['checkin_time'].isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建打卡失败: {str(e)}")

@router.get("/checkins", response_model=List[CheckinResponse])
async def get_checkins(username: str):
    """获取用户的打卡记录"""
    try:
        # 获取user_id
        user_id = get_user_id_by_username(username)
        if not user_id:
            return []

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                c.id, c.user_id, c.scenic_id, c.note, c.image_url, c.checkin_time,
                s.name as scenic_name
            FROM actions.checkins c
            LEFT JOIN scenic.scenic s ON c.scenic_id = s.id
            WHERE c.user_id = %s
            ORDER BY c.checkin_time DESC
            """,
            (user_id,)
        )
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        return [
            {
                "id": r['id'],
                "user_id": r['user_id'],
                "scenic_id": r['scenic_id'],
                "scenic_name": r['scenic_name'],
                "note": r['note'],
                "image_url": r['image_url'],
                "checkin_time": r['checkin_time'].isoformat()
            }
            for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取打卡记录失败: {str(e)}")

# ==================== 收藏相关API ====================

@router.post("/favorites", response_model=FavoriteResponse)
async def create_favorite(favorite: FavoriteCreate):
    """添加收藏"""
    try:
        # 获取user_id
        user_id = get_user_id_by_username(favorite.username)
        if not user_id:
            raise HTTPException(status_code=404, detail="用户不存在")

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # 检查是否已收藏
        cursor.execute(
            "SELECT id FROM actions.favorites WHERE user_id = %s AND scenic_id = %s",
            (user_id, favorite.scenic_id)
        )
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="已经收藏过该景点")

        # 插入收藏记录
        cursor.execute(
            """
            INSERT INTO actions.favorites (user_id, scenic_id, create_time)
            VALUES (%s, %s, NOW())
            RETURNING id, user_id, scenic_id, create_time
            """,
            (user_id, favorite.scenic_id)
        )
        result = cursor.fetchone()

        # 获取景点名称
        cursor.execute("SELECT name FROM scenic.scenic WHERE id = %s", (favorite.scenic_id,))
        scenic = cursor.fetchone()
        scenic_name = scenic['name'] if scenic else None

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "id": result['id'],
            "user_id": result['user_id'],
            "scenic_id": result['scenic_id'],
            "scenic_name": scenic_name,
            "create_time": result['create_time'].isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加收藏失败: {str(e)}")

@router.delete("/favorites/{scenic_id}")
async def delete_favorite(scenic_id: int, username: str):
    """取消收藏"""
    try:
        # 获取user_id
        user_id = get_user_id_by_username(username)
        if not user_id:
            raise HTTPException(status_code=404, detail="用户不存在")

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM actions.favorites WHERE user_id = %s AND scenic_id = %s",
            (user_id, scenic_id)
        )
        deleted_count = cursor.rowcount

        conn.commit()
        cursor.close()
        conn.close()

        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="未找到该收藏记录")

        return {"message": "取消收藏成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"取消收藏失败: {str(e)}")

@router.get("/favorites", response_model=List[FavoriteResponse])
async def get_favorites(username: str):
    """获取用户的收藏列表"""
    try:
        # 获取user_id
        user_id = get_user_id_by_username(username)
        if not user_id:
            return []

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                f.id, f.user_id, f.scenic_id, f.create_time,
                s.name as scenic_name
            FROM actions.favorites f
            LEFT JOIN scenic.scenic s ON f.scenic_id = s.id
            WHERE f.user_id = %s
            ORDER BY f.create_time DESC
            """,
            (user_id,)
        )
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        return [
            {
                "id": r['id'],
                "user_id": r['user_id'],
                "scenic_id": r['scenic_id'],
                "scenic_name": r['scenic_name'],
                "create_time": r['create_time'].isoformat()
            }
            for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取收藏列表失败: {str(e)}")

@router.get("/favorites/check/{scenic_id}")
async def check_favorite(scenic_id: int, username: str):
    """检查是否已收藏某个景点"""
    try:
        user_id = get_user_id_by_username(username)
        if not user_id:
            return {"is_favorited": False}

        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            "SELECT id FROM actions.favorites WHERE user_id = %s AND scenic_id = %s",
            (user_id, scenic_id)
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        return {"is_favorited": result is not None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查收藏状态失败: {str(e)}")
