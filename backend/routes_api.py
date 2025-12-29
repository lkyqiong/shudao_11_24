"""
路线 API 模块
单独的路线相关接口，可以导入到 main.py 中使用
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import json

# 创建路由器
router = APIRouter(prefix="/api/routes", tags=["routes"])

# 数据库连接配置（本地连接）
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "shudao",
    "user": "postgres",
    "password": "123456"
}

def get_db_connection():
    """获取数据库连接"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

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

# ==================== 数据模型 ====================

class RoutePoint(BaseModel):
    longitude: float
    latitude: float
    name: Optional[str] = None
    elevation: Optional[float] = None

class RouteCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points: List[RoutePoint]

class RouteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    points: Optional[List[RoutePoint]] = None

# ==================== 工具函数 ====================

def calculate_distance(point1: dict, point2: dict) -> float:
    """计算两点之间的距离（公里）"""
    import math
    R = 6371  # 地球半径（公里）
    
    lat1 = math.radians(point1['latitude'])
    lat2 = math.radians(point2['latitude'])
    delta_lat = math.radians(point2['latitude'] - point1['latitude'])
    delta_lon = math.radians(point2['longitude'] - point1['longitude'])
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def calculate_total_distance(points: list) -> float:
    """计算路线总距离"""
    if len(points) < 2:
        return 0
    
    total = 0
    for i in range(len(points) - 1):
        total += calculate_distance(points[i], points[i+1])
    
    return round(total, 1)

def parse_route(route_row: dict) -> dict:
    """解析数据库行为路线对象"""
    route_dict = dict(route_row)
    
    # 解析 scenic_list 为 points
    try:
        if route_dict['scenic_list']:
            route_dict['points'] = json.loads(route_dict['scenic_list'])
        else:
            route_dict['points'] = []
    except (json.JSONDecodeError, TypeError):
        route_dict['points'] = []
    
    # 计算距离
    route_dict['distance'] = calculate_total_distance(route_dict['points'])
    
    # 删除 scenic_list
    del route_dict['scenic_list']
    
    # 转换时间格式
    if route_dict.get('create_time'):
        route_dict['create_time'] = route_dict['create_time'].isoformat()
    
    return route_dict

# ==================== API 接口 ====================

@router.get("")
def get_routes(username: Optional[str] = None):
    """获取自定义路线（可选用户名筛选）"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if username:
            user_id = get_user_id_by_username(username)
            if not user_id:
                return {"success": False, "error": "用户不存在", "data": []}

            query = """
            SELECT id, user_id, name, scenic_list, description, create_time
            FROM actions.routes
            WHERE user_id = %s
            ORDER BY create_time DESC;
            """
            cursor.execute(query, (user_id,))
        else:
            # 如果没有提供用户名，返回所有路线
            query = """
            SELECT id, user_id, name, scenic_list, description, create_time
            FROM actions.routes
            ORDER BY create_time DESC;
            """
            cursor.execute(query)

        routes = cursor.fetchall()
        result = [parse_route(route) for route in routes]

        return {"success": True, "count": len(result), "data": result}

    except Exception as e:
        print(f"Error querying routes: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e), "data": []}
    finally:
        cursor.close()
        conn.close()

@router.get("/summary")
def get_routes_summary(username: Optional[str] = None):
    """获取路线摘要（用于用户页面显示，可选用户名筛选）"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if username:
            user_id = get_user_id_by_username(username)
            if not user_id:
                return {"success": False, "error": "用户不存在", "data": []}

            query = """
            SELECT id, name, scenic_list, create_time
            FROM actions.routes
            WHERE user_id = %s
            ORDER BY create_time DESC;
            """
            cursor.execute(query, (user_id,))
        else:
            # 如果没有提供用户名，返回所有路线
            query = """
            SELECT id, name, scenic_list, create_time
            FROM actions.routes
            ORDER BY create_time DESC;
            """
            cursor.execute(query)

        routes = cursor.fetchall()

        result = []
        for route in routes:
            # 解析点位计算距离
            try:
                points = json.loads(route['scenic_list']) if route['scenic_list'] else []
            except:
                points = []

            distance = calculate_total_distance(points)

            result.append({
                "id": route['id'],
                "name": route['name'],
                "distance": distance,
                "points_count": len(points),
                "create_time": route['create_time'].isoformat() if route['create_time'] else None
            })

        return {"success": True, "count": len(result), "data": result}

    except Exception as e:
        print(f"Error querying routes summary: {e}")
        return {"success": False, "error": str(e), "data": []}
    finally:
        cursor.close()
        conn.close()

@router.get("/{route_id}")
def get_route_by_id(route_id: int):
    """根据 ID 获取单个路线"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT id, user_id, name, scenic_list, description, create_time
        FROM actions.routes WHERE id = %s;
        """
        cursor.execute(query, (route_id,))
        route = cursor.fetchone()

        if route:
            return {"success": True, "data": parse_route(route)}
        else:
            return {"success": False, "error": "Route not found"}

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cursor.close()
        conn.close()

@router.post("")
def create_route(route: RouteCreate, username: Optional[str] = None):
    """创建新路线"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 获取用户ID
        if not username:
            return {"success": False, "error": "需要提供用户名"}

        user_id = get_user_id_by_username(username)
        if not user_id:
            return {"success": False, "error": "用户不存在"}

        # 转换 points 为 JSON 存入 scenic_list
        points_json = json.dumps([p.dict() for p in route.points])

        query = """
        INSERT INTO actions.routes (user_id, name, scenic_list, description, create_time)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING id, user_id, name, scenic_list, description, create_time;
        """
        cursor.execute(query, (user_id, route.name, points_json, route.description))
        conn.commit()

        new_route = cursor.fetchone()

        return {"success": True, "data": parse_route(new_route)}

    except Exception as e:
        conn.rollback()
        print(f"Error creating route: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}
    finally:
        cursor.close()
        conn.close()

@router.put("/{route_id}")
def update_route(route_id: int, route: RouteUpdate):
    """更新路线"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        updates = []
        values = []
        
        if route.name is not None:
            updates.append("name = %s")
            values.append(route.name)
        if route.description is not None:
            updates.append("description = %s")
            values.append(route.description)
        if route.points is not None:
            updates.append("scenic_list = %s")
            values.append(json.dumps([p.dict() for p in route.points]))
        
        if not updates:
            return {"success": False, "error": "No fields to update"}
        
        values.append(route_id)
        
        query = f"""
        UPDATE actions.routes SET {', '.join(updates)}
        WHERE id = %s
        RETURNING id, user_id, name, scenic_list, description, create_time;
        """
        cursor.execute(query, values)
        conn.commit()
        
        updated_route = cursor.fetchone()
        if updated_route:
            return {"success": True, "data": parse_route(updated_route)}
        else:
            return {"success": False, "error": "Route not found"}

    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        cursor.close()
        conn.close()

@router.delete("/{route_id}")
def delete_route(route_id: int):
    """删除路线"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = "DELETE FROM actions.routes WHERE id = %s RETURNING id;"
        cursor.execute(query, (route_id,))
        conn.commit()
        
        deleted = cursor.fetchone()
        if deleted:
            return {"success": True, "message": f"Route {route_id} deleted"}
        else:
            return {"success": False, "error": "Route not found"}

    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        cursor.close()
        conn.close()