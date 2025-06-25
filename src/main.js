import Vue from 'vue'
import App from './App.vue'
import router from './router'

//import './mock'  // 统一引入所有mock接口
import ElementUI from 'element-ui' //桌面端组件库(命令行安装)
import 'element-ui/lib/theme-chalk/index.css' //默认主题样式
import { Message } from 'element-ui';  //桌面端组件的消息提示组件

Vue.use(ElementUI) //全局注册 Element UI 的所有组件和指令
Vue.config.productionTip = false //关闭 Vue 启动时的生产环境提示信息
Vue.config.errorHandler = (err) => { console.error('全局错误:', err.stack);}; //全局捕获 Vue 组件内未处理的错误
Vue.prototype.$message = Message; // 全局注入message组件,所有组件可通过 this.$message 调用

new Vue({
  router,  // 注入路由
  render: h => h(App)
}).$mount('#app')