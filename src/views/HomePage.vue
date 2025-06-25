<!-- src/views/Home.vue -->
<template>
  <div class="home_page">

    <!--TopBar:汉堡侧边栏button、后台管理页button-->
    <div class="top-bar">
      <button class="menu-btn" @click="toggleSidebar">
        <img src="@/assets/hamburger-button.png" alt="菜单" class="menu-icon">
      </button>
      
      <button class="manage-btn" v-if="isManageVisible" @click="navigateToManage">
        <img src="@/assets/data-sheet.png" alt="管理" class="manage-icon">
      </button>
    </div>


    <!--SideBar:功能项列表、模型列表、用户状态-->
    <div class="sidebar" :class="{ 'active': isSidebarVisible }">
      <ul class="action-list">
        <li v-for="(action, index) in actionNames" :key="index">
          <button @click="selectAction(action)" :class="{ 'active': selectedAction === action }">{{ action }}</button>
        </li>
      </ul>

      <ul class="model-list">
        <li v-for="(name, index) in displayModels" :key="index">
          <button @click="selectModel(name)" class="model-button" :class="{ 'selected': selectedModel === name }">
            <img :src="getModelIcon(name)" :alt="name" class="model-icon">
            <span class="model-name">{{ capitalizeModelName(name) }}</span>
            <span @click.stop="toggleFavorite(name)" class="favorite-star" :class="{ 'favorited': isFavorite(name) }">
              ★
            </span>
          </button>
        </li>
      </ul>

      <div class="user-status">
        <button class="user-status-btn" @click="handleUserStatusClick">
          <img :src="isLoggedIn ? require('@/assets/login-user.png') : require('@/assets/unlog-user.png')" 
               :alt="isLoggedIn ? '已登录' : '未登录'" 
               class="user-icon">
          <span class="user-name">{{ userName }}</span>
        </button>
      </div>
    </div>

    <!--Chat Area: 聊天区域 -->
    <div class="chat-area">
      <!-- 聊天信息展示区 -->
      <div class="chat-messages" ref="messageList">
        <transition-group name="fade-message" tag="div" class="message-list" v-if="isLoggedIn">
          <div v-for="(message, index) in currentMessageList" 
               :key="index" 
               class="message-item"
               :class="{ 'message-user': message.senderby === userName, 'message-ai': message.senderby !== userName }">
            <div class="message-content" @contextmenu.prevent="copyMessage(message)">
              <div class="message-sender">{{ message.senderby }}</div>
              <div class="message-text">
                <template v-if="message.text === 'pending'">
                  <span class="pending-dots"><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span><span>.</span></span>
                </template>
                <template v-else-if="message.text === '正在推理中......'">
                  <span class="reasoning-text">正在推理中......</span>
                </template>
                <template v-else>
                  <span v-html="formatMessage(message.text)"></span>
                </template>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      
      <!-- 聊天输入区 -->
      <div class="chat-input-area">
        <div class="selected-model">
          <span class="model-name">{{  '当前模型：' }}</span>
          <span class="model-name">{{ selectedModel ? capitalizeModelName(selectedModel) : '未选择' }}</span>
        </div>
        <button class="reset-conversation-btn" @click="resetConversation" :disabled="!isLoggedIn || !isPlatformDataReady">重建对话</button>
        <textarea class="chat-input" :placeholder="isPlatformDataReady ? '输入问题...' : '正在初始化，请稍候...'" v-model="messageInput" @keydown.enter.exact.prevent="sendMessage" :disabled="!isLoggedIn || !isPlatformDataReady"></textarea>
        <button class="send-button" @click="sendMessage" :disabled="!isLoggedIn || !isPlatformDataReady">发送</button>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <div class="login-modal" v-if="showLoginModal">
      <div class="login-content">
        <div class="login-header">
          <h2>登录</h2>
          <button class="close-btn" @click="showLoginModal = false">×</button>
        </div>

        <!-- 登录方式切换 -->
        <div class="login-type-switch">
          <button 
            class="switch-btn" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            密码登录
          </button>
          <!-- 验证码登录入口按钮暂时隐藏 -->
          <!--
          <button 
            class="switch-btn" 
            :class="{ active: loginType === 'phone' }"
            @click="loginType = 'phone'"
          >
            验证码登录
          </button>
          -->
        </div>

        <!-- 密码登录表单 -->
        <div class="login-form" v-if="loginType === 'password'">
          <div class="form-group">
            <input 
              type="text" 
              v-model="loginForm.account" 
              placeholder="邮箱或手机号"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <input 
              type="password" 
              v-model="loginForm.password" 
              placeholder="密码"
              class="form-input"
            >
          </div>
          <div class="form-actions">
            <button class="login-btn" @click="handleLogin">登录</button>
            <button class="register-btn" @click="handleRegister">注册</button>
          </div>
        </div>

        <!-- 验证码登录表单 -->
        <div class="login-form" v-if="loginType === 'phone'">
          <div class="form-group">
            <input 
              type="text" 
              v-model="phoneLoginForm.phone" 
              placeholder="请输入手机号"
              class="form-input"
            >
          </div>
          <div class="form-group verification-code">
            <input 
              type="text" 
              v-model="phoneLoginForm.code" 
              placeholder="请输入验证码"
              class="form-input"
            >
            <button 
              class="send-code-btn" 
              :disabled="true"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </button>
          </div>
          
          <div class="form-actions">
            <button class="login-btn" @click="handlePhoneLogin" :disabled="true">登录</button>
            <button class="register-btn" @click="handleRegister" :disabled="true">注册</button>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <p>这里是首页内容...</p>
    </div>


    
  </div>
</template>

<script>
import loginState from '@/stores/login';
import service from '@/utils/axios';
import { marked } from 'marked';
import Vue from 'vue';

