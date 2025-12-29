<template>
  <div class="scenic-action-sidebar">
    <!-- 未选中景点时的提示 -->
    <div v-if="!selectedScenic" class="empty-state">
      <div class="empty-icon">📍</div>
      <p class="empty-text">点击地图上的景点</p>
      <p class="empty-hint">进行打卡或收藏操作</p>
    </div>

    <!-- 已选中景点时的内容 -->
    <div v-else class="scenic-content">
      <!-- 景点名称 -->
      <div class="scenic-header">
        <h2 class="scenic-name">{{ selectedScenic.name }}</h2>
        <button class="close-btn" @click="$emit('clear-selection')" title="关闭">×</button>
      </div>

      <!-- 打卡和收藏操作 -->
      <div class="action-section">
        <!-- 打卡按钮 -->
        <div class="action-group">
          <button
            class="action-btn checkin-btn"
            @click="handleCheckin"
            :disabled="isCheckingIn"
          >
            <span class="btn-icon">📍</span>
            <span class="btn-text">{{ isCheckingIn ? '打卡中...' : '打卡' }}</span>
          </button>

          <!-- 打卡备注输入（可选） -->
          <div v-if="showCheckinNote" class="note-input-wrapper">
            <textarea
              v-model="checkinNote"
              placeholder="添加打卡感想（可选）"
              class="note-input"
              rows="3"
            ></textarea>
            <div class="note-actions">
              <button class="note-cancel" @click="cancelCheckinNote">取消</button>
              <button class="note-confirm" @click="confirmCheckin">确认打卡</button>
            </div>
          </div>
        </div>

        <!-- 收藏按钮 -->
        <div class="action-group">
          <button
            class="action-btn favorite-btn"
            :class="{ 'is-favorited': isFavorited }"
            @click="handleFavorite"
            :disabled="isFavoriting"
          >
            <span class="btn-icon">{{ isFavorited ? '❤️' : '🤍' }}</span>
            <span class="btn-text">{{ isFavorited ? '已收藏' : '收藏' }}</span>
          </button>
        </div>
      </div>

      <!-- 操作成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Scenic } from '@/services/api';
import { createCheckin, createFavorite, deleteFavorite, checkFavorite } from '@/services/checkinService';

const props = defineProps<{
  selectedScenic: Scenic | null;
}>();

const emit = defineEmits<{
  'clear-selection': [];
}>();

// 状态
const isCheckingIn = ref(false);
const isFavoriting = ref(false);
const isFavorited = ref(false);
const showCheckinNote = ref(false);
const checkinNote = ref('');
const successMessage = ref('');

// 获取当前用户名
const username = ref('');

onMounted(() => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    username.value = savedUsername;
  }
});

// 当选中景点变化时，检查收藏状态
watch(() => props.selectedScenic, async (newScenic) => {
  if (newScenic && username.value) {
    isFavorited.value = await checkFavorite(newScenic.id, username.value);
  } else {
    isFavorited.value = false;
  }
  showCheckinNote.value = false;
  checkinNote.value = '';
  successMessage.value = '';
}, { immediate: true });

// 处理打卡
const handleCheckin = () => {
  if (!username.value) {
    alert('请先登录');
    return;
  }
  showCheckinNote.value = true;
};

// 取消打卡备注
const cancelCheckinNote = () => {
  showCheckinNote.value = false;
  checkinNote.value = '';
};

// 确认打卡
const confirmCheckin = async () => {
  if (!props.selectedScenic || isCheckingIn.value) return;

  isCheckingIn.value = true;
  try {
    await createCheckin({
      username: username.value,
      scenic_id: props.selectedScenic.id,
      note: checkinNote.value.trim() || undefined,
    });

    successMessage.value = '✓ 打卡成功！';
    showCheckinNote.value = false;
    checkinNote.value = '';

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    alert(error.message || '打卡失败，请重试');
  } finally {
    isCheckingIn.value = false;
  }
};

// 处理收藏/取消收藏
const handleFavorite = async () => {
  if (!props.selectedScenic || !username.value) {
    alert('请先登录');
    return;
  }

  if (isFavoriting.value) return;

  isFavoriting.value = true;
  try {
    if (isFavorited.value) {
      // 取消收藏
      await deleteFavorite(props.selectedScenic.id, username.value);
      isFavorited.value = false;
      successMessage.value = '✓ 已取消收藏';
    } else {
      // 添加收藏
      await createFavorite({
        username: username.value,
        scenic_id: props.selectedScenic.id,
      });
      isFavorited.value = true;
      successMessage.value = '✓ 收藏成功！';
    }

    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    alert(error.message || '操作失败，请重试');
  } finally {
    isFavoriting.value = false;
  }
};
</script>

<style scoped>
.scenic-action-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ==================== 空状态 ==================== */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

/* ==================== 景点内容 ==================== */
.scenic-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scenic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #5a9090;
}

.scenic-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

/* ==================== 操作区域 ==================== */
.action-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-group {
  /* 不设置margin-bottom，由gap控制间距 */
}

.action-btn {
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkin-btn {
  background: linear-gradient(135deg, #5a9090 0%, #4a7a7a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(90, 144, 144, 0.3);
}

.checkin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 144, 144, 0.4);
}

.favorite-btn {
  background: #f0f0f0;
  color: #666;
}

.favorite-btn.is-favorited {
  background: linear-gradient(135deg, #ff6b9d 0%, #c94a6e 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

.favorite-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.favorite-btn.is-favorited:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

.btn-icon {
  font-size: 1.3rem;
}

/* ==================== 打卡备注输入 ==================== */
.note-input-wrapper {
  margin-top: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.note-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.note-input:focus {
  border-color: #5a9090;
}

.note-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.note-cancel,
.note-confirm {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.note-cancel {
  background: #f0f0f0;
  color: #666;
}

.note-cancel:hover {
  background: #e0e0e0;
}

.note-confirm {
  background: #5a9090;
  color: white;
}

.note-confirm:hover {
  background: #4a7a7a;
}

/* ==================== 成功提示 ==================== */
.success-message {
  margin-top: auto;
  padding: 12px 16px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  font-size: 0.95rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
