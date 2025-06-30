<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h2>注册账号</h2>
        <button class="back-btn" @click="goBack">返回</button>
      </div>
      
      <div class="register-form">
        <div class="form-group">
          <label>邮箱：</label>
          <div class="input-wrapper">
            <input type="email" v-model="registerForm.email" placeholder="请输入邮箱" class="form-input" :class="{ 'error': errors.email }">
            <span class="error-message" v-if="errors.email"> {{ errors.email }} </span>
          </div>
        </div>

        <div class="form-group">
          <label>手机号：</label>
          <div class="input-wrapper">
            <div class="phone-input">
              <input type="tel" v-model="registerForm.phone" placeholder="请输入手机号" class="form-input" :class="{ 'error': errors.phone }">
              <span class="country-code">+86</span>
            </div>
            <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>用户名：</label>
          <div class="input-wrapper">
            <input type="text" v-model="registerForm.username" placeholder="请输入用户名（选填）" class="form-input" :class="{ 'error': errors.username }">
            <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>密码：</label>
          <div class="input-wrapper">
            <input type="password" v-model="registerForm.password" placeholder="请输入8~20位密码" class="form-input" :class="{ 'error': errors.password }">
            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="register-btn" @click="handleRegister">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios'; //需在命令行提前安装依赖包npm install axios
import loginState from '@/stores/login'; // 导入全局登录数据
import service from '@/utils/axios';
import API_BASE_URL from '@/utils/baseurl';

export default {
  name: 'RegisterPage',
  
  data() {
    return {
      registerForm: {
        email: '',
        phone: '',
        username: '',
        password: ''
      },
      errors: {
        email: '',
        phone: '',
        username: '',
        password: ''
      }
    }
  },

  methods: {
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },

    // 验证邮箱
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // 验证手机号
    validatePhone(phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phone);
    },

    // 验证密码
    validatePassword(password) {
      return password.length >= 8 && password.length <= 20;
    },

    // 验证表单
    validateForm() {
      let isValid = true;
      this.errors = {
        email: '',
        phone: '',
        username: '',
        password: ''
      };

      // 验证邮箱
      if (!this.registerForm.email) {
        this.errors.email = '邮箱不能为空';
        isValid = false;
      } else if (!this.validateEmail(this.registerForm.email)) {
        this.errors.email = '请输入有效的邮箱地址';
        isValid = false;
      }

      // 验证手机号
      if (!this.registerForm.phone) {
        this.errors.phone = '手机号不能为空';
        isValid = false;
      } else if (!this.validatePhone(this.registerForm.phone)) {
        this.errors.phone = '请输入有效的手机号';
        isValid = false;
      }

      // 验证密码
      if (!this.registerForm.password) {
        this.errors.password = '密码不能为空';
        isValid = false;
      } else if (!this.validatePassword(this.registerForm.password)) {
        this.errors.password = '密码长度必须在8~20位之间';
        isValid = false;
      }

      return isValid;
    },

    // 处理注册
    async handleRegister() {
      if (this.validateForm()) {
        try {
          //用户注册不需要鉴权，不使用预定义的service实例，直接使用axios
          const response = await axios.post(`${API_BASE_URL}/user/register`, { 
            email: this.registerForm.email,
            phone: '+86' + this.registerForm.phone,
            name: this.registerForm.username || '',
            password: this.registerForm.password
          });

          // 获取响应数据
          const responseData = response.data;
          
          if (responseData.code === 200) {
            // 注册成功，先清除所有本地其他用户可能遗留的相关缓存
            localStorage.removeItem('messageLists');
            localStorage.removeItem('selectedModel');
            localStorage.removeItem('favorites');

            this.$message({
              message: '注册成功，正在自动登录...',
              type: 'success',
              duration: 3500
            });

            // 使用service请求登录，
            try {
              const loginRes = await service.post('/user/login', {
                email: this.registerForm.email,
                password: this.registerForm.password
              });
              // 从登录响应loginRes的Header中提取token并保存到本地
              const token = loginRes.headers['authorization'] || loginRes.headers['Authorization'] || loginRes.headers['token'] || loginRes.headers['Token'];
              if (token) {
                const realToken = token.startsWith('Bearer ') ? token.slice(7) : token;
                localStorage.setItem('token', realToken); //本地存储token
              }

              // 从登录响应loginRes的body中提取data信息
              const loginData = loginRes.data;
              if (loginData.code === 200) {
                loginState.userLoginData = loginData.data;  //登录返回信息存储到全局数据(内存)，用于页面显示
                this.$message({
                  message: '登录成功',
                  type: 'success',
                  duration: 3500
                });
                this.$router.push({ name: 'HomePage' });
              } else {
                this.$message({
                  message: loginData.message || '自动登录失败',
                  type: 'error',
                  duration: 3500
                });
              }
            } catch (loginErr) {
              this.$message({
                message: loginErr.response?.data?.message || '自动登录失败，请手动登录',
                type: 'error',
                duration: 3500
              });
            }
          } else {
            this.$message({
              message: responseData.message || '注册失败',
              type: 'error',
              duration: 3500
            });
          }
        } catch (error) {
          console.error('注册失败:', error);
          this.$message({
            message: error.response?.data?.message || '注册失败，请稍后重试',
            type: 'error',
            duration: 3500
          });
        }
      }
    }
  }
}

</script>



<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.register-container {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.register-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
}

.back-btn:hover {
  color: #333;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.form-group label {
  width: 80px;
  color: #333;
  font-size: 14px;
  line-height: 40px;
  text-align: right;
  padding-right: 10px;
}

.input-wrapper {
  flex: 1;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.phone-input {
  position: relative;
  width: 100%;
}

.phone-input .country-code {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.phone-input .form-input {
  padding-left: 45px;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-btn:hover {
  background-color: #0056b3;
}
</style> 