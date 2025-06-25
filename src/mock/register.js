import Mock from 'mockjs'
import API_BASE_URL from '@/utils/baseurl'

// 模拟注册接口,拦截url请求并返回模拟数据格式
Mock.mock(`${API_BASE_URL}/user/register`, 'post', (options) => {
  const body = JSON.parse(options.body)
  
  // 模拟邮箱已存在的情况
  if (body.email === 'test@example.com') {
    return {
      code: 400,
      success: false,
      message: '该邮箱已被注册',
      data: null
    }
  }

  // 模拟注册成功的情况
  return {
    "message": "注册成功",
    "data": {
        "uuid": "996ea687-f02f-461b-9f9a-8d1a4f83ff11",
        "email": "user_bob133@163.com",
        "name": "bob",
        "phone": "+8613512221678",
        "roleName": "NORMAL",
        "tokenVersion": 0,
        "createdDateTime": "2025-06-18 17:17:38",
        "updatedDateTime": "2025-06-18 17:17:38",
        "lastLoginTime": "1970-01-01 08:00:00",
        "membershipExpiryTime": "1970-01-01 08:00:00"
        },
    "success": true,
    "code": 200
  }
}) 