export default {
  name: 'HomePage',

  data() {
    return {
      isSidebarVisible: true,  //控制siderbar是否显示，默认显示
      isManageVisible: true,  //控制管理页按钮是否显示
      actionNames: ['全部应用','收藏应用'],
      modelNames: [], // 默认为空数组，查询后更新
      favorites: [], //模型收藏list
      currentView: 'all', // 当前视图状态，'all' 或 'favorites'
      selectedModel: null, // 当前选中的模型
      selectedAction: '全部应用', // 当前选中的action，默认为'全部应用'
      messageLists: {}, // 每个模型独立的消息列表
      messageInput: '', // 聊天输入框的内容
      showLoginModal: false, // 控制登录弹窗显示
      loginForm: {
        account: '', // 邮箱或手机号
        password: '' // 密码
      },
      loginType: 'password', // 登录方式
      phoneLoginForm: {
        phone: '', // 手机号
        code: '' // 验证码
      },
      countdown: 0, // 倒计时
      isNewChat: 0, // 是否为新对话，0=带历史，1=新对话
      hisMsgNumber: 20, // 历史消息数量，默认20条
      platformModels: {}, // 新增：用于存储平台模型信息
      isPlatformDataReady: false, // 新增：平台数据加载状态
    }
  },

  computed: {
    displayModels() {
      return this.currentView === 'all' ? this.modelNames : this.favorites;
    },
    userName() {
      // 自动从全局登录数据提取用户名
      return this.isLoggedIn && loginState.userLoginData? loginState.userLoginData.name : '未知用户';
    },
    isLoggedIn() {
      // 自动判断是否已登录，且有email字段
      return !!(loginState.userLoginData && loginState.userLoginData.email);
    },

    //根据当前选择的模型，获取该模型对应的消息列表
    currentMessageList() {
      return this.selectedModel && this.messageLists[this.selectedModel]
        ? this.messageLists[this.selectedModel]
        : [];
    }
  },

  //监听登录状态变化，自动同步选择模型的信息
  watch: {
    async isLoggedIn(newVal) {
      if (newVal) {
        // 登录后自动恢复模型
        const savedModel = localStorage.getItem('selectedModel');
        if (savedModel) {
          this.selectedModel = savedModel;
        }
        // 登录后从后端更新收藏列表
        await this.updateFavoritesFromBackend();
      } else {
        this.selectedModel = null;
        // 未登录时清空收藏信息
        this.clearFavorites();
        localStorage.removeItem('selectedModel');
        localStorage.removeItem('selectedAction'); // 清除选择的action
      }
    }
  },

  //组件首次挂载到 DOM 后自动执行
  mounted() {
    // 页面加载时，先请求所有模型名称
    this.fetchModelNames();

    // 页面加载时，加载并请求平台模型列表
    const savedPlatformModels = localStorage.getItem('platformModels');
    if (savedPlatformModels) {
      try {
        this.platformModels = JSON.parse(savedPlatformModels);
      } catch (e) {
        console.error('从localStorage解析平台模型列表失败:', e);
      }
    }
    this.fetchPlatformModels();

    // 页面加载时，同步加载本地存储的用户前面选择的action
    // 未登录状态下，或无历史选择时，强制为"全部应用"；登录状态下，恢复历史选择
    const savedAction = localStorage.getItem('selectedAction');
    if (!this.isLoggedIn || !savedAction) {
      this.selectAction('全部应用');
    } else {
      this.selectAction(savedAction);
    }

    // 页面加载时，同步加载本地存储的用户前面选择的模型
    const savedModel = localStorage.getItem('selectedModel');
    if (this.isLoggedIn && savedModel) {
      this.selectedModel = savedModel;
    } else {
      this.selectedModel = null;
    }

    // 页面加载时，同步加载本地存储的消息列表
    const savedMessageLists = localStorage.getItem('messageLists');
    if (savedMessageLists) {
      try {
        this.messageLists = JSON.parse(savedMessageLists);
      } catch (e) {
        this.messageLists = {};
      }
    }
    
    // 页面加载时，同步加载本地存储的token，确认登录状态并向后端更新请求userLoginData.user
    const token = localStorage.getItem('token');
    if (token) {
      const payload = this.parseJwt(token);
      const email = payload && payload.sub;
      if (email) {
        const currentTime = Math.floor(Date.now() / 1000);
        // 检查token是否过期
        if (payload.exp && currentTime > payload.exp) {
          console.log('Token expired on mount:', payload.exp, 'Current time:', currentTime);
          localStorage.removeItem('token');
          Vue.set(loginState, 'userLoginData', null);
          // Token过期，清空收藏信息
          this.clearFavorites();
        } else {
          console.log('Using token on mount:', token);
          // token未过期，尝试获取用户信息
          service.get('/user/getbyemail', {
            params: { email },
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
          .then(async response => {
            console.log('User info response:', response);
            const responseData = response.data;
            if (responseData && responseData.data) {
              Vue.set(loginState, 'userLoginData', {...responseData.data});
              // 从后端collectModels字段更新收藏列表
              await this.updateFavoritesFromBackend();
            }
          })
          .catch(err => {
            console.error('获取用户信息失败:', err);
            console.log('Error response:', err.response);
            if (err.response && err.response.status === 401) {
              localStorage.removeItem('token');
              Vue.set(loginState, 'userLoginData', null);
            }
            // 获取用户信息失败，清空收藏信息
            this.clearFavorites();
          });
        }
      } else {
        // 无法解析token，清空收藏信息
        this.clearFavorites();
      }
    } else {
      // 没有token，清空收藏信息
      this.clearFavorites();
    }
    
    // 新增：未登录时点击除.user-status-btn外区域提示登录
    document.addEventListener('click', this.handleGlobalClick, true);

    // 检查并显示登录日志
    const loginLogs = localStorage.getItem('loginLogs');
    if (loginLogs) {
      console.log('%c上次登录日志:', 'background: #222; color: #bada55');
      JSON.parse(loginLogs).forEach(log => {
        console.log(`%c${log.timestamp} - ${log.label}:`, 'color: #bada55', log.data);
      });
      // 显示完后清除日志
      localStorage.removeItem('loginLogs');
    }
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleGlobalClick, true);
  },

  methods: {
    // 请求所有模型名称
    async fetchModelNames() {
      try {
        const response = await service.get(`/model/getnames`, {
          timeout: 5000
        });
        const responseData = response.data;
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          this.modelNames = responseData;
        }
      } catch (error) {
        console.error('获取模型名称列表失败:', error);
        // 请求失败时，保持modelNames为空数组，不影响页面渲染
      }
    },

    // 新增：请求平台模型列表
    async fetchPlatformModels() {
      const platforms = ['baiduqianfan', 'alibailian'];
      try {
        const responses = await Promise.all(
          platforms.map(platform =>
            service.get(`/model/getplatform?platform=${platform}`)
          )
        );

        const platformData = {};
        responses.forEach((response, index) => {
          const platform = platforms[index];
          let models = [];
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // 后端返回的数据格式为 ["[\"model1\", \"model2\"]"]，需要解析内部的字符串
            if (typeof response.data[0] === 'string' && response.data[0].startsWith('[') && response.data[0].endsWith(']')) {
              try {
                models = JSON.parse(response.data[0]);
                if (!Array.isArray(models)) {
                  console.warn(`解析平台[${platform}]数据后得到的不是数组:`, models);
                  models = [];
                }
              } catch (e) {
                console.error(`解析平台[${platform}]的模型列表字符串失败:`, e);
                models = [];
              }
            } else {
              // 如果后端未来修复了格式，直接使用
              models = response.data;
            }
          }
          platformData[platform] = models;
        });

        this.platformModels = platformData;
        localStorage.setItem('platformModels', JSON.stringify(platformData));
        this.isPlatformDataReady = true; // 标记为加载成功
      } catch (error) {
        this.isPlatformDataReady = false; // 标记为加载失败
        console.error('获取平台模型列表失败:', error);
        this.$message && this.$message({ message: '加载平台模型数据失败，聊天功能不可用，请刷新页面重试', type: 'error', duration: 0 }); // 持续显示错误
      }
    },

    // 新增：根据模型名称查询所属平台
    getModelPlatform(modelName) {
      if (!this.platformModels || typeof this.platformModels !== 'object' || !modelName) {
        return null;
      }
      const lowerCaseModelName = modelName.toLowerCase();
      for (const platform in this.platformModels) {
        if (Array.isArray(this.platformModels[platform])) {
          const found = this.platformModels[platform].some(
            platformModel => platformModel.toLowerCase() === lowerCaseModelName
          );
          if (found) {
            return platform;
          }
        }
      }
      return null;
    },

    // topbar侧边栏控制按钮点击事件
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    // topbar后台管理业按钮点击事件
    navigateToManage() {
      this.$router.push({ name: 'ManagePage' });
    },

    // sidebar功能项选中事件
    selectAction(action) {
      this.selectedAction = action;
      localStorage.setItem('selectedAction', action);
      if (action === '全部应用') {
        this.currentView = 'all';
      } else if (action === '收藏应用') {
        this.currentView = 'favorites';
      }
    },

    // sidebar模型项选中事件
    async selectModel(name) {
      this.selectedModel = name;
      localStorage.setItem('selectedModel', name);
      // 初始化该模型的消息列表（如无），同时存储到本地
      if (!this.messageLists[name]) {
        this.$set(this.messageLists, name, []);
      }

      // 如果是登录状态，且当前模型本地无历史记录，则从后端请求
      if (this.isLoggedIn && (!this.messageLists[name] || this.messageLists[name].length === 0)) {
        try {
          const uuid = loginState.userLoginData && loginState.userLoginData.uuid;
          if (uuid) {
            const response = await service.get(`/message/gethismsg?id=${name}_${uuid}`);
            const responseData = response.data;
            // 如果请求成功且返回了数据，则更新本地消息列表
            if (responseData && responseData.status === 200 && responseData.data && responseData.data.length > 0) {
              this.$set(this.messageLists, name, responseData.data);
            }
          }
        } catch (error) {
          console.error('获取历史消息失败', error);
        }
      }
      this.saveMessageLists(); // 请求结束后，统一保存消息列表到本地

      // 根据是否存在对话历史，设置isNewChat和hisMsgNumber
      if (!this.messageLists[name] || this.messageLists[name].length === 0) {
        this.isNewChat = 1;
        this.hisMsgNumber = 0;
      } else {
        this.isNewChat = 0;
        this.hisMsgNumber = 20; // 对于已有对话，恢复默认历史消息数
      }

      // 新增：选中模型后自动滚动到底部
      this.$nextTick(() => {
        const msgList = this.$refs.messageList;
        if (msgList) msgList.scrollTop = msgList.scrollHeight;
      });
    },

    //根据模型name选择对应图标，返回图标路径
    getModelIcon(name) {
      name = name.toLowerCase(); // 统一转小写避免大小写问题
      if (name.includes('ernie')) return require('@/assets/ernie.png');
      if (name.includes('qwen')) return require('@/assets/qwen.png');
      if (name.includes('deepseek')) return require('@/assets/deepseek.png');
      if (name.includes('glm')) return require('@/assets/glm.png');
    },

    //模型收藏按钮点击，如果收藏list中存在，则取消收藏；否则加入收藏list
    async toggleFavorite(modelName) {
      let newFavorites;
      if (this.favorites.includes(modelName)) {
        newFavorites = this.favorites.filter(name => name !== modelName);
      } else {
        newFavorites = [...this.favorites, modelName];
      }
      await this.updateFavorites(newFavorites, true);
    },

    //判断模型是否在收藏list中
    isFavorite(modelName) {
      return this.favorites.includes(modelName);
    },

    // 将 messageLists 持久化到 localStorage
    saveMessageLists() {
      localStorage.setItem('messageLists', JSON.stringify(this.messageLists));
    },

    // 从后端collectModels字段更新favorites数组并保存到本地
    async updateFavoritesFromBackend() {
      if (loginState.userLoginData && loginState.userLoginData.collectModels) {
        try {
          const collectModelsStr = loginState.userLoginData.collectModels;
          if (collectModelsStr && typeof collectModelsStr === 'string') {
            const backendFavorites = JSON.parse(collectModelsStr);
            if (Array.isArray(backendFavorites)) {
              await this.updateFavorites(backendFavorites, false);
            }
          }
        } catch (error) {
          console.error('解析后端收藏列表失败:', error);
        }
      }
    },

    // 向后端发送请求存储最新收藏列表
    async updateFavoritesToBackend() {
      if (this.isLoggedIn && loginState.userLoginData && loginState.userLoginData.uuid) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            return;
          }
          
          const uuid = loginState.userLoginData.uuid;
          const collectModels = JSON.stringify(this.favorites);
          
          const response = await service.post('/user/updatcltmls', {
            uuid: uuid,
            collectModels: collectModels
          });
          
          const responseData = response.data;
          if (responseData && responseData.code !== 200) {
            console.error('同步收藏列表失败:', responseData?.message);
          }
        } catch (error) {
          console.error('同步收藏列表失败:', error);
        }
      }
    },

    // 统一处理favorites数组更新，确保本地存储和后端同步
    async updateFavorites(newFavorites, shouldSyncToBackend = true) {
      this.favorites = newFavorites;
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
      
      if (shouldSyncToBackend) {
        await this.updateFavoritesToBackend();
      }
    },

    // 发送消息方法
    async sendMessage() {
      if (!this.selectedModel) {
        this.$message && this.$message({ message: '请先选择模型', type: 'warning', duration: 2000 });
        return;
      }
      if (this.messageInput.trim()) {
        // 初始化该模型的消息列表（如无）
        if (!this.messageLists[this.selectedModel]) {
          this.$set(this.messageLists, this.selectedModel, []);
        }
        const list = this.messageLists[this.selectedModel]; //获取该模型对应的消息列表
        // 获取输入内容，并构建user消息到消息列表动态渲染，包含唯一ID
        list.push({senderby: this.userName, text: this.messageInput.trim()});
        // 聊天窗口只保留 20 条消息（10 轮对话）
        if (list.length > 20) {
          list.splice(0, list.length - 20);
        }
        this.saveMessageLists();
        // 刷新聊天窗口滚动条到底部，显示最新消息
        this.$nextTick(() => {
          const msgList = this.$refs.messageList;
          if (msgList) msgList.scrollTop = msgList.scrollHeight;
        });

        // 新增：AI消息pending动画
        let aiMsg = {senderby: this.selectedModel, text: 'pending'};
        list.push(aiMsg);
        let aiMsgIndex = list.length - 1;
        if (list.length > 20) {
          list.splice(0, list.length - 20);
          aiMsgIndex = list.length - 1;
        }
        this.saveMessageLists();
        this.$forceUpdate();
        this.$nextTick(() => {
          const msgList = this.$refs.messageList;
          if (msgList) msgList.scrollTop = msgList.scrollHeight;
        });

        //获取选中的模型，构建请求url与请求body
        const platform = this.getModelPlatform(this.selectedModel);

        if (!platform) {
          const list = this.messageLists[this.selectedModel];
          const aiMsgIndex = list.findIndex(m => m.text === 'pending');
          if (aiMsgIndex !== -1) {
            this.$set(list, aiMsgIndex, { ...list[aiMsgIndex], text: '[错误: 未能识别模型平台]' });
            this.saveMessageLists();
          }
          this.$message && this.$message({ message: '无法确定模型所属平台，请求无法发送', type: 'error', duration: 3000 });
          return;
        }
        
        let url;
        if (platform === 'alibailian') {
          url = '/chat/almodel';
        } else if (platform === 'baiduqianfan') {
          url = '/chat/bdmodel';
        }

        const body = {
          modelName: this.selectedModel,
          content: this.messageInput.trim(),
          contentType: 0,
          isNewChat: this.isNewChat,
          hisMsgNumber: this.isNewChat === 0 ? this.hisMsgNumber : 0
        };
        
        this.messageInput = ''; //清空输入框
        let aiText = '';  // 记录ai消息记录的文本内容（多chunk累积）
        let done = false; // 记录流式响应是否结束的标志
        let buffer = ''; // 记录流式响应的缓冲区
        try {
          const config = await service({   // 用预定义的axios(service)生成带token的headers和完整url，流式fetch请求无法在拦截器中注入token与基础url
            url,
            method: 'post',
            data: body,
            adapter: config => {
              return Promise.resolve({
                config,
                status: 200,
                statusText: 'skip',
                headers: config.headers,
                data: null
              });
            }
          });
          const headers = config.config.headers;  //获得axios请求的headers
          const fullUrl = service.defaults.baseURL + url; //获得axios的基础地址部分+模型名地址部分

          // 用fetch发送流式请求，获取response.body
          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });
          if (!response.body) {
            console.error('No response body (stream) received');
            response.text().then(txt => console.log('response text:', txt));
          }

          //初始化流读取器
          const reader = response.body.getReader(); //逐块读取流数据
          const decoder = new TextDecoder('utf-8');  //将二进制解码为utf-8文本
          //循环读取流式内容
          while (!done) {
            const { value, done: doneReading } = await reader.read(); //读取流数据块value、是否结束标志doneReading
            done = doneReading; //更新流结束标记
            
            //处理每个流数据块value
            if (value) {
              buffer += decoder.decode(value, { stream: true });  //用于将二进制数据转为字符串,解码后拼接到buffer中，buffer中可能存储前一个未处理的chunk不完整数据

              //结合前序流块的残留+当前流块内容，读取换行符前的完整chunk
              let lines = buffer.split('\n'); //按照换行符拆分buffer数组
              buffer = lines.pop(); //取出最后一行(可能是不完整的chunk残留)，重新赋值给 buffer下次流块进来一起处理

              //逐行(逐个chunk处理)
              for (let line of lines) { 
                line = line.trim();
                if (!line) continue;
                if (line.startsWith('data:')) { //去除data:前缀，获取后面的有效jason
                  line = line.slice(5).trim();
                }
                if (!line) continue;

                let decodedStr;
                try {
                  decodedStr = this.b64ToUtf8(line); //base64解码为utf-8字符串
                  let json = JSON.parse(decodedStr); //解析解码后的json
                  let content = json.APIChunkJson.content; //获取chunk中的有效对话内容
                  const currentAiMessageText = list[aiMsgIndex]?.text;
                  let shouldUpdateUI = false;

                  if (content && content !== 'null') {
                    // 接收到有效内容
                    if (currentAiMessageText === 'pending' || currentAiMessageText === '正在推理中......') {
                      // 如果是首个有效内容块，直接替换 placeholder
                      aiText = content;
                    } else {
                      // 否则，累加内容
                      aiText += content;
                    }
                    this.$set(list, aiMsgIndex, { ...list[aiMsgIndex], text: aiText });
                    shouldUpdateUI = true;

                  } else {
                    // 接收到 null 或 "null"
                    if (currentAiMessageText === 'pending') {
                      // 且当前是 pending 状态，则显示推理中
                      this.$set(list, aiMsgIndex, { ...list[aiMsgIndex], text: '正在推理中......' });
                      shouldUpdateUI = true;
                    }
                  }

                  if (shouldUpdateUI) {
                    this.saveMessageLists();
                    this.$forceUpdate();
                    this.$nextTick(() => {
                      const msgList = this.$refs.messageList;
                      if (msgList) msgList.scrollTop = msgList.scrollHeight;
                    });
                  }

                  //从chunk中读取流结束的标志
                  if (json.APIChunkJson.finish_reason === 'stop') {
                    done = true;
                    break;
                  }
                } catch (err) {
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error('流式处理异常:', error);
          if (aiMsgIndex !== null && list[aiMsgIndex]) {
            this.$set(list, aiMsgIndex, {
              ...list[aiMsgIndex],
              text: '[模型回复失败]'
            });
            this.saveMessageLists();
          }
          this.$message && this.$message({ message: error.message || '消息发送失败', type: 'error', duration: 2000 });
        }
        // 无论成功失败都重置 isNewChat
        this.isNewChat = 0;
        // 如果不是新对话，递增历史消息数量（但不超过20）
        if (this.hisMsgNumber < 20) {
          this.hisMsgNumber++;
        }
      }
    },

    // Base64解码为UTF-8字符串
    b64ToUtf8(str) {
      const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    },

    // 解析JWT，获取sub字段（邮箱）
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

    // 处理用户状态按钮点击
    handleUserStatusClick() {
      if (this.isLoggedIn) {
        // 已登录，跳转到用户页面
        this.$router.push({ name: 'UserPage' });
      } else {
        // 未登录，显示登录弹窗
        this.showLoginModal = true;
      }
    },

    // 持久化存储token
    saveToken(token) {
      if (token) {
        const realToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        localStorage.setItem('token', realToken);
      }
    },

    // 处理账户密码登录
    async handleLogin() {
      try {
        let body = { password: this.loginForm.password };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (emailRegex.test(this.loginForm.account)) {
          body.email = this.loginForm.account;
        } else if (phoneRegex.test(this.loginForm.account)) {
          body.phone = '+86' + this.loginForm.account;
        } else {
          this.$message({
            message: '请输入有效的邮箱或手机号',
            type: 'error',
            duration: 2000
          });
          return;
        }

        const response = await service.post('/user/login', body);
        const responseData = response.data;
        
        //从登录响应中提取token并保存本地
        const token = response.headers['authorization'] || response.headers['Authorization'] || response.headers['token'] || response.headers['Token'];
        if (token) {
          this.saveToken(token);
        }

        if (responseData.code === 200) {
          // 在登录逻辑成功后，但在设置任何新状态或重新加载页面之前
          if (responseData && responseData.data) {
            // 清除本地存储的模型选择历史，确保新登录不恢复旧选择
            localStorage.removeItem('selectedModel');
            this.selectedModel = null;

            // 使用Vue.set确保响应式更新
            Vue.set(loginState, 'userLoginData', responseData.data);
            await this.updateFavoritesFromBackend();
            this.messageLists = {};
            localStorage.removeItem('messageLists');
            this.showLoginModal = false;
            this.$message({message: '登录成功', type: 'success', duration: 2000 });
            window.location.href = '/home';
          }
        } else {
          const errorMessage = responseData.errors?.credentials || responseData.message || '登录失败';
          this.$message({
            message: errorMessage,
            type: 'error',
            duration: 2000
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.$message({
            message: error.response?.data?.message || '该账号未注册，请先注册',
            type: 'warning',
            duration: 2000
          });
        } else {
          const errorData = error.response?.data;
          const errorMessage = errorData?.errors?.credentials || errorData?.message || '登录失败，请稍后重试';
          this.$message({
            message: errorMessage,
            type: 'error',
            duration: 2000
          });
        }
      }
    },

    // 发送验证码
    async sendVerificationCode() {
      if (!this.phoneLoginForm.phone) {
        this.$message({ message: '请输入手机号', type: 'warning', duration: 2000 });
        return;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.phoneLoginForm.phone)) {
        this.$message({ message: '请输入有效的手机号', type: 'error', duration: 2000 });
        return;
      }

      try {
        await service.post('/user/loginsendcode', { 
          phone: `+86${this.phoneLoginForm.phone}` 
        });

        this.$message({ message: '验证码已发送', type: 'success', duration: 2000 });
        this.countdown = 60; // 重置倒计时
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
          }
        }, 1000);

      } catch (error) {
        this.$message({ message: error.response?.data?.message || '验证码发送失败', type: 'error', duration: 2000 });
      }
    },
    // 处理手机验证码登录
    async handlePhoneLogin() {
      if (!this.phoneLoginForm.phone || !this.phoneLoginForm.code) {
        this.$message({ message: '请输入手机号和验证码', type: 'warning', duration: 2000 });
        return;
      }

      try {
        const response = await service.post('/user/loginbycode', {
          phone: `+86${this.phoneLoginForm.phone}`,
          code: this.phoneLoginForm.code
        });

        const responseData = response.data;
        const token = response.headers['authorization'] || response.headers['Authorization'] || response.headers['token'] || response.headers['Token'];
        if (token) {
          this.saveToken(token);
        }

        if (responseData.code === 200) {
          Vue.set(loginState, 'userLoginData', responseData.data.user);

          // 从后端collectModels字段更新收藏列表
          await this.updateFavoritesFromBackend();

          // 登录成功后清除消息记录
          this.messageLists = {};
          localStorage.removeItem('messageLists');

          this.showLoginModal = false;
          this.$message({ message: '登录成功', type: 'success', duration: 2000 });
        } else {
          this.$message({ message: responseData.message || '登录失败', type: 'error', duration: 2000 });
        }
      } catch (error) {
        this.$message({ message: error.response?.data?.message || '登录失败，请稍后重试', type: 'error', duration: 2000 });
      }
    },

    // 处理新注册
    handleRegister() {
      // 关闭登录弹窗
      this.showLoginModal = false;
      // 跳转到注册页面
      this.$router.push({ name: 'RegisterPage' });
    },

    // 新增：全局点击事件处理
    handleGlobalClick(e) {
      if (!this.isLoggedIn && !this.showLoginModal) {
        // 检查点击的是否是.user-status-btn 或 menu-btn
        let el = e.target;
        let isAllowedBtn = false;
        while (el) {
          if (el.classList && (el.classList.contains('user-status-btn') || el.classList.contains('menu-btn'))) {
            isAllowedBtn = true;
            break;
          }
          el = el.parentElement;
        }
        if (!isAllowedBtn) {
          this.$message && this.$message({ message: '请点击左下角登录', type: 'info', duration: 3500 });
          e.stopPropagation();
        }
      }
    },

    // 新增：模型名称首字母大写，-后单词首字母也大写，数字不变
    capitalizeModelName(name) {
      if (!name) return '';
      return name.split('-').map(word => {
        // 如果是纯数字，直接返回
        if (/^\d+$/.test(word)) return word;
        // 首字母大写，其余不变
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join('-');
    },

    // markdown 格式化消息内容
    formatMessage(text) {
      // 先把所有 \\n 和 \n 替换为真正的换行符
      const normalized = (text || '').replace(/\\n/g, '\n');
      return marked(normalized, { breaks: true });
    },

    // 新增：重建对话，清空当前模型的消息列表
    resetConversation() {
      if (!this.selectedModel) {
        this.$message && this.$message({ message: '请先选择模型', type: 'warning', duration: 2000 });
        return;
      }
      this.$set(this.messageLists, this.selectedModel, []);
      this.saveMessageLists();
      this.isNewChat = 1;
      this.hisMsgNumber = 0;
      this.$message && this.$message({ message: '对话已重建', type: 'success', duration: 1500 });
    },

    // 右键复制消息内容
    async copyMessage(message) {
      let text = message && message.text ? message.text : '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.$message && this.$message({ message: '消息已复制', type: 'success', duration: 1200 });
      } catch (err) {
        // 忽略复制失败的异常（兼容性处理）
      }
    },

    // 清空收藏信息
    clearFavorites() {
      this.favorites = [];
      localStorage.removeItem('favorites');
    },

  }



}
</script>




