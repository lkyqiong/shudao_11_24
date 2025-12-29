<template>
  <div class="home-page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <div class="header-right">
        <div class="user-icon" @click="goToProfile">👤</div>
      </div>
    </div>

    <!-- ==================== 横幅 ==================== -->
    <div class="banner"></div>

    <!-- ==================== 分类卡片区域  ==================== -->
    <div class="categories">
      <div class="category-card" @click="goToHeritage">古迹篇</div>
      <div class="category-card" @click="goToScenery">新景篇</div>
      <div class="category-card" @click="goToNetwork">脉络篇</div>
      <div class="category-card" @click="goToRoute">行迹篇</div>
    </div>

    <!-- ==================== 页脚导航  ==================== -->
    <div class="footer-nav">
      <span
        :class="{ active: activeTab === 'introduction' }"
        @click="activeTab = 'introduction'"
      >
        平台简介
      </span>
      <span
        :class="{ active: activeTab === 'help' }"
        @click="activeTab = 'help'"
      >
        使用帮助
      </span>
      <span
        :class="{ active: activeTab === 'version' }"
        @click="activeTab = 'version'"
      >
        版本介绍
      </span>
      <span
        :class="{ active: activeTab === 'contact' }"
        @click="activeTab = 'contact'"
      >
        联系我们
      </span>
      <span
        :class="{ active: activeTab === 'about' }"
        @click="activeTab = 'about'"
      >
        关于我们
      </span>
    </div>

    <!-- ==================== 内容展示区域 ==================== -->
    <div class="content-section">
      <!-- 平台简介 -->
      <div v-if="activeTab === 'introduction'" class="content-wrapper">
        <div class="content-text">
          <h2>"云上漫游，踏遍古今蜀路"</h2>
          <p>云游蜀道——以"地理关联 + AI赋能"为核心，重塑蜀道文化的数字化传承。</p>
          <p>
            平台以古迹篇、新景篇、脉络篇、行迹篇为主线，从千年古道到现代文旅，从历史脉络到个性行程，打造一部可交互的蜀道百科全书，让你在地图中读史，在行走中感悟蜀道之魂。
          </p>
        </div>
        <div class="content-image"></div>
      </div>

      <!-- 使用帮助 -->
      <div v-if="activeTab === 'help'" class="content-wrapper">
        <div class="content-text">
          <h2>使用帮助</h2>
          <p>详细的功能说明、操作指南和技术文档，请参考项目 GitHub 仓库中的 README.md 文件。</p>
          <p>GitHub 地址：<a href="https://github.com/lkyqiong/shudao_11_24" target="_blank">https://github.com/lkyqiong/shudao_11_24</a></p>
          <p>如有任何问题或建议，欢迎在 GitHub 上提交 Issue 或联系我们的开发团队。</p>
        </div>
        <div class="content-image"></div>
      </div>

      <!-- 版本介绍 -->
      <div v-if="activeTab === 'version'" class="content-wrapper">
        <div class="content-text">
          <h2>版本介绍</h2>
          <p>在这个版本中，我们主要尝试新增以下几个功能（整体架构重构除外）：</p>
          <p>1. 与"云游蜀道"相关的人工智能对话的加入</p>
          <p>2. 知识图谱的重构、可视化与交互</p>
          <p>3. 旅游部分逻辑的重构，加入AI景点推荐，移除路线规划</p>
          <p>4. 可视化部分（空间可视化、图表可视化）的完善与优化</p>
        </div>
        <div class="content-image"></div>
      </div>

      <!-- 联系我们 -->
      <div v-if="activeTab === 'contact'" class="content-wrapper">
        <div class="content-text">
          <h2>联系我们</h2>
          <p>邮箱：2109451644@qq.com</p>
          <p>电话：18651653892</p>
          <p>上一个版本地址：<a href="https://gitee.com/chen-yahan/yun-you-shu-dao" target="_blank">https://gitee.com/chen-yahan/yun-you-shu-dao</a></p>
        </div>
        <div class="content-image"></div>
      </div>

      <!-- 关于我们 -->
      <div v-if="activeTab === 'about'" class="content-wrapper">
        <div class="content-text">
          <h2>关于我们</h2>
          <p><strong>本组成员：</strong>李坤阳，蔡佳彤，薛景阳</p>
          <p>同时，感谢另外六位同学在上一个版本中的贡献：</p>
          <p><strong>网页开发方向：</strong>袁世蓉，陈亚涵，黄岚，胡思琪</p>
          <p><strong>美术设计方向：</strong>陈淑涵，王子瑶</p>
        </div>
        <div class="content-image"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  // 当前激活的导航标签
  const activeTab = ref('introduction');

  /**
   * 跳转到个人中心
   */
  const goToProfile = () => {
    router.push('/profile');
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
  /* ==================== 首页主体 ==================== */
  .home-page {
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
    font-size: 1.8vw;
    color: white;
    font-weight: bold;
    width: 10vw;
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

  /* ==================== 横幅 ==================== */
  .banner {
    height: 35vh;
    background-image: url('@/assets/images/banner-bg.jpg');
    background-size: cover;
    background-position: center;
    position: relative;
  }

  /* ==================== 分类卡片区域  ==================== */
  .categories {
    display: flex;
    justify-content: center;
    gap: 2vw;
    padding: 3vh 5vw;
    margin-top: -8vh;
    position: relative;
    z-index: 10;
  }

  .category-card {
    background: rgba(255, 255, 255, 0.95);
    width: 20%;
    height: 18vh;
    min-height: 140px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2vw;
    color: white;
    font-weight: bold;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.3s;
  }

  .category-card:hover {
    transform: translateY(-5px);
  }

  .category-card:nth-child(1) {
    background: linear-gradient(135deg, #b8a67e 0%, #8b7355 100%);
  }

  .category-card:nth-child(2) {
    background: linear-gradient(135deg, #a8b894 0%, #7a9064 100%);
  }

  .category-card:nth-child(3) {
    background: linear-gradient(135deg, #6b9fb5 0%, #4a7a8c 100%);
  }

  .category-card:nth-child(4) {
    background: linear-gradient(135deg, #b89898 0%, #8c6a6a 100%);
  }

  /* ==================== 底部导航栏 ==================== */
  .footer-nav {
    background: #d5d5d5;
    padding: 17.5vh 0 1.5vh 0;
    display: flex;
    justify-content: center;
    gap: 4vw;
    font-size: 1vw;
    margin-top: -16vh;
    position: relative;
    z-index: 5;
  }

  .footer-nav span {
    color: #333;
    cursor: pointer;
    padding: 0.5vh 1vw;
    transition: all 0.3s;
    position: relative;
  }

  .footer-nav span.active {
    font-weight: bold;
    color: #5a9090;
  }

  .footer-nav span.active::after {
    content: '';
    position: absolute;
    bottom: -0.5vh;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 3px;
    background: #5a9090;
    border-radius: 2px;
  }

  .footer-nav span:hover {
    color: #5a9090;
  }

  /* ==================== 内容展示区域 ==================== */
  .content-section {
    background: white;
    margin: 2vh 5vw 3vh 5vw;
    padding: 3vh 3vw;
    border-radius: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    min-height: 25vh;
  }

  .content-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .content-text {
    flex: 1;
    padding-right: 4vw;
  }

  .content-text h2 {
    font-size: 1.6vw;
    color: #333;
    margin-bottom: 2vh;
  }

  .content-text p {
    font-size: 1vw;
    color: #666;
    line-height: 2;
    text-align: justify;
    margin-bottom: 1vh;
  }

  .content-text a {
    color: #5a9090;
    text-decoration: none;
  }

  .content-text a:hover {
    text-decoration: underline;
  }

  .content-text strong {
    color: #333;
  }

  .content-image {
    width: 25%;
    height: auto;
    aspect-ratio: 1.2;
    background: #e0e0e0;
    border-radius: 10px;
    background-image: url('@/assets/images/building.png');
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }
</style>