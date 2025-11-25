# Vue 3 + TypeScript + Vite

# 云游蜀道 WebGIS 系统

## 项目简介

云游蜀道是一个基于 Vue3 的 WebGIS 系统，通过"地理关联 + AI 赋能"重塑蜀道文化的数字化传承。

## 技术栈

- **前端框架**: Vue 3 + Vite
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **地图库**: Mapbox GL JS
- **图表库**: ECharts
- **HTTP 客户端**: Axios

## 项目结构

```
cloud-tour-shudao/
├── public/                    # 静态资源
├── src/
│   ├── assets/               # 资源文件
│   │   ├── images/          # 图片资源
│   │   └── styles/          # 全局样式
│   │       └── global.scss
│   ├── components/           # 公共组件
│   │   ├── common/          # 通用组件
│   │   │   ├── Header.vue   # 头部导航
│   │   │   ├── Sidebar.vue  # 侧边栏
│   │   │   └── AIChat.vue   # AI对话组件
│   │   ├── map/             # 地图相关组件
│   │   │   ├── BaseMap.vue  # 基础地图
│   │   │   ├── HeatMap.vue  # 热力图
│   │   │   └── MarkerPopup.vue # 标记弹窗
│   │   └── charts/          # 图表组件
│   │       ├── PieChart.vue
│   │       └── BarChart.vue
│   ├── views/               # 页面组件
│   │   ├── auth/           # 认证页面
│   │   │   ├── Login.vue   # 登录页
│   │   │   └── Register.vue # 注册页
│   │   ├── home/           # 首页系列
│   │   │   ├── HomeLayout.vue
│   │   │   ├── Introduction.vue
│   │   │   ├── Help.vue
│   │   │   ├── Version.vue
│   │   │   ├── Contact.vue
│   │   │   └── About.vue
│   │   ├── heritage/       # 古迹篇
│   │   │   ├── HeritageLayout.vue
│   │   │   ├── Poetry.vue  # 诗词
│   │   │   ├── Intangible.vue # 非遗
│   │   │   └── History.vue # 历史
│   │   ├── scenery/        # 新景篇
│   │   │   └── SceneryLayout.vue
│   │   ├── network/        # 脉络篇
│   │   │   └── NetworkLayout.vue
│   │   ├── route/          # 行迹篇
│   │   │   └── RouteLayout.vue
│   │   └── user/           # 用户中心
│   │       └── Profile.vue
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── stores/             # 状态管理
│   │   ├── user.js         # 用户状态
│   │   ├── map.js          # 地图状态
│   │   └── chat.js         # 对话状态
│   ├── api/                # API接口
│   │   ├── auth.js         # 认证接口
│   │   ├── heritage.js     # 古迹接口
│   │   ├── scenery.js      # 景点接口
│   │   └── route.js        # 路线接口
│   ├── utils/              # 工具函数
│   │   ├── request.js      # HTTP请求封装
│   │   └── mapUtils.js     # 地图工具
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── shims-vue.d.ts      # 让 TS 知道 .vue 文件是 Vue 组件，可以导入
├── .env                    # 环境变量
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 功能模块

### 1. 认证系统（页面 1-2）
- 登录页面：用户名密码登录
- 注册页面：新用户注册
- 点击"去登录"/"去注册"可切换页面

### 2. 首页系列（页面 3-7）
登录成功后跳转到首页，包含以下子页面：
- **平台简介**: 系统介绍和功能概览
- **使用帮助**: 操作指南
- **版本介绍**: 版本更新说明
- **联系我们**: 联系方式
- **关于我们**: 团队信息

### 3. 古迹篇（页面 8-18）
展示蜀道历史文化遗产，分为三个部分：

#### 诗词部分（页面 8-12）
- 筛选功能：按朝代、诗人、地点筛选
- 图表展示：可视化诗词分布统计
- 诗文地脉：地图展示诗词分布
- 详情展示：点击地图标记查看诗词详情
- 热力图：展示诗词密集区域

#### 非遗部分（页面 13-15）
- 筛选展示：按类别筛选非遗项目
- 图表展示：可视化非遗分布
- 详情展示：点击地图查看非遗详情

#### 历史部分（页面 16-18）
- 筛选功能：按朝代、事件类型筛选
- 图表展示：历史事件时间轴
- 详情展示：查看历史事件详情

### 4. 新景篇（页面 19-22）
- 景点信息：左侧边栏显示景点详情
- 打卡功能：点击打卡按钮记录游览
- 上传文件：支持上传图片和文字记录
- AI对话：右侧AI助手解答景点问题

### 5. 脉络篇（页面 23-24）
- 知识图谱：可视化展示蜀道文化关系网络
- 筛选查询：按类型、地点筛选节点
- AI对话：辅助理解知识关联

### 6. 行迹篇（页面 25-26）
- 路线展示：显示路线详情和剖面图
- 添加路线：
  - 上传KML文件导入路线
  - 手动地图定点创建路线
- 路线管理：保存和编辑个人路线

### 7. 用户中心（页面 27-29）
- 我的路线：查看保存的路线
- 已打卡景点：查看打卡记录
- 我的蜀片：查看上传的图片
- 我的碎片：查看文字记录
- 用户信息：个人资料管理

## 核心特性

### AI 对话功能
- 点击右上角 AI 图标或搜索框右侧按钮打开
- 支持关于蜀道的各类问题咨询
- 在各个页面保持上下文连续性

### 侧边栏设计
- 左侧边栏：筛选条件和图表展示
- 右侧边栏：AI 对话界面
- 点击小箭头图标可展开/收起

### 导航系统
- 顶部导航：古迹篇、新景篇、脉络篇、行迹篇
- 右上角：AI 对话、搜索、用户中心、首页按钮
- 各页面间可灵活跳转

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 环境变量配置

创建 `.env` 文件：
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## 开发规范

### 组件命名
- 使用 PascalCase 命名组件文件
- 组件名应具有描述性

### 代码风格
- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法
- 合理使用 TypeScript（可选）

### 样式规范
- 使用 SCSS 预处理器
- 采用 scoped 样式避免污染
- 统一使用设计系统的颜色和尺寸变量

## 后端接口要求

所有接口返回格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 注意事项

1. **地图密钥**: 需要配置 Mapbox API Token
2. **图片资源**: 需要准备相应的图片素材
3. **API 接口**: 需要对接后端 API
4. **浏览器兼容**: 推荐使用现代浏览器（Chrome, Firefox, Edge）

## 待实现功能

- [ ] 完善所有页面的具体实现
- [ ] 集成真实的地图数据
- [ ] 实现 AI 对话功能
- [ ] 完善用户权限管理
- [ ] 添加数据缓存机制
- [ ] 优化移动端适配
- [ ] 添加单元测试

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