<style scoped>
body {
  margin: 0;
  padding: 0;
}

.home_page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  padding: 5px 20px;
  background-color: #f5f5f5;
  color: #333;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  margin: 0;
  z-index: 1001; /* 确保topbar在sidebar之上 */
}

.menu-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin: 0;
}

.menu-icon {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(0.6);
}

.manage-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin: 0;
}

.manage-icon {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(0.6);
}


.sidebar {
  position: absolute;  /* 绝对定位 */
  left: 0;             /* 贴左 */
  bottom: 0;           /* 贴底 */
  top: 45px;          /* 与topbar高度一致 */
  width: 250px;
  background-color: #fff;
  padding: 5px 0 0 0; /* 只保留顶部padding */
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  margin: 0;
  transform: translateX(-100%); /* 初始状态：完全隐藏 */
  transition: transform 0.3s ease-in-out; /* 平滑过渡 */
  z-index: 1000;
  display: flex;  /* 使用flex布局 */
  flex-direction: column;  /* 垂直排列 */
  border-right: none;  /* 确保没有右边框 */
}

.sidebar.active {
  transform: translateX(0); /* 滑入视口 */
}



/* 操作列表（深色区块） */
.action-list {
  list-style: none;
  padding: 0;
  margin-bottom: 0;
  background-color: #4b6584; /* 深蓝灰色背景 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
  overflow: hidden; /* 确保子元素圆角生效 */
  margin-top: 0; /* 移除顶部间距 */
  border-top: 1px solid rgba(255, 255, 255, 0.1); /* 浅色分隔线 */
}

