<template>
  <div class="network-page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <div class="nav-menu">
        <div class="nav-item" @click="goToHeritage">古迹篇</div>
        <div class="nav-item" @click="goToScenery">新景篇</div>
        <div class="nav-item active">脉络篇</div>
        <div class="nav-item" @click="goToRoute">行迹篇</div>
      </div>

      <div class="header-right">
        <div class="ai-btn">AI</div>
        <input type="text" class="search-box" placeholder="询问问题..." />
        <div class="user-icon" @click="goToProfile">👤</div>
        <button class="home-btn" @click="goToHome">首页</button>
      </div>
    </div>

    <!-- ==================== 主内容区域 ==================== -->
    <div class="main-content">
      <div class="placeholder">
        <h2>脉络篇</h2>
        <p>知识图谱展示</p>
        <p>（待实现知识图谱可视化）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const goToHome = () => router.push('/home');
  const goToProfile = () => router.push('/profile');
  const goToHeritage = () => router.push('/heritage');
  const goToScenery = () => router.push('/scenery');
  const goToRoute = () => router.push('/route');
</script>

<style scoped>
  .network-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

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
    font-size: 1.8vw;
    color: white;
    font-weight: bold;
  }

  .nav-menu {
    display: flex;
    gap: 2.5vw;
  }

  .nav-item {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.2vw;
    cursor: pointer;
    transition: all 0.3s;
  }

  .nav-item.active {
    color: white;
    font-weight: bold;
  }

  .nav-item:hover {
    color: white;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1.5vw;
  }

  .ai-btn {
    background: white;
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

  .user-icon {
    width: 3.5vw;
    height: 3.5vw;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8vw;
    color: #5a9090;
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

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .placeholder {
    text-align: center;
    color: #666;
  }

  .placeholder h2 {
    font-size: 2.5vw;
    margin-bottom: 2vh;
    color: #333;
  }

  .placeholder p {
    font-size: 1.2vw;
    margin-bottom: 1vh;
  }
</style>
