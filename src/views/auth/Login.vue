<template>
  <div class="login-page">
    <!-- ==================== 登录容器 ==================== -->
    <div class="container">
      <!-- 左侧：登录表单区域 -->
      <div class="login-section">
        <h2>LOG IN</h2>

        <!-- 错误提示信息 -->
        <div v-if="showError" class="error-msg">{{ errorMessage }}</div>

        <!-- 用户名输入 -->
        <div class="input-group">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            @keyup.enter="handleLogin"
            :disabled="isLoading"
          />
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            @keyup.enter="handleLogin"
            :disabled="isLoading"
          />
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </div>

      <!-- 右侧：欢迎文案和插画 -->
      <div class="welcome-section">
        <h1>欢迎来到云游蜀道</h1>
        <img
          src="@/assets/images/mountain-illustration.png"
          alt="山水插画"
          class="mountain-img"
        />
        <div class="register-link">
          没有账号？
          <a @click="goToRegister">去注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';

  const router = useRouter();

  // 表单数据
  const username = ref('');
  const password = ref('');
  const showError = ref(false);
  const errorMessage = ref('用户名或密码错误');
  const isLoading = ref(false);

  /**
   * 处理登录逻辑
   */
  const handleLogin = async () => {
    // 验证输入
    if (!username.value || !password.value) {
      errorMessage.value = '请输入用户名和密码';
      showError.value = true;
      setTimeout(() => {
        showError.value = false;
      }, 3000);
      return;
    }

    isLoading.value = true;
    try {
      // 调用登录API
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        username: username.value,
        password: password.value,
      });

      if (response.data.success) {
        // 登录成功，保存用户信息
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.data.username);
        localStorage.setItem('userId', response.data.data.id.toString());
        if (response.data.data.avatar_url) {
          localStorage.setItem('avatarUrl', response.data.data.avatar_url);
        }

        // 跳转到首页
        router.push('/home');
      }
    } catch (error: any) {
      // 登录失败
      if (error.response?.status === 401) {
        errorMessage.value = '用户名或密码错误';
      } else if (error.response?.data?.detail) {
        errorMessage.value = error.response.data.detail;
      } else {
        errorMessage.value = '登录失败，请稍后重试';
      }

      showError.value = true;
      console.error('登录失败:', error);

      // 3秒后自动隐藏错误提示
      setTimeout(() => {
        showError.value = false;
      }, 3000);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 跳转到注册页
   */
  const goToRegister = () => {
    router.push('/register');
  };
</script>

<style scoped>
  /* ==================== 登录页面主体 ==================== */
  .login-page {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #e8f4f8 0%, #b8d8d8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* ==================== 登录容器 ==================== */
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

  /* ==================== 左侧登录区域 ==================== */
  .login-section {
    background: #4a8c8c;
    padding: 5% 4%;
    width: 45%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 30px;
    margin: 2%;
  }

  .login-section h2 {
    color: white;
    font-size: 2vw;
    text-align: center;
    margin-bottom: 8%;
    letter-spacing: 8px;
  }

  /* 错误提示信息 */
  .error-msg {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    padding: 3%;
    border-radius: 5px;
    text-align: center;
    margin-bottom: 4%;
    font-size: 0.9vw;
    animation: shake 0.5s;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
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

  .input-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-group input::placeholder {
    color: #999;
  }

  /* 登录按钮 */
  .login-btn {
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

  .login-btn:hover:not(:disabled) {
    background: #f0f0f0;
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ==================== 右侧欢迎区域 ==================== */
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

  .mountain-img {
    width: 70%;
    height: auto;
    max-height: 40%;
    margin-bottom: 8%;
    object-fit: contain;
  }

  .register-link {
    color: #999;
    font-size: 0.9vw;
  }

  .register-link a {
    color: #4a8c8c;
    cursor: pointer;
    margin-left: 10px;
    text-decoration: none;
  }

  .register-link a:hover {
    text-decoration: underline;
  }
</style>
