<template>
  <div class="user_page">
    <div class="home-button">
      <button class="btn home" @click="goToHome">
        <i class="fas fa-home"></i> 返回首页
      </button>
    </div>
    <div class="user-info">
      <div class="avatar">
        <img src="@/assets/login-user.png" alt="用户头像">
      </div>
      <div class="user-details">
        <h2 class="username">{{ user }}</h2>
        <div class="role-info">
          <span class="role-badge" :class="roleClass">{{ roleDisplay }}</span>
          <div v-if="showMembershipInfo" class="membership-info">
            <p>到期时间：{{ membershipExpiryDate }}</p>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn recharge" @click="goToRecharge">充值</button>
          <button class="btn logout" @click="goToLogout">登出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import loginState from '@/stores/login';
import service from '@/utils/axios';
import Vue from 'vue';

export default {
  name: 'UserPage',
  
  //页面加载时同步执行
  mounted() {
    const token = localStorage.getItem('token'); //从本地存储读取token
    if (token) {
      const payload = this.parseJwt(token);
      const email = payload && payload.sub;
      if (email) {
        service.get(`/user/getbyemail`, { params: { email } }) //查询token对应的用户信息
          .then(response => {
            const responseData = response.data;
            if (responseData && responseData.data) {
              Vue.set(loginState, 'userLoginData', responseData.data); //更新用户状态
            }
          })
          .catch(err => {
            console.error('获取用户信息失败', err);
          });
      }
    }
  },
  computed: {
    user() {
      return loginState.userLoginData
        ? loginState.userLoginData.name || loginState.userLoginData.email
        : '未知用户';
    },
    role() {
      return loginState.userLoginData
        ? loginState.userLoginData.roleName
        : 'NORMAL';
    },
    membershipExpiryDate() {
      return loginState.userLoginData
        ? loginState.userLoginData.membershipExpiryTime
        : '';
    },
    roleDisplay() {
      const roleMap = {
        'NORMAL': '普通用户',
        'MEMBER': '月度会员',
        'SUPER_MEMBER': '年度会员',
        'ADMIN': '管理员'
      }
      return roleMap[this.role] || '未知角色'
    },
    roleClass() {
      return {
        normal: this.role === 'NORMAL',
        member: this.role === 'MEMBER',
        'super-member': this.role === 'SUPER_MEMBER',
        admin: this.role === 'ADMIN'
      }
    },
    showMembershipInfo() {
      return ['MEMBER', 'SUPER_MEMBER'].includes(this.role)
    }
  },
  methods: {
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    },
    goToHome() {
      this.$router.push('/home')
    },
    goToRecharge() {
      this.$router.push('/recharge')
    },
    goToLogout() {
      this.$router.push('/logout')
    }
  }
}
</script>

<style scoped>
.user_page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.home-button {
  position: absolute;
  top: 5px;
  left: 25px;
  margin-top: 20px;
}

.home {
  background-color: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 4px;
  padding: 8px 16px;
}

.home:hover {
  background-color: #e0e0e0;
}

.home i {
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #42b983;
}

.user-details {
  text-align: center;
}

.username {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 24px;
}

.role-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.role-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  background: none;
}

.normal {
  color: #666;
}

.member, .super-member {
  color: #b26a00; /* 深黄色文字 */
}

.admin {
  color: #ff5252; /* 鲜红色文字 */
}

.membership-info {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 30px;
  justify-content: center;
}

.btn {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.recharge {
  background-color: #42b983;
  color: white;
}

.recharge:hover {
  background-color: #3aa876;
}

.logout {
  background-color: #f5f5f5;
  color: #666;
}

.logout:hover {
  background-color: #e0e0e0;
}
</style>