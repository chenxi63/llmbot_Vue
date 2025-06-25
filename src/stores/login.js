import Vue from 'vue';

// 定义响应式对象,数据变化时可自动更新渲染
const state = Vue.observable({
  userLoginData: null,
});

export default state;