.action-list li {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 分隔线 */
}

.action-list li:last-child {
  border-bottom: none; /* 最后一个元素无分隔线 */
}

.action-list button {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent; /* 透明背景 */
  color: #ecf0f1; /* 浅色文字 */
  border: none;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600; /* 加粗（500=中等，600=半粗，700=粗体） */
  font-size: 1.1rem; /* 比默认稍大（默认通常为 1rem=16px） */
}

.action-list button:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 悬停效果 */
}

/* 模型列表（带外围线框 + 滚动条） */
.model-list {
  flex: 1;  /* 占据剩余空间 */
  overflow-y: auto;  /* 保持滚动功能 */
  margin: 0 0 10px 0; /* 只保留底部间距 */
  list-style: none; /* 移除列表项前面的点 */
  padding: 0; /* 移除默认内边距 */
}

.model-list .model-button:hover {
  background-color: #f5f5f5; /* 悬停效果 */
}

/* 滚动条样式（可选） */
.model-list::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
}

.model-list::-webkit-scrollbar-thumb {
  background-color: #c1c1c1; /* 滚动条滑块颜色 */
  border-radius: 3px; /* 圆角 */
}

.model-list::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 滚动条轨道颜色 */
}

.model-list li {
  padding: 0;
  border-bottom: 1px solid #f0f0f0; /* 每个 item 之间的分隔线 */
}

