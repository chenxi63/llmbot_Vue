<template>
  <div class="logout_page">
    <div class="logout_message">
      <h2>已登出，将跳转首页......</h2>
    </div>
  </div>
</template>

<script>
import loginState from '@/stores/login';

export default {
  name: 'LogoutPage',
  mounted() {
    // 清除全局登录数据(内存)
    loginState.userLoginData = null;
    // 清除所有本地存储数据
    localStorage.clear();
    sessionStorage.clear();
    // 跳转到首页
    setTimeout(() => {
      this.$router.push('/home')
    }, 1500) // 1.5秒后跳转到首页
  }
}
</script>

<style scoped>
.logout_page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout_message {
  text-align: center;
}

h2 {
  color: #999999;
  font-size: 24px;
}
</style>