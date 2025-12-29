<template>
  <div class="profile-page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <!-- 中间导航菜单 -->
      <div class="nav-menu">
        <div class="nav-item" @click="goToHeritage">古迹篇</div>
        <div class="nav-item" @click="goToScenery">新景篇</div>
        <div class="nav-item" @click="goToNetwork">脉络篇</div>
        <div class="nav-item" @click="goToRoute">行迹篇</div>
      </div>

      <div class="header-right">
        <button class="home-btn" @click="goToHome">首页</button>
      </div>
    </div>

    <!-- ==================== Banner 封面图 ==================== -->
    <div class="banner">
      <div class="edit-cover">编辑封面照片</div>
    </div>

    <!-- ==================== 个人资料区域 ==================== -->
    <div class="profile-section">
      <!-- 用户基本信息 -->
      <div class="user-info">
        <div class="user-avatar"></div>
        <div class="user-details">
          <div class="username">{{ username }}</div>
          <div class="user-title">蜀道探索者</div>
        </div>
        <!-- 设置按钮 -->
        <div class="settings-container">
          <div class="settings-btn" @click="toggleSettings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <!-- 下拉菜单 -->
          <div v-if="showSettings" class="settings-menu">
            <div class="menu-item" @click="handleLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              退出登录
            </div>
          </div>
        </div>
      </div>

      <!-- 数据统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon routes-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ routesList.length }}</div>
            <div class="stat-label">条路线</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon checkin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ checkinCount }}</div>
            <div class="stat-label">个打卡</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon distance-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalDistance }}</div>
            <div class="stat-label">公里</div>
          </div>
        </div>
      </div>

      <!-- 内容区域 - 左右布局 -->
      <div class="content-grid">
        <!-- 左侧：我的路线 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h4l3-9 4 18 3-9h4"/>
              </svg>
              我的路线
            </div>
            <button class="add-btn" @click="goToRoute">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              创建
            </button>
          </div>

          <div class="card-body">
            <!-- 加载状态 -->
            <div v-if="loadingRoutes" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="routesList.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 12h4l3-9 4 18 3-9h4"/>
                </svg>
              </div>
              <div class="empty-text">暂无自定义路线</div>
              <div class="empty-hint">去行迹篇创建你的第一条路线</div>
            </div>

            <!-- 路线列表 -->
            <div v-else class="list-container">
              <div
                v-for="(route, index) in routesList"
                :key="route.id"
                class="list-item"
                @click="goToRouteDetail(route.id)"
              >
                <div class="item-index">{{ index + 1 }}</div>
                <div class="item-content">
                  <div class="item-name">{{ route.name }}</div>
                  <div class="item-meta">
                    <span>{{ route.points_count }}个点位</span>
                  </div>
                </div>
                <div class="item-value">{{ formatDistance(route.distance) }}</div>
                <div class="item-arrow">›</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：景点打卡 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              景点打卡
            </div>
            <button class="add-btn" @click="goToScenery">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              </svg>
              去打卡
            </button>
          </div>

          <div class="card-body">
            <!-- 加载状态 -->
            <div v-if="loadingCheckins" class="loading-state">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="checkinList.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="empty-text">暂无打卡记录</div>
              <div class="empty-hint">去新景篇探索景点并打卡</div>
            </div>

            <!-- 打卡列表 -->
            <div v-else class="list-container">
              <div
                v-for="checkin in checkinList"
                :key="checkin.id"
                class="list-item"
              >
                <div class="item-icon checkin">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div class="item-content">
                  <div class="item-name">{{ checkin.scenic_name || '未知景点' }}</div>
                  <div class="item-meta">
                    <span>{{ formatTime(checkin.checkin_time) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getRoutesSummary, type RouteSummary } from '@/services/routeService';
  import { getCheckins, type Checkin } from '@/services/checkinService';

  const router = useRouter();

  // 用户名
  const username = ref('User');

  // 控制设置菜单的显示
  const showSettings = ref(false);

  // 路线数据
  const routesList = ref<RouteSummary[]>([]);
  const loadingRoutes = ref(true);

  // 打卡数据
  const checkinList = ref<Checkin[]>([]);
  const loadingCheckins = ref(false);
  const checkinCount = computed(() => checkinList.value.length);

  // 计算总里程
  const totalDistance = computed(() => {
    const total = routesList.value.reduce((sum, r) => sum + (r.distance || 0), 0);
    return total.toFixed(1);
  });

  /**
   * 格式化距离显示
   */
  const formatDistance = (distance: number): string => {
    if (!distance) return '0m';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  /**
   * 格式化时间
   */
  const formatTime = (time: string): string => {
    if (!time) return '';
    const date = new Date(time);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  /**
   * 加载用户路线
   */
  const loadRoutes = async () => {
    loadingRoutes.value = true;
    try {
      if (username.value) {
        routesList.value = await getRoutesSummary(username.value);
      }
    } catch (error) {
      console.error('加载路线失败:', error);
    } finally {
      loadingRoutes.value = false;
    }
  };

  /**
   * 加载用户打卡记录
   */
  const loadCheckins = async () => {
    loadingCheckins.value = true;
    try {
      if (username.value) {
        checkinList.value = await getCheckins(username.value);
      }
    } catch (error) {
      console.error('加载打卡记录失败:', error);
      checkinList.value = [];
    } finally {
      loadingCheckins.value = false;
    }
  };

  /**
   * 组件挂载时获取用户名和数据
   */
  onMounted(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      username.value = savedUsername;
    }
    loadRoutes();
    loadCheckins();
  });

  /**
   * 切换设置菜单显示状态
   */
  const toggleSettings = () => {
    showSettings.value = !showSettings.value;
  };

  /**
   * 退出登录
   */
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    router.push('/login');
  };

  /**
   * 跳转到路线详情
   */
  const goToRouteDetail = (routeId: number) => {
    router.push(`/route?id=${routeId}`);
  };

  // 导航方法
  const goToHome = () => router.push('/home');
  const goToHeritage = () => router.push('/heritage');
  const goToScenery = () => router.push('/scenery');
  const goToNetwork = () => router.push('/network');
  const goToRoute = () => router.push('/route');
</script>

<style scoped>
  /* ==================== 用户中心主体 ==================== */
  .profile-page {
    width: 100vw;
    height: 100vh;
    background: #f5f5f5;
    overflow-y: auto;
  }

  /* ==================== 顶部导航栏 ==================== */
  .header {
    background: #5a9090;
    padding: 1vh 3vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    height: 8vh;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1vw;
  }

  .logo-icon {
    width: 3vw;
    height: 3vw;
    background: white;
    border-radius: 5px;
    background-image: url('@/assets/images/logo.png');
    background-size: cover;
    background-position: center;
  }

  .logo-text {
    width: 10vw;
    font-size: 1.8vw;
    color: white;
    font-weight: bold;
  }

  .nav-menu {
    display: flex;
    gap: 2.5vw;
    align-items: center;
  }

  .nav-item {
    color: white;
    font-size: 1.2vw;
    cursor: pointer;
    width: 5vw;
    text-align: center;
    transition: opacity 0.3s;
  }

  .nav-item:hover {
    opacity: 0.8;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1.5vw;
  }

  .ai-btn {
    background: white;
    border: 2px solid white;
    border-radius: 50%;
    width: 3.5vw;
    height: 3.5vw;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1vw;
    color: #5a9090;
    cursor: pointer;
    font-weight: bold;
  }

  .search-box {
    width: 20vw;
    padding: 0.8vh 1.5vw;
    border: none;
    border-radius: 25px;
    font-size: 0.9vw;
    outline: none;
  }

  .home-btn {
    background: white;
    color: #5a9090;
    padding: 0.8vh 2vw;
    border: none;
    border-radius: 20px;
    font-size: 1vw;
    cursor: pointer;
    font-weight: bold;
  }

  /* ==================== Banner 封面图 ==================== */
  .banner {
    height: 28vh;
    background-image: url('@/assets/images/banner-bg.jpg');
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 2vh 4vw;
  }

  .edit-cover {
    background: rgba(255, 255, 255, 0.9);
    padding: 0.8vh 1.5vw;
    border-radius: 5px;
    color: #333;
    font-size: 0.9vw;
    cursor: pointer;
  }

  /* ==================== 个人资料区域 ==================== */
  .profile-section {
    background: #e8e8e8;
    padding: 3vh 5vw 4vh;
    min-height: 64vh;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 2vw;
    margin-bottom: 3vh;
    position: relative;
  }

  .user-avatar {
    width: 7vw;
    height: 7vw;
    border-radius: 50%;
    background: white;
    border: 4px solid white;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    background-image: url('@/assets/images/user-avatar.png');
    background-size: cover;
    background-position: center;
  }

  .user-details {
    flex: 1;
  }

  .username {
    font-size: 2vw;
    color: #333;
    font-weight: bold;
    margin-bottom: 0.3vh;
  }

  .user-title {
    font-size: 0.95vw;
    color: #5a9090;
    font-weight: 500;
  }

  /* ==================== 设置按钮 ==================== */
  .settings-container {
    position: relative;
  }

  .settings-btn {
    width: 2.8vw;
    height: 2.8vw;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .settings-btn svg {
    width: 1.4vw;
    height: 1.4vw;
    color: #5a9090;
    transition: transform 0.3s;
  }

  .settings-btn:hover {
    background: #5a9090;
    transform: rotate(45deg);
  }

  .settings-btn:hover svg {
    color: white;
  }

  .settings-menu {
    position: absolute;
    top: 3.5vw;
    right: 0;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 100;
    min-width: 140px;
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    color: #666;
    font-size: 0.95vw;
    cursor: pointer;
    transition: all 0.2s;
  }

  .menu-item svg {
    width: 1.1vw;
    height: 1.1vw;
  }

  .menu-item:hover {
    background: #fff5f5;
    color: #e74c3c;
  }

  /* ==================== 统计卡片 ==================== */
  .stats-cards {
    display: flex;
    gap: 1.5vw;
    margin-bottom: 3vh;
  }

  .stat-card {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 2vh 2vw;
    display: flex;
    align-items: center;
    gap: 1.2vw;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 3.5vw;
    height: 3.5vw;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon svg {
    width: 1.8vw;
    height: 1.8vw;
    color: white;
  }

  .stat-icon.routes-icon {
    background: linear-gradient(135deg, #5a9090 0%, #4a7a7a 100%);
  }

  .stat-icon.checkin-icon {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .stat-icon.distance-icon {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8vw;
    font-weight: 700;
    color: #333;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.9vw;
    color: #888;
  }

  /* ==================== 内容网格 ==================== */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2vw;
  }

  .content-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2vh 2vw;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.6vw;
    font-size: 1.1vw;
    font-weight: 600;
    color: #333;
  }

  .card-title svg {
    width: 1.2vw;
    height: 1.2vw;
    color: #5a9090;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 0.4vw;
    padding: 0.8vh 1.2vw;
    background: linear-gradient(135deg, #5a9090 0%, #4a7a7a 100%);
    border: none;
    border-radius: 20px;
    color: white;
    font-size: 0.85vw;
    cursor: pointer;
    transition: all 0.3s;
  }

  .add-btn svg {
    width: 0.9vw;
    height: 0.9vw;
  }

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(90, 144, 144, 0.3);
  }

  .card-body {
    padding: 1.5vh 0;
    min-height: 30vh;
    max-height: 35vh;
    overflow-y: auto;
  }

  /* ==================== 列表样式 ==================== */
  .list-container {
    padding: 0 1vw;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 1vw;
    padding: 1.5vh 1.5vw;
    margin: 0 1vw 1vh;
    background: #f8f9fa;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .list-item:hover {
    background: #f0f0f0;
    transform: translateX(5px);
  }

  .item-index {
    width: 2vw;
    height: 2vw;
    background: linear-gradient(135deg, #5a9090 0%, #4a7a7a 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.9vw;
  }

  .item-icon {
    width: 2vw;
    height: 2vw;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-icon.checkin {
    background: #d4edda;
  }

  .item-icon.checkin svg {
    width: 1vw;
    height: 1vw;
    color: #28a745;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 0.95vw;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-meta {
    font-size: 0.8vw;
    color: #999;
    margin-top: 2px;
  }

  .item-value {
    font-size: 0.95vw;
    font-weight: 600;
    color: #5a9090;
  }

  .item-arrow {
    font-size: 1.2vw;
    color: #ccc;
    transition: all 0.3s;
  }

  .list-item:hover .item-arrow {
    color: #5a9090;
    transform: translateX(3px);
  }

  /* ==================== 状态样式 ==================== */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 6vh 0;
    color: #999;
  }

  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #eee;
    border-top-color: #5a9090;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5vh 2vw;
    color: #bbb;
  }

  .empty-icon {
    width: 4vw;
    height: 4vw;
    margin-bottom: 1.5vh;
    opacity: 0.4;
  }

  .empty-icon svg {
    width: 100%;
    height: 100%;
    color: #999;
  }

  .empty-text {
    font-size: 1vw;
    font-weight: 500;
    color: #999;
    margin-bottom: 0.5vh;
  }

  .empty-hint {
    font-size: 0.85vw;
    color: #bbb;
  }

  /* 滚动条 */
  .card-body::-webkit-scrollbar {
    width: 5px;
  }

  .card-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .card-body::-webkit-scrollbar-thumb {
    background: rgba(90, 144, 144, 0.2);
    border-radius: 3px;
  }

  .card-body::-webkit-scrollbar-thumb:hover {
    background: rgba(90, 144, 144, 0.4);
  }
</style>