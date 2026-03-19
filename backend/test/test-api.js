/**
 * API 测试脚本 - 阶段1：设备注册接口验证
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

// 封装 HTTP 请求
function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试用例
async function runTests() {
  console.log('🧪 Health Followup API - Stage 1 Tests\n');
  console.log('='.repeat(50));

  // Test 1: 健康检查
  console.log('\n1️⃣ 测试健康检查接口 /health');
  try {
    const health = await request('/health');
    console.log('✅ Response:', JSON.stringify(health, null, 2));
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('💡 提示：请确保服务器已启动 (npm start)');
    return;
  }

  // Test 2: 设备注册（新设备）
  console.log('\n2️⃣ 测试设备注册（新设备）');
  const deviceData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: Math.floor(Date.now() / 1000),
    register_time: Math.floor(Date.now() / 1000),
    contact: '张三',
    contact_phone: '13800138000',
    org_name: '社区卫生服务中心'
  };
  console.log('Request:', JSON.stringify(deviceData, null, 2));
  const regResult = await request('/device', 'POST', deviceData);
  console.log('Response:', JSON.stringify(regResult, null, 2));

  // Test 3: 设备注册（重复设备，更新信息）
  console.log('\n3️⃣ 测试设备注册（重复设备，更新信息）');
  deviceData.contact = '李四';
  deviceData.contact_phone = '13900139000';
  const regResult2 = await request('/device', 'POST', deviceData);
  console.log('Response:', JSON.stringify(regResult2, null, 2));

  // Test 4: 设备注册（机构变更）
  console.log('\n4️⃣ 测试设备注册（机构变更）');
  deviceData.org_name = '另一社区卫生中心';
  const regResult3 = await request('/device', 'POST', deviceData);
  console.log('Response:', JSON.stringify(regResult3, null, 2));
  console.log('   ret=-2 表示机构变更，设备应清除本地数据');

  // Test 5: 查询设备列表
  console.log('\n5️⃣ 查询已注册设备列表');
  const devices = await request('/device');
  console.log('Response:', JSON.stringify(devices, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('✅ 阶段1测试完成！');
  console.log('\n📋 验证清单：');
  console.log('  [ ] /health 返回 status: ok');
  console.log('  [ ] 新设备注册返回 ret: 0');
  console.log('  [ ] 重复设备更新返回 ret: 0');
  console.log('  [ ] 机构变更返回 ret: -2');
  console.log('  [ ] 设备列表查询返回数据');
}

runTests().catch(console.error);