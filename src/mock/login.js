import Mock from 'mockjs'
import API_BASE_URL from '@/utils/baseurl'

// 模拟登录接口，拦截url请求并返回模拟数据格式
Mock.mock(`${API_BASE_URL}/user/login`, 'post', (options) => {
  const body = JSON.parse(options.body)

  if (body.email!='chenxi63sjtu@163.com') {
    return {
      "message": "登录失败",
      "success": false,
      "errors": {
        "credentials": "用户名或密码错误"
      },
      "code": 401
    }
  }

  // 登录成功
  return {
    "message": "登录成功",
    "data": {
      "tokenType": "Bearer",
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJuaWNrTmFtZSI6ImNoZW54aSIsInRva2VuVmVyc2lvbiI6NCwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJzdWIiOiJjaGVueGk2M3NqdHVAMTYzLmNvbSIsImlhdCI6MTc1MDMwMTg0OCwiZXhwIjoxNzUwMzA1NDQ4fQ.5dpuunDh2wl7f_WXUtOZ2emhVvWohjee3IY5HdF8U6c",
      "user": {
        "uuid": "9a981217-5d3b-44f1-97fe-d545fbfbd6a8",
        "email": "chenxi63sjtu@163.com",
        "name": "chenxi6333",
        "phone": "+8613564255020",
        "roleName": "NORMAL",
        "tokenVersion": 4,
        "createdDateTime": "2025-06-12 17:39:37",
        "updatedDateTime": "2025-06-12 17:56:50",
        "lastLoginTime": "2025-06-13 15:18:20",
        "membershipExpiryTime": "1970-01-01 08:00:00"
      }
    },
    "success": true,
    "code": 200
  }
}) 