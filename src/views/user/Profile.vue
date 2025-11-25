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
        <div class="ai-btn">AI</div>
        <input type="text" class="search-box" placeholder="询问问题..." />
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
        <div class="username">{{ username }}</div>
        <!-- 设置按钮 -->
        <div class="settings-container">
          <img
            src="@/assets/images/set_up.png"
            alt="设置"
            class="settings-btn"
            @click="toggleSettings"
          />
          <!-- 下拉菜单 -->
          <div v-if="showSettings" class="settings-menu">
            <div class="menu-item" @click="handleLogout">退出登录</div>
          </div>
        </div>
      </div>

      <!-- 用户统计数据 -->
      <div class="stats">
        <div class="stat-item">我的路线(2)</div>
        <div class="stat-item">已打卡的景点(11)</div>
        <div class="stat-item">我的蜀片(3)</div>
        <div class="stat-item">我的碎片(7)</div>
      </div>

      <!-- 用户路线列表 -->
      <div class="routes-section">
        <div class="route-item">
          <div class="route-name">1 | 翠云廊穿越路线</div>
          <div class="route-distance">5km</div>
        </div>
        <div class="route-item">
          <div class="route-name">2 | 凉山乡-普安镇-汉阳镇轻装徒步</div>
          <div class="route-distance">25km</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  // 用户名
  const username = ref('User');

  // 控制设置菜单的显示
  const showSettings = ref(false);

  /**
   * 组件挂载时获取用户名
   */
  onMounted(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      username.value = savedUsername;
    }
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
    // 清除登录状态
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');

    // 跳转到登录页
    router.push('/login');
  };

  /**
   * 返回首页
   */
  const goToHome = () => {
    router.push('/home');
  };

  /**
   * 跳转到古迹篇
   */
  const goToHeritage = () => {
    router.push('/heritage');
  };

  /**
   * 跳转到新景篇
   */
  const goToScenery = () => {
    router.push('/scenery');
  };

  /**
   * 跳转到脉络篇
   */
  const goToNetwork = () => {
    router.push('/network');
  };

  /**
   * 跳转到行迹篇
   */
  const goToRoute = () => {
    router.push('/route');
  };
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

  /* 中间导航菜单 */
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
    height: 35vh;
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
    background: #d5d5d5;
    padding: 3vh 5vw;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 2vw;
    margin-bottom: 2vh;
    position: relative; /* 可能是为了设置“设置按钮的位置”，这个位置还要调整，以及图标，应该具体在下面部分了 */
  }

  .user-avatar {
    width: 8vw;
    height: 8vw;
    border-radius: 50%;
    background: white;
    border: 5px solid white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background-image: url('@/assets/images/user-avatar.png');
    background-size: cover;
    background-position: center;
  }

  .username {
    font-size: 2.2vw;
    color: #333;
    font-weight: bold;
  }

  /* ==================== 设置按钮和菜单 ==================== */
  .settings-container {
    position: relative;
    margin-left: 1vw;
  }

  .settings-btn {
    width: 2.5vw;
    height: 2.5vw;
    cursor: pointer;
    transition: transform 0.3s;
  }

  .settings-btn:hover {
    transform: rotate(30deg);
  }

  .settings-menu {
    position: absolute;
    top: 3.5vw;
    left: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 100;
    min-width: 120px;
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
    padding: 1.2vh 1.5vw;
    color: #333;
    font-size: 1vw;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .menu-item:hover {
    background: #f5f5f5;
    color: #5a9090;
  }

  /* 用户统计数据 */
  .stats {
    display: flex;
    gap: 1.5vw;
    margin-bottom: 3vh;
  }

  .stat-item {
    background: white;
    padding: 1.5vh 3vw;
    border-radius: 10px;
    font-size: 1.1vw;
    color: #333;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  /* 路线列表区域 */
  .routes-section {
    background: white;
    padding: 2.5vh 2.5vw;
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .route-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2vh 2vw;
    background: #f9f9f9;
    border-radius: 10px;
    margin-bottom: 1.2vh;
    font-size: 1vw;
    color: #333;
  }

  .route-name {
    flex: 1;
  }

  .route-distance {
    color: #666;
    font-weight: bold;
  }
</style>