.model-list li:last-child {
  border-bottom: none; /* 最后一个 item 无分隔线 */
}

.model-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: #333;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center; /* 垂直居中 */
  padding: 0.75rem 1rem;
  position: relative; /* 为绝对定位的星标提供参考 */
  padding-right: 40px; /* 为星标预留空间 */
}

.model-button:hover:not(.selected) {
  background-color: #f5f5f5; /* 悬停效果，但排除选中状态 */
}

.model-button.selected {
  background-color: #e8f5e9 !important; /* 浅绿色背景 */
  color: #2e7d32 !important; /* 深绿色文字 */
  font-weight: 500; /* 稍微加粗以突出显示 */
}

.model-icon {
  width: 32px;        /* 控制图标大小 */
  height: 32px;
  margin-right: 10px;  /* 图标与文字间距 */
  object-fit: contain; /* 保持图片比例 */
  image-rendering: -webkit-optimize-contrast; /* 禁用模糊缩放 */

}

.model-name {
  flex-grow: 1; /* 让名称占据剩余空间 */
  text-align: left;
  color: #666;  /* 浅灰色 */
}

/* 当前选中的模型名称（输入框上方） */
.selected-model .model-name {
  color: #2ecc71;  /* 绿色 */
  font-size: 14px;
  font-weight: 600;  /* 加粗一点 */
}

