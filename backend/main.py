from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any
import hashlib
from datetime import datetime

# 导入路线 API 模块
from routes_api import router as routes_router
# 导入用户行为 API 模块
from actions_api import router as actions_router

app = FastAPI()

# 注册路线 API 路由
app.include_router(routes_router)
# 注册用户行为 API 路由
app.include_router(actions_router)

# 配置 CORS，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",  # 添加 5176 端口
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接配置（本地连接）
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "shudao",
    "user": "postgres",
    "password": "123456"  # 修改为你的实际密码
}

def get_db_connection():
    """获取数据库连接"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

# ==================== 用户认证相关 ====================

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

def hash_password(password: str) -> str:
    """使用 SHA256 加密密码"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/api/auth/register")
def register_user(user: UserRegister):
    """用户注册"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 检查用户名是否已存在
        cursor.execute(
            "SELECT id FROM users.users WHERE username = %s",
            (user.username,)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="用户名已存在")

        # 2. 加密密码
        hashed_password = hash_password(user.password)

        # 3. 插入新用户
        cursor.execute(
            """
            INSERT INTO users.users (username, password, role_id)
            VALUES (%s, %s, 1)
            RETURNING id, username, create_time
            """,
            (user.username, hashed_password)
        )

        new_user = cursor.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": "注册成功",
            "data": {
                "id": new_user['id'],
                "username": new_user['username'],
                "create_time": new_user['create_time'].isoformat() if new_user['create_time'] else None
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(f"Error registering user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"注册失败: {str(e)}")

    finally:
        cursor.close()
        conn.close()

@app.post("/api/auth/login")
def login_user(user: UserLogin):
    """用户登录"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 查询用户
        hashed_password = hash_password(user.password)
        cursor.execute(
            """
            SELECT id, username, avatar_url, create_time, role_id
            FROM users.users
            WHERE username = %s AND password = %s
            """,
            (user.username, hashed_password)
        )

        user_data = cursor.fetchone()

        if not user_data:
            raise HTTPException(status_code=401, detail="用户名或密码错误")

        return {
            "success": True,
            "message": "登录成功",
            "data": {
                "id": user_data['id'],
                "username": user_data['username'],
                "avatar_url": user_data['avatar_url'],
                "create_time": user_data['create_time'].isoformat() if user_data['create_time'] else None,
                "role_id": user_data['role_id']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error logging in: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")

    finally:
        cursor.close()
        conn.close()

# ==================== 数据API ====================

@app.get("/")
def read_root():
    return {"message": "蜀道数据可视化 API 服务运行中"}

@app.get("/api/poems")
def get_poems():
    """
    获取所有诗词数据及其对应的地理位置（经纬度）
    直接从 poems 表读取 latitude 和 longitude 字段
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 直接查询诗词表，过滤掉无效的经纬度值
        query = """
        SELECT
            id,
            name,
            author,
            dynasty,
            content,
            keywords,
            poemtype,
            city,
            county,
            province,
            longitude,
            latitude
        FROM poems.poems
        WHERE longitude IS NOT NULL
          AND latitude IS NOT NULL
          AND longitude <> 'NaN'::float
          AND latitude <> 'NaN'::float
          AND longitude BETWEEN -180 AND 180
          AND latitude BETWEEN -90 AND 90
        ORDER BY id;
        """

        cursor.execute(query)
        poems = cursor.fetchall()

        # 转换为字典列表，并再次验证数值有效性
        result = []
        for poem in poems:
            poem_dict = dict(poem)
            # 确保经纬度是有效数值
            try:
                lon = float(poem_dict['longitude'])
                lat = float(poem_dict['latitude'])
                # 检查是否为有限数值
                if -180 <= lon <= 180 and -90 <= lat <= 90:
                    result.append(poem_dict)
            except (ValueError, TypeError):
                # 跳过无效数据
                continue

        return {
            "success": True,
            "count": len(result),
            "data": result
        }

    except Exception as e:
        print(f"Error querying poems: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

    finally:
        cursor.close()
        conn.close()

@app.get("/api/poems/{poem_id}")
def get_poem_by_id(poem_id: int):
    """
    根据 ID 获取单个诗词详情
    直接从 poems 表读取 latitude 和 longitude 字段
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT
            id,
            name,
            author,
            dynasty,
            content,
            keywords,
            poemtype,
            city,
            county,
            province,
            longitude,
            latitude
        FROM poems.poems
        WHERE id = %s;
        """

        cursor.execute(query, (poem_id,))
        poem = cursor.fetchone()

        if poem:
            return {
                "success": True,
                "data": dict(poem)
            }
        else:
            return {
                "success": False,
                "error": "Poem not found"
            }

    except Exception as e:
        print(f"Error querying poem: {e}")
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        cursor.close()
        conn.close()

@app.get("/api/heritage")
def get_heritage():
    """
    获取所有非遗数据及其对应的地理位置（经纬度）
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT
            id,
            name,
            rx_time,
            content,
            province,
            type,
            longitude,
            latitude
        FROM heritage.heritage
        WHERE longitude IS NOT NULL
          AND latitude IS NOT NULL
          AND longitude <> 'NaN'::float
          AND latitude <> 'NaN'::float
          AND longitude BETWEEN -180 AND 180
          AND latitude BETWEEN -90 AND 90
        ORDER BY id;
        """

        cursor.execute(query)
        items = cursor.fetchall()

        result = []
        for item in items:
            item_dict = dict(item)
            try:
                lon = float(item_dict['longitude'])
                lat = float(item_dict['latitude'])
                if -180 <= lon <= 180 and -90 <= lat <= 90:
                    result.append(item_dict)
            except (ValueError, TypeError):
                continue

        return {
            "success": True,
            "count": len(result),
            "data": result
        }

    except Exception as e:
        print(f"Error querying heritage: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

    finally:
        cursor.close()
        conn.close()

@app.get("/api/history")
def get_history():
    """
    获取所有历史数据及其对应的地理位置（经纬度）
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT
            id,
            name,
            people,
            description,
            province,
            property,
            city,
            county,
            period,
            longitude,
            latitude
        FROM history.history
        WHERE longitude IS NOT NULL
          AND latitude IS NOT NULL
          AND longitude <> 'NaN'::float
          AND latitude <> 'NaN'::float
          AND longitude BETWEEN -180 AND 180
          AND latitude BETWEEN -90 AND 90
        ORDER BY id;
        """

        cursor.execute(query)
        items = cursor.fetchall()

        result = []
        for item in items:
            item_dict = dict(item)
            try:
                lon = float(item_dict['longitude'])
                lat = float(item_dict['latitude'])
                if -180 <= lon <= 180 and -90 <= lat <= 90:
                    result.append(item_dict)
            except (ValueError, TypeError):
                continue

        return {
            "success": True,
            "count": len(result),
            "data": result
        }

    except Exception as e:
        print(f"Error querying history: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

    finally:
        cursor.close()
        conn.close()

@app.get("/api/scenic")
def get_scenic():
    """
    获取所有景点数据及其对应的地理位置（经纬度）
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        SELECT
            id,
            name,
            description,
            place,
            score,
            sight_level,
            price,
            longitude,
            latitude,
            recommend_reason,
            comment
        FROM scenic.scenic
        WHERE longitude IS NOT NULL
          AND latitude IS NOT NULL
          AND longitude <> 'NaN'::float
          AND latitude <> 'NaN'::float
          AND longitude BETWEEN -180 AND 180
          AND latitude BETWEEN -90 AND 90
        ORDER BY id;
        """

        cursor.execute(query)
        items = cursor.fetchall()

        result = []
        for item in items:
            item_dict = dict(item)
            try:
                lon = float(item_dict['longitude'])
                lat = float(item_dict['latitude'])
                if -180 <= lon <= 180 and -90 <= lat <= 90:
                    result.append(item_dict)
            except (ValueError, TypeError):
                continue

        return {
            "success": True,
            "count": len(result),
            "data": result
        }

    except Exception as e:
        print(f"Error querying scenic: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

    finally:
        cursor.close()
        conn.close()

@app.get("/api/filters/options")
def get_filter_options():
    """
    获取所有筛选字段的可选值
    用于知识图谱的高级筛选功能
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        options = {}

        # 1. 获取所有朝代（诗词）
        cursor.execute("SELECT DISTINCT dynasty FROM poems.poems WHERE dynasty IS NOT NULL AND dynasty != '' ORDER BY dynasty")
        options['dynasties'] = [row['dynasty'] for row in cursor.fetchall()]

        # 2. 获取所有作者（诗词）
        cursor.execute("SELECT DISTINCT author FROM poems.poems WHERE author IS NOT NULL AND author != '' ORDER BY author")
        options['authors'] = [row['author'] for row in cursor.fetchall()]

        # 3. 获取所有诗词类型
        cursor.execute("SELECT DISTINCT poemtype FROM poems.poems WHERE poemtype IS NOT NULL AND poemtype != '' ORDER BY poemtype")
        options['poemtypes'] = [row['poemtype'] for row in cursor.fetchall()]

        # 4. 获取所有关键词（诗词）- 可能需要拆分
        cursor.execute("SELECT DISTINCT keywords FROM poems.poems WHERE keywords IS NOT NULL AND keywords != '' LIMIT 100")
        keywords_set = set()
        for row in cursor.fetchall():
            if row['keywords']:
                # 假设关键词可能用逗号或空格分隔
                keywords_set.update([k.strip() for k in str(row['keywords']).split(',') if k.strip()])
        options['keywords'] = sorted(list(keywords_set))[:50]  # 限制数量

        # 5. 获取所有非遗入选时间
        cursor.execute("SELECT DISTINCT rx_time FROM heritage.heritage WHERE rx_time IS NOT NULL AND rx_time != '' ORDER BY rx_time")
        options['rx_times'] = [row['rx_time'] for row in cursor.fetchall()]

        # 6. 获取所有非遗类型
        cursor.execute("SELECT DISTINCT type FROM heritage.heritage WHERE type IS NOT NULL AND type != '' ORDER BY type")
        options['heritage_types'] = [row['type'] for row in cursor.fetchall()]

        # 7. 获取所有历史人物
        cursor.execute("SELECT DISTINCT people FROM history.history WHERE people IS NOT NULL AND people != '' ORDER BY people")
        options['people'] = [row['people'] for row in cursor.fetchall()]

        # 8. 获取所有历史时期
        cursor.execute("SELECT DISTINCT period FROM history.history WHERE period IS NOT NULL AND period != '' ORDER BY period")
        options['periods'] = [row['period'] for row in cursor.fetchall()]

        # 9. 获取所有历史事件性质
        cursor.execute("SELECT DISTINCT property FROM history.history WHERE property IS NOT NULL AND property != '' ORDER BY property")
        options['properties'] = [row['property'] for row in cursor.fetchall()]

        # 10. 获取所有景点等级
        cursor.execute("SELECT DISTINCT sight_level FROM scenic.scenic WHERE sight_level IS NOT NULL AND sight_level != '' ORDER BY sight_level")
        options['sight_levels'] = [row['sight_level'] for row in cursor.fetchall()]

        # 11. 获取所有省份（从所有表汇总）
        provinces_set = set()
        cursor.execute("SELECT DISTINCT province FROM poems.poems WHERE province IS NOT NULL AND province != ''")
        provinces_set.update([row['province'] for row in cursor.fetchall()])
        cursor.execute("SELECT DISTINCT province FROM heritage.heritage WHERE province IS NOT NULL AND province != ''")
        provinces_set.update([str(row['province']) for row in cursor.fetchall()])
        cursor.execute("SELECT DISTINCT province FROM history.history WHERE province IS NOT NULL AND province != ''")
        provinces_set.update([str(row['province']) for row in cursor.fetchall()])
        options['provinces'] = sorted(list(provinces_set))

        # 12. 获取所有城市
        cities_set = set()
        cursor.execute("SELECT DISTINCT city FROM poems.poems WHERE city IS NOT NULL AND city != ''")
        cities_set.update([row['city'] for row in cursor.fetchall()])
        cursor.execute("SELECT DISTINCT city FROM history.history WHERE city IS NOT NULL AND city != ''")
        cities_set.update([row['city'] for row in cursor.fetchall()])
        options['cities'] = sorted(list(cities_set))

        # 13. 获取所有区县
        counties_set = set()
        cursor.execute("SELECT DISTINCT county FROM poems.poems WHERE county IS NOT NULL AND county != ''")
        counties_set.update([row['county'] for row in cursor.fetchall()])
        cursor.execute("SELECT DISTINCT county FROM history.history WHERE county IS NOT NULL AND county != ''")
        counties_set.update([row['county'] for row in cursor.fetchall()])
        options['counties'] = sorted(list(counties_set))

        # 14. 获取评分范围（景点）
        cursor.execute("SELECT MIN(score) as min_score, MAX(score) as max_score FROM scenic.scenic WHERE score IS NOT NULL")
        score_range = cursor.fetchone()
        options['score_range'] = {
            'min': float(score_range['min_score']) if score_range['min_score'] else 0,
            'max': float(score_range['max_score']) if score_range['max_score'] else 5
        }

        return {
            "success": True,
            "data": options
        }

    except Exception as e:
        print(f"Error getting filter options: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    print("启动 FastAPI 服务器...")
    print("API 地址: http://localhost:8000")
    print("API 文档: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
