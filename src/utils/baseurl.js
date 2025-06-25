// 当前环境（可以通过环境变量或构建配置来设置）
const ENV = 'production'; // 当前使用环境
//const ENV = process.env.NODE_ENV || 'test'; // 可环境变量设置，系统默认环境变量为development


// 开发、测试、生产环境的基础URL配置,用于前端web页面中向后端发送请求
const API_CONFIG = {
  development: 'http://localhost:8081/api', //java项目本地运行
  test: 'http://8.130.171.182:338/api', //java项目服务器端运行
  production: '/api'  //Nginx会转发'/api'到后端项目，同时会使用新的代理即http://localhost:338/api
};

// 获取当前环境的基础URL
const API_BASE_URL = API_CONFIG[ENV] || API_CONFIG.development;

// 导出基础URL
export default API_BASE_URL;

// 导出配置对象（如果需要）
export { API_CONFIG };

// 导出环境信息（如果需要）
export { ENV };
