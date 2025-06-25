# API 基础路径配置说明

## 概述
本项目已重构网络请求的基础路径配置，所有API请求现在都使用统一的基础路径配置，方便集中管理和更换。

## 配置文件
- **配置文件位置**: `src/utils/baseurl.js`
- **主要导出**: `API_BASE_URL` (默认导出)

## 使用方法

### 1. 在组件中使用
```javascript
import API_BASE_URL from '@/utils/baseurl';

// 使用示例
const response = await axios.get(`${API_BASE_URL}/user/login`, data);
```

### 2. 在 axios 配置中使用
```javascript
import API_BASE_URL from '@/utils/baseurl';

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});
```

### 3. 在 Mock 数据中使用
```javascript
import API_BASE_URL from '@/utils/baseurl';

Mock.mock(`${API_BASE_URL}/user/register`, 'post', (options) => {
  // mock 处理逻辑
});
```

## 环境配置
配置文件支持不同环境的API路径配置：

```javascript
const API_CONFIG = {
  development: 'http://8.130.171.182:338/api',  // 开发环境
  production: 'http://8.130.171.182:338/api',   // 生产环境
  test: 'http://8.130.171.182:338/api'          // 测试环境
};
```

## 更换基础路径
如需更换API基础路径，只需修改 `src/utils/baseurl.js` 文件中的 `API_CONFIG` 对象即可：

```javascript
const API_CONFIG = {
  development: 'http://your-new-api-domain.com/api',
  production: 'http://your-production-api.com/api',
  test: 'http://your-test-api.com/api'
};
```

## 已重构的文件
以下文件已更新为使用统一的基础路径配置：
- `src/utils/axios.js` - axios 实例配置
- `src/views/auth/RegisterPage.vue` - 注册页面
- `src/views/HomePage.vue` - 首页
- `src/mock/register.js` - 注册接口 mock
- `src/mock/login.js` - 登录接口 mock

## 注意事项
1. 所有新的API请求都应该使用 `API_BASE_URL` 进行路径拼接
2. 避免在代码中硬编码完整的API路径
3. 如需添加新的环境配置，请在 `API_CONFIG` 对象中添加相应的配置项 