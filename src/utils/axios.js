import axios from 'axios';
import loginState from '@/stores/login';
import Vue from 'vue';
import router from '@/router';
import API_BASE_URL from './baseurl';

// 解析JWT，获取sub字段（邮箱）
function parseJwt(token) {
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
}

// 创建axios实例serice，定义基础地址
const service = axios.create({
  baseURL: API_BASE_URL, // 使用配置文件中的基础路径
  timeout: 5000
});

// 为service实例增加请求拦截器，向请求Header注入本地存储的token
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 清除所有本地存储数据的函数
function clearAllLocalStorage() {
  localStorage.clear();
  sessionStorage.clear();
}

// 跳转到home页并重新加载的函数
function redirectToHomeAndReload() {
  router.push('/home').then(() => {
    window.location.reload();
  }).catch(() => {
    // 如果路由跳转失败，直接重新加载
    window.location.reload();
  });
}

// 为service实例增加响应拦截器，处理响应中的token，包括token更新、token过期等情况
service.interceptors.response.use(
  async response => {
    const token = response.headers['authorization'] || response.headers['Authorization'] || response.headers['token'] || response.headers['Token'];
    if (token) {
      const realToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const oldToken = localStorage.getItem('token');
      if (realToken !== oldToken) {
        // 先保存新token
        localStorage.setItem('token', realToken);
        // 然后查询新的用户信息
        const payload = parseJwt(realToken);
        const email = payload && payload.sub;
        if (email) {
          try {
            const userResponse = await service.get(`/user/getbyemail`, { params: { email } });
            const responseData = userResponse.data;
            if (responseData && responseData.data) {
              Vue.set(loginState, 'userLoginData', responseData.data);
            }
          } catch (err) {
            // 获取用户信息失败时不清除现有状态
          }
        }
      }
    }
    return response;
  },
  error => {
    const shouldPreserveUserState = error.config?.url?.includes('/user/getbyemail') || 
                                   error.config?.url?.includes('/user/updatcltmls') ||
                                   error.config?.url?.includes('/user/login');
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > payload.exp && !error.config?.url?.includes('/user/login')) {
          clearAllLocalStorage();
          redirectToHomeAndReload();
          return Promise.reject(error);
        }
      }
    }
    if (error.response && error.response.status === 401) {
      if (shouldPreserveUserState || error.config?.url?.includes('/user/login')) {
        return Promise.reject(error);
      }
      clearAllLocalStorage();
      redirectToHomeAndReload();
    }
    return Promise.reject(error);
  }
);

export default service; 