.favorite-star {
  position: absolute;
  right: 15px;
  color: #ccc; /* 默认灰色 */
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  pointer-events: auto; /* 允许星标单独响应点击 */
  top: 50%; /* 垂直居中 */
  transform: translateY(-50%);
  z-index: 1; /* 确保星标在最上层 */
}

.favorite-star.favorited {
  color: gold; /* 收藏状态变为金色 */
  text-shadow: 0 0 2px rgba(255,215,0,0.7);
}

.user-status {
  margin: 0 auto;            /* 水平居中 */
  padding: 0;                /* 移除所有内边距 */
  background-color: #edf2f7;
  position: sticky;
  bottom: 5px;
  width: 98%;
  height: 80px;              /* 设置固定高度 */
  box-sizing: border-box;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;             /* 启用 Flex 布局 */
  align-items: center;       /* 垂直居中子元素 */
}

.user-status-btn {
  width: 100%;              /* 铺满父容器宽度 */
  height: 100%;             /* 铺满父容器高度 */
  padding: 0 15px;          /* 保留左右内边距 */
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;      /* 垂直居中内容 */
  cursor: pointer;
  transition: all 0.2s ease; /* 添加过渡效果 */
  border-radius: 6px;
  box-sizing: border-box;
}

.user-status-btn:hover {
  background-color: #e2e8f0;  /* 更深的悬停颜色 */
}

