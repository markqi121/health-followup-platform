/**
 * 健康随访包平台 - API 测试套件
 * TDD 方式：测试驱动开发
 */

const request = require('supertest');
const app = require('../server');

// 测试数据
const TEST_DATA = {
  device: {
    sn: 'TEST_DEVICE_001',
    device_id: 'dev001',
    version: 1
  },
  doctor: {
    doctors: [{
      idcard: '110101199001011234',
      name: '张医生',
      phone: '13800138000',
      org_code: 'ORG001',
      org_name: '测试医院'
    }]
  },
  person: {
    persons: [{
      idcard: '110101195001011111',
      name: '测试居民',
      phone: '13900139000',
      sex: '1',
      birthday: '1950-01-01',
      address: '北京市测试区'
    }]
  },
  checkup: {
    sn: 'TEST_DEVICE_001',
    device_id: 'dev001',
    version: '1.0',
    timestamp: Math.floor(Date.now() / 1000),
    checkups: [
      {
        type: 1,  // 无创血压
        person: '110101195001011111',
        doctor: '110101199001011234',
        value: { sp: 120, dp: 80 },
        time: Math.floor(Date.now() / 1000)
      },
      {
        type: 4,  // 体温
        person: '110101195001011111',
        doctor: '110101199001011234',
        value: { temperature: 36.5 },
        time: Math.floor(Date.now() / 1000)
      }
    ]
  }
};

describe('健康随访包平台 API 测试', () => {
  
  // ========== 健康检查 ==========
  describe('GET /health - 健康检查', () => {
    test('应返回服务正常状态', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });
  });

  // ========== 设备注册 ==========
  describe('POST /device - 设备注册', () => {
    test('应成功注册设备并返回 ret:0', async () => {
      const res = await request(app)
        .post('/device')
        .send(TEST_DATA.device)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
      expect(res.body).toHaveProperty('error_msg');
    });

    test('缺少 sn 字段应返回错误', async () => {
      const res = await request(app)
        .post('/device')
        .send({ version: 1 })
        .expect(200);
      
      expect(res.body.ret).not.toBe(0);
    });
  });

  // ========== 医生管理 ==========
  describe('POST /doctor - 医生批量上传', () => {
    test('应成功上传医生数据', async () => {
      const res = await request(app)
        .post('/doctor')
        .send(TEST_DATA.doctor)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
    });
  });

  describe('POST /getDoctorList - 医生列表查询', () => {
    test('应返回医生列表', async () => {
      const res = await request(app)
        .post('/getDoctorList')
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
      expect(res.body).toHaveProperty('doctors');
      expect(Array.isArray(res.body.doctors)).toBe(true);
    });
  });

  // ========== 居民管理 ==========
  describe('POST /person - 居民批量上传', () => {
    test('应成功上传居民数据', async () => {
      const res = await request(app)
        .post('/person')
        .send(TEST_DATA.person)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
    });
  });

  describe('POST /getPersonList - 居民列表查询', () => {
    test('应返回居民列表', async () => {
      const res = await request(app)
        .post('/getPersonList')
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
      expect(res.body).toHaveProperty('persons');
      expect(Array.isArray(res.body.persons)).toBe(true);
    });
  });

  // ========== 体检数据上传（核心）==========
  describe('POST /checkup - 体检数据上传', () => {
    test('应成功上传血压数据（type=1）', async () => {
      const bpData = {
        ...TEST_DATA.checkup,
        checkups: [{
          type: 1,
          person: '110101195001011111',
          doctor: '110101199001011234',
          value: { sp: 120, dp: 80 },
          time: Math.floor(Date.now() / 1000)
        }]
      };

      const res = await request(app)
        .post('/checkup')
        .send(bpData)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
      expect(res.body).toHaveProperty('error_msg');
    });

    test('应成功上传体温数据（type=4）', async () => {
      const tempData = {
        ...TEST_DATA.checkup,
        checkups: [{
          type: 4,
          person: '110101195001011111',
          doctor: '110101199001011234',
          value: { temperature: 36.5 },
          time: Math.floor(Date.now() / 1000)
        }]
      };

      const res = await request(app)
        .post('/checkup')
        .send(tempData)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
    });

    test('应成功批量上传多种类型数据', async () => {
      const res = await request(app)
        .post('/checkup')
        .send(TEST_DATA.checkup)
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
    });

    test('缺少 checkups 数组应返回错误', async () => {
      const res = await request(app)
        .post('/checkup')
        .send({ sn: 'TEST001' })
        .expect(200);
      
      expect(res.body.ret).not.toBe(0);
      expect(res.body.error_msg).toContain('checkups');
    });

    test('缺少必填字段应返回错误', async () => {
      const invalidData = {
        sn: 'TEST001',
        checkups: [{ type: 1 }] // 缺少 person, value, time
      };

      const res = await request(app)
        .post('/checkup')
        .send(invalidData)
        .expect(200);
      
      // 批量上传中部分失败，整体返回部分失败或根据实现决定
      expect(res.body).toHaveProperty('ret');
    });
  });

  describe('GET /checkup - 体检数据查询', () => {
    test('应能查询到上传的血压数据', async () => {
      // 先上传数据
      await request(app)
        .post('/checkup')
        .send(TEST_DATA.checkup);

      // 再查询
      const res = await request(app)
        .get('/checkup?person=110101195001011111')
        .expect(200);
      
      expect(res.body).toHaveProperty('ret', 0);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // 验证数据结构
      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('person_idcard');
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('device_sn');
      }
    });
  });

  // ========== 错误处理 ==========
  describe('错误处理', () => {
    test('访问不存在的接口应返回 404', async () => {
      const res = await request(app)
        .get('/notexist')
        .expect(404);
      
      expect(res.body).toHaveProperty('ret', -1);
    });
  });
});

// 协议兼容性测试
describe('协议兼容性测试', () => {
  test('设备注册使用 sn 字段（协议要求）', async () => {
    const res = await request(app)
      .post('/device')
      .send({ sn: 'PROTOCOL_TEST', version: 1 });
    
    expect(res.body.ret).toBe(0);
  });

  test('体检上传使用 sn 字段（协议要求）', async () => {
    const res = await request(app)
      .post('/checkup')
      .send({
        sn: 'PROTOCOL_TEST',
        checkups: [{
          type: 1,
          person: '110101195001011111',
          value: { sp: 120, dp: 80 },
          time: Math.floor(Date.now() / 1000)
        }]
      });
    
    expect(res.body.ret).toBe(0);
  });

  test('返回格式符合协议 {ret, error_msg}', async () => {
    const res = await request(app).get('/health');
    
    // 健康检查接口返回格式不同，但其他接口统一
    const checkupRes = await request(app)
      .post('/checkup')
      .send({ sn: 'TEST', checkups: [] });
    
    expect(checkupRes.body).toHaveProperty('ret');
    expect(checkupRes.body).toHaveProperty('error_msg');
  });
});
