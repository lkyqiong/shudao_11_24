<template>
  <div class="register-page">
    <!-- ==================== 注册容器 ==================== -->
    <div class="container">
      <!-- 左侧：欢迎文案和插画 -->
      <div class="welcome-section">
        <h1>欢迎来到云游蜀道</h1>
        <img
          src="@/assets/images/pavilion.png"
          alt="蜀道古建"
          class="pavilion-img"
        />
        <div class="login-link">
          有账号？
          <a @click="goToLogin">去登陆</a>
        </div>
      </div>

      <!-- 右侧：注册表单区域 -->
      <div class="register-section">
        <h2>REGISTER</h2>

        <!-- 成功提示信息 -->
        <div v-if="showSuccess" class="success-msg">
          注册成功！即将跳转到登录页...
        </div>

        <!-- 用户名输入 -->
        <div class="input-group">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            @keyup.enter="handleRegister"
          />
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            @keyup.enter="handleRegister"
          />
        </div>

        <button class="register-btn" @click="handleRegister">注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  // 表单数据
  const username = ref('');
  const password = ref('');
  const showSuccess = ref(false);

  /**
   * 处理注册逻辑
   * 简单演示：直接提示注册成功并跳转到登录页
   */
  const handleRegister = () => {
    if (!username.value || !password.value) {
      alert('请填写完整信息');
      return;
    }

    // 模拟注册成功
    showSuccess.value = true;

    // 2秒后跳转到登录页
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  /**
   * 跳转到登录页
   */
  const goToLogin = () => {
    router.push('/login');
  };
</script>

<style scoped>
  /* ==================== 注册页面主体 ==================== */
  .register-page {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #e8f4f8 0%, #b8d8d8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* ==================== 注册容器 ==================== */
  .container {
    display: flex;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 70vw;
    /*max-width: 1000px;*/
    height: 60vh;
    /*min-height: 500px;*/
  }

  /* ==================== 左侧欢迎区域 ==================== */
  .welcome-section {
    width: 55%;
    padding: 5%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .welcome-section h1 {
    font-size: 2.2vw;
    color: #333;
    margin-bottom: 8%;
  }

  .pavilion-img {
    width: 70%;
    height: auto;
    max-height: 40%;
    margin-bottom: 8%;
    object-fit: contain;
  }

  .login-link {
    color: #999;
    font-size: 0.9vw;
  }

  .login-link a {
    color: #4a8c8c;
    cursor: pointer;
    margin-left: 10px;
    text-decoration: none;
  }

  .login-link a:hover {
    text-decoration: underline;
  }

  /* ==================== 右侧注册区域 ==================== */
  .register-section {
    background: #4a8c8c;
    padding: 5% 4%;
    width: 45%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 30px;
    margin: 2%;
  }

  .register-section h2 {
    color: white;
    font-size: 2vw;
    text-align: center;
    margin-bottom: 8%;
    letter-spacing: 8px;
  }

  /* 成功提示信息 */
  .success-msg {
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
    padding: 3%;
    border-radius: 5px;
    text-align: center;
    margin-bottom: 4%;
    font-size: 0.9vw;
  }

  /* 输入框容器 */
  .input-group {
    margin-bottom: 5%;
  }

  .input-group input {
    width: 100%;
    padding: 4%;
    border: none;
    border-radius: 10px;
    font-size: 0.9vw;
    background: rgba(255, 255, 255, 0.9);
    outline: none;
  }

  .input-group input::placeholder {
    color: #999;
  }

  /* 注册按钮 */
  .register-btn {
    width: 100%;
    padding: 4%;
    background: white;
    border: none;
    border-radius: 10px;
    font-size: 1.2vw;
    color: #4a8c8c;
    cursor: pointer;
    font-weight: bold;
    margin-top: 5%;
    transition: background 0.3s;
  }

  .register-btn:hover {
    background: #f0f0f0;
  }
</style>