.user-status-btn:active {
  background-color: #cbd5e0;  /* 点击时的背景色 */
  transform: scale(0.98);     /* 点击时轻微缩小 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); /* 点击时的内阴影效果 */
}

.user-icon {
  width: 28px;  /* 进一步增加图标尺寸 */
  height: 28px;
  margin-right: 12px;  /* 增加图标与文字的间距 */
  margin-left: 15px;   /* 新增：图标向右移动15px */
}

.user-name {
  color: #333;
  font-size: 14px;  /* 增加文字大小 */
  font-weight: 500;  /* 稍微加粗 */
}

.content {
  flex: 1;
  padding: 20px;
  margin: 0;
}

/* Chat Area Styles */
.chat-area {
  position: absolute;
  left: 250px; /* sidebar宽度 */
  top: 45px; /* topbar高度 */
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 150px 20px 150px;  /* 左右padding与输入框区域一致 */
  margin-right: 70px;  /* 为发送按钮预留空间 */
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin-top: 25px;  /* 为发送者名称留出空间 */
}

.message-user {
  align-self: flex-end;
}

.message-ai {
  align-self: flex-start;
  margin-left: 24px; /* 与重建对话按钮宽度一致，确保左对齐 */
}

.message-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;  /* 确保内容不会超出容器 */
  position: relative;  /* 为绝对定位的发送者名称提供参考 */
}

.message-user .message-content {
  background-color: #e6f3ff;  /* 浅蓝色背景 */
}

.message-sender {
  font-size: 14px; /* 减小字体 */
  font-weight: bold;
  color: #666;
  margin-bottom: 5px; /* 调整间距 */
  position: absolute;  /* 绝对定位 */
  top: -21px;  /* 调整向上偏移 */
  left: 0;  /* 左对齐 */
}

.message-user .message-sender {
  font-weight: bold;
}

.message-ai .message-sender {
  font-weight: bold;
}

.message-text {
  font-size: 14px;
  line-height: 1.8;  /* 增加行高 */
  word-break: break-word;
  text-align: left;  /* 确保文字左对齐 */
  letter-spacing: 0.5px;  /* 增加字间距 */
  margin-top: 5px;  /* 为发送者名称留出空间 */
}

/* 缩小用户消息 markdown 段落间距 */
.message-user .message-text p {
  margin: 0.1em 0 !important;
  padding: 0 !important;
}

/* Vue2 scoped 深度覆盖，彻底去除所有 .message-text 下 <p> 的间距 */
.message-text >>> p {
  margin: 0 !important;
  padding: 0 !important;
}

.chat-input-area {
  padding: 40px 120px;
  background-color: #fff;
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
}

.selected-model {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 100%;
  padding: 0 120px;
  box-sizing: border-box;
}

.input-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.chat-input {
  flex: 1;
  min-width: 0;
  min-height: 60px;  /* 增加最小高度 */
  max-height: 120px;
  padding: 15px;  /* 增加内边距 */
  border: 1px solid #dee2e6;
  border-radius: 8px;  /* 增加圆角 */
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* 添加阴影效果 */
}

.chat-input:focus {
  border-color: #80bdff;
  box-shadow: 0 2px 12px rgba(0, 123, 255, 0.2);  /* 聚焦时增强阴影效果 */
}

.chat-input[disabled] {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

.send-button {
  height: 40px;  /* 与输入框高度一致 */
  padding: 0 20px;  /* 调整padding */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  display: flex;  /* 使用flex布局 */
  align-items: center;  /* 文字垂直居中 */
  justify-content: center;  /* 文字水平居中 */
}

.send-button:hover {
  background-color: #0056b3;
}

.send-button:active {
  background-color: #004085;
}

.send-button:disabled {
  background-color: #ccc;
  color: #fff;
  cursor: not-allowed;
}

/* 当sidebar隐藏时调整chat-area位置 */
.sidebar:not(.active) + .chat-area {
  left: 0;
}

/* 登录弹窗样式 */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.login-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;  /* 添加相对定位 */
}

.login-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  position: absolute;  /* 绝对定位 */
  left: 50%;          /* 水平居中 */
  transform: translateX(-50%);  /* 水平居中偏移 */
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  margin-left: auto;  /* 将关闭按钮推到右边 */
  z-index: 1;        /* 确保按钮在标题上层 */
}

.close-btn:hover {
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.login-btn, .register-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn {
  background-color: #007bff;
  color: white;
}

.login-btn:hover {
  background-color: #0056b3;
}

.register-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.register-btn:hover {
  background-color: #e9ecef;
}

/* 登录方式切换样式 */
.login-type-switch {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.switch-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: color 0.2s;
}

.switch-btn.active {
  color: #007bff;
}

/* 验证码登录表单样式 */
.verification-code {
  display: flex;
  align-items: center;
  gap: 10px;  /* 添加间距 */
}

.send-code-btn {
  min-width: 100px;  /* 设置最小宽度 */
  padding: 8px 12px;  /* 添加内边距 */
  background-color: #f8f9fa;  /* 浅色背景 */
  border: 1px solid #dee2e6;  /* 添加边框 */
  border-radius: 4px;  /* 圆角 */
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;  /* 防止文字换行 */
}

.send-code-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  color: #495057;
}

.send-code-btn:disabled {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  cursor: not-allowed;
}

/* 消息淡入过渡动画 */
.fade-message-enter-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-message-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-message-enter, .fade-message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 在<style scoped>最后添加 */
.reset-conversation-btn {
  height: 72px;
  width: 36px;
  padding: 0;
  background-color: #f5f5f5;
  color: #888;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 2px;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0px;
  font-style: normal;
  line-height: 2.4;
  white-space: nowrap;
}
.reset-conversation-btn:hover:not(:disabled) {
  background-color: #e8e8e8;
  color: #555;
}
.reset-conversation-btn:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
}

/* 在<style scoped>最后添加 pending-dots 动画样式 */
.pending-dots {
  display: inline-block;
  font-size: 24px;
  color: #666;
  letter-spacing: 2px;
  min-width: 120px;
}
.pending-dots span {
  opacity: 0.3;
  animation: blink 1.2s infinite;
}
.pending-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.pending-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
.pending-dots span:nth-child(4) {
  animation-delay: 0.6s;
}
.pending-dots span:nth-child(5) {
  animation-delay: 0.8s;
}
.pending-dots span:nth-child(6) {
  animation-delay: 1.0s;
}
.pending-dots span:nth-child(7) {
  animation-delay: 1.2s;
}
.pending-dots span:nth-child(8) {
  animation-delay: 1.4s;
}
.pending-dots span:nth-child(9) {
  animation-delay: 1.6s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.reasoning-text {
  color: #666;
  font-style: italic;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>