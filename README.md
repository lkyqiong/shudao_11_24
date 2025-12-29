# 云游蜀道 WebGIS 系统

> "云上漫游，踏遍古今蜀路"

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)

## 项目简介

云游蜀道是一个基于 Vue 3 的 WebGIS 系统，以"地理关联 + AI 赋能"为核心，重塑蜀道文化的数字化传承。平台以**古迹篇、新景篇、脉络篇、行迹篇**为主线，从千年古道到现代文旅，从历史脉络到个性行程，打造一部可交互的蜀道百科全书，让你在地图中读史，在行走中感悟蜀道之魂。

### 核心特性

- 🗺️ **地图可视化**：基于 OpenLayers 的地理数据可视化展示
- 📊 **知识图谱**：ECharts 力导向布局呈现文化要素关联
- 🔍 **多维筛选**：按朝代、地点、类别等维度灵活检索
- 📍 **打卡收藏**：用户个性化景点打卡和收藏功能
- 🛤️ **路线规划**：支持 KML 文件导入和手动地图定点创建路线
- 👤 **用户管理**：完整的注册登录和用户数据隔离机制

## 技术栈

### 前端技术

- **核心框架**：Vue 3.5 (Composition API + `<script setup>`)
- **构建工具**：Vite 7.2
- **编程语言**：TypeScript / JavaScript
- **路由管理**：Vue Router 4
- **地图引擎**：OpenLayers 10.7
- **图表库**：ECharts 6.0
- **HTTP 客户端**：Fetch API / Axios

### 后端技术

- **Web 框架**：FastAPI (Python)
- **数据库**：PostgreSQL 14+
- **数据库驱动**：psycopg2
- **数据验证**：Pydantic
- **内网穿透**：natapp（用于数据库远程访问）

## 仓库架构

```
shudao_11_24/
├── backend/                    # 后端服务
│   ├── main.py                # FastAPI 主入口
│   ├── routes_api.py          # 路线管理 API
│   └── actions_api.py         # 用户行为 API（打卡、收藏）
│
├── src/                        # 前端源代码
│   ├── assets/                # 静态资源
│   │   ├── images/           # 图片资源
│   │   └── data/             # 本地数据文件（CSV）
│   │
│   ├── components/            # 公共组件
│   │   ├── common/           # 通用组件
│   │   │   ├── LeftSidebar.vue   # 左侧边栏
│   │   │   └── RightSidebar.vue  # 右侧边栏
│   │   ├── map/              # 地图组件
│   │   │   └── BaseMap.vue   # 基础地图组件
│   │   └── graph/            # 图谱组件
│   │       └── KnowledgeGraph.vue # 知识图谱
│   │
│   ├── views/                 # 页面组件
│   │   ├── auth/             # 认证页面
│   │   │   ├── Login.vue     # 登录页
│   │   │   └── Register.vue  # 注册页
│   │   ├── home/             # 首页
│   │   │   └── HomeLayout.vue
│   │   ├── heritage/         # 古迹篇
│   │   │   ├── HeritageLayout.vue
│   │   │   └── components/   # 子组件
│   │   ├── scenery/          # 新景篇
│   │   │   ├── SceneryLayout.vue
│   │   │   └── components/   # 景点详情、打卡组件
│   │   ├── network/          # 脉络篇
│   │   │   └── NetworkLayout.vue
│   │   ├── route/            # 行迹篇
│   │   │   └── RouteLayout.vue
│   │   └── user/             # 用户中心
│   │       └── Profile.vue
│   │
│   ├── services/              # API 服务层
│   │   ├── api.ts            # 通用数据接口
│   │   ├── routeService.ts   # 路线服务
│   │   └── checkinService.ts # 打卡收藏服务
│   │
│   ├── utils/                 # 工具函数
│   │   └── graphBuilder.ts   # 知识图谱构建工具
│   │
│   ├── router/                # 路由配置
│   │   └── index.ts
│   │
│   ├── App.vue               # 根组件
│   └── main.ts               # 入口文件
│
├── public/                     # 静态资源（不经过 Vite 处理）
├── package.json               # 前端依赖配置
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── 新电脑部署指南.md          # 部署文档
└── README.md                  # 本文件
```

## 快速开始

### 环境要求

- Node.js >= 16.0
- Python >= 3.8
- PostgreSQL >= 14.0
- npm 或 yarn

### 1. 克隆仓库

```bash
git clone https://github.com/lkyqiong/shudao_11_24.git
cd shudao_11_24
```

### 2. 前端安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev

# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

前端服务将运行在 `http://localhost:5173`

### 3. 后端安装与运行

```bash
# 进入后端目录
cd backend

# 安装 Python 依赖
pip install fastapi uvicorn psycopg2-binary pydantic

# 启动 FastAPI 服务（默认端口 8000）
python main.py
# 或使用 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端服务将运行在 `http://localhost:8000`
API 文档自动生成在 `http://localhost:8000/docs`

### 4. 数据库配置

#### 创建数据库

```sql
CREATE DATABASE shudao;
\c shudao;
```

#### 创建 Schema

```sql
CREATE SCHEMA geo;
CREATE SCHEMA poems;
CREATE SCHEMA heritage;
CREATE SCHEMA history;
CREATE SCHEMA scenic;
CREATE SCHEMA users;
CREATE SCHEMA tags;
CREATE SCHEMA actions;
```

#### 修改数据库连接配置

编辑 `backend/main.py` 和 `backend/routes_api.py`、`backend/actions_api.py` 中的数据库连接信息：

```python
DB_CONFIG = {
    "host": "localhost",      # 数据库地址
    "port": 5432,             # 数据库端口
    "dbname": "shudao",       # 数据库名称
    "user": "postgres",       # 用户名
    "password": "your_password"  # 密码
}
```

数据库表结构包括8个Schema（geo、poems、heritage、history、scenic、users、tags、actions），详细的表结构和字段说明请参考 `新电脑部署指南.md`

## 功能模块

### 🔐 认证系统

- 用户注册：创建账户，密码 SHA256 加密存储
- 用户登录：验证身份，LocalStorage 持久化会话
- 路由守卫：未登录用户自动跳转登录页

### 🏛️ 古迹篇

探索蜀道历史文化遗产，分为三个子模块：

- **诗词**：按朝代、作者、地点筛选诗词，地图标记展示诗词地理分布，热力图显示诗词密集区域
- **非遗**：按类别筛选非物质文化遗产，图表统计非遗分布
- **历史**：按时期、性质筛选历史事件，地图展示事件发生地点

### 🏞️ 新景篇

现代景点浏览与互动：

- **景点详情**：左侧边栏展示景点名称、等级、评分、推荐理由等信息
- **打卡功能**：右侧边栏支持景点打卡，可添加文字备注
- **收藏功能**：收藏喜欢的景点，实时显示收藏状态

### 🕸️ 脉络篇

知识图谱可视化展示文化要素关联：

- **图谱展示**：ECharts 力导向布局，诗词、非遗、历史、景点四类节点
- **关系构建**：基于地理位置、历史时期、人物等属性建立边关系
- **交互探索**：点击节点展开关联节点，筛选面板按维度过滤
- **数据统计**：实时显示各类数据数量分布

### 🛤️ 行迹篇

路线规划与管理：

- **预设路线**：展示金牛道、米仓道等经典蜀道路线
- **自定义路线**：支持上传 KML 文件或手动地图定点创建
- **路线详情**：查看路线剖面图、途经点、总距离等信息
- **用户隔离**：每个用户独立管理自己的路线

### 👤 用户中心

个人数据管理：

- **我的路线**：查看和管理已创建的路线
- **景点打卡**：查看打卡记录（景点名称、打卡时间、备注）
- **统计信息**：路线数量、打卡数量、总里程统计

## API 接口说明

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 数据查询接口

- `GET /api/poems` - 获取诗词数据
- `GET /api/heritage` - 获取非遗数据
- `GET /api/history` - 获取历史事件数据
- `GET /api/scenic` - 获取景点数据
- `GET /api/filters/options` - 获取筛选选项

### 路线接口

- `GET /api/routes?username=xxx` - 获取用户路线
- `POST /api/routes?username=xxx` - 创建路线
- `PUT /api/routes/{id}` - 更新路线
- `DELETE /api/routes/{id}` - 删除路线
- `GET /api/routes/summary?username=xxx` - 获取路线摘要

### 用户行为接口

- `POST /api/actions/checkins` - 创建打卡记录
- `GET /api/actions/checkins?username=xxx` - 获取打卡记录
- `POST /api/actions/favorites` - 添加收藏
- `DELETE /api/actions/favorites/{id}?username=xxx` - 取消收藏
- `GET /api/actions/favorites/check/{id}?username=xxx` - 检查收藏状态

详细接口文档：`http://localhost:8000/docs`（FastAPI 自动生成）

## 部署说明

### 前端部署

```bash
# 构建生产版本
npm run build

# dist 目录即为静态文件，可部署到 Nginx、Apache 等服务器
```

### 后端部署

```bash
# 使用 uvicorn 运行
uvicorn main:app --host 0.0.0.0 --port 8000

# 或使用 gunicorn（生产环境推荐）
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 数据库远程访问

本项目使用 **natapp** 进行内网穿透，将本地 PostgreSQL 数据库映射到公网端口，实现团队协作开发时的数据库远程访问。

**natapp 配置信息**：
- 官网地址：https://natapp.cn
- 转发地址：`tcp://0706193a7e944d72.natapp.cc:30543 -> 127.0.0.1:5432`
- 版本：2.5.1

详细部署步骤请参考 `新电脑部署指南.md`
不过这个接口有效期有限

## 开发团队

**本组成员**：李坤阳，蔡佳彤，薛景阳

同时，感谢另外六位同学在上一个版本中的贡献：

- **网页开发方向**：袁世蓉，陈亚涵，黄岚，胡思琪
- **美术设计方向**：陈淑涵，王子瑶

## 版本历史

### 当前版本主要更新

1. 整体架构重构（前后端分离）
2. 知识图谱的重构、可视化与交互
3. 新景篇加入打卡和收藏功能
4. 行迹篇支持用户自定义路线（KML 导入、手动绘制）
5. 可视化部分（空间可视化、图表可视化）的完善与优化
6. 多用户数据隔离机制

### 上一个版本

- Gitee 地址：https://gitee.com/chen-yahan/yun-you-shu-dao

## 联系我们

- 📧 **邮箱**：2109451644@qq.com
- 📱 **电话**：18651653892
- 🐙 **GitHub**：https://github.com/lkyqiong/shudao_11_24

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](LICENSE)

---

© 2024 云游蜀道团队. All Rights Reserved.
