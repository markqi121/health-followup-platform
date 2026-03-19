/**
 * API 测试脚本 - 阶段2：医生/居民管理接口验证
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
  console.log('🧪 Health Followup API - Stage 2 Tests\n');
  console.log('='.repeat(60));

  // Test 1: 批量上传医生
  console.log('\n1️⃣ 测试医生数据上传（批量）');
  const doctorsData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: Math.floor(Date.now() / 1000),
    doctors: [
      {
        idcard: '110101199001011234',
        name: '王医生',
        gender: 1,
        date_of_birth: '1990-01-01',
        addr: '北京市朝阳区',
        phone: '13800138001',
        status: 1,
        record_way: 1,
        create_time: Math.floor(Date.now() / 1000) - 86400,
        update_time: Math.floor(Date.now() / 1000)
      },
      {
        idcard: '110101199502022345',
        name: '李医生',
        gender: 2,
        date_of_birth: '1995-02-02',
        addr: '北京市海淀区',
        phone: '13800138002',
        status: 1,
        record_way: 0,
        create_time: Math.floor(Date.now() / 1000) - 86400,
        update_time: Math.floor(Date.now() / 1000)
      }
    ]
  };
  const doctorResult = await request('/doctor', 'POST', doctorsData);
  console.log('Response:', JSON.stringify(doctorResult, null, 2));

  // Test 2: 查询医生列表
  console.log('\n2️⃣ 查询医生列表');
  const doctorList = await request('/doctor');
  console.log('Doctors count:', doctorList.data?.length || 0);
  console.log('First doctor:', JSON.stringify(doctorList.data?.[0], null, 2));

  // Test 3: 医生签名上传
  console.log('\n3️⃣ 测试医生签名上传');
  const signData = {
    sn: 'SN2024001',
    idcard: '110101199001011234',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };
  const signResult = await request('/doctorSign', 'POST', signData);
  console.log('Response:', JSON.stringify(signResult, null, 2));

  // Test 4: 医生批量下载
  console.log('\n4️⃣ 测试医生批量下载');
  const getDoctorData = {
    sn: 'SN2024001',
    lastUpdate: '20240101000000'  // 2024-01-01 00:00:00
  };
  const getDoctorResult = await request('/getDoctorList', 'POST', getDoctorData);
  console.log('Downloaded doctors:', getDoctorResult.doctors?.length || 0);
  console.log('Response:', JSON.stringify(getDoctorResult, null, 2));

  // Test 5: 批量上传居民
  console.log('\n5️⃣ 测试居民数据上传（批量）');
  const personsData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: Math.floor(Date.now() / 1000),
    persons: [
      {
        idcard: '110101195001011111',
        health_card: 'HC001',
        name: '张大爷',
        gender: 1,
        date_of_birth: '1950-01-01',
        addr: '北京市朝阳区XX街道',
        phone: '13900139001',
        nation: '汉族',
        status: 1,
        record_way: 1,
        health_doc: { hypertension: true, diabetes: false },
        create_time: Math.floor(Date.now() / 1000) - 86400,
        update_time: Math.floor(Date.now() / 1000),
        create_doctor: '110101199001011234',
        update_doctor: '110101199001011234'
      },
      {
        idcard: '110101196002022222',
        health_card: 'HC002',
        name: '王大妈',
        gender: 2,
        date_of_birth: '1960-02-02',
        addr: '北京市朝阳区YY街道',
        phone: '13900139002',
        nation: '汉族',
        status: 1,
        record_way: 0,
        health_doc: { hypertension: false, diabetes: true },
        create_time: Math.floor(Date.now() / 1000) - 86400,
        update_time: Math.floor(Date.now() / 1000),
        create_doctor: '110101199001011234',
        update_doctor: '110101199502022345'
      }
    ]
  };
  const personResult = await request('/person', 'POST', personsData);
  console.log('Response:', JSON.stringify(personResult, null, 2));

  // Test 6: 查询居民列表
  console.log('\n6️⃣ 查询居民列表');
  const personList = await request('/person');
  console.log('Persons count:', personList.data?.length || 0);
  console.log('First person:', JSON.stringify(personList.data?.[0], null, 2));

  // Test 7: 居民清单下载
  console.log('\n7️⃣ 测试居民清单下载');
  const getPersonData = {
    sn: 'SN2024001',
    lastUpdate: '20240101000000'
  };
  const getPersonResult = await request('/getPersonList', 'POST', getPersonData);
  console.log('Downloaded persons:', getPersonResult.persons?.length || 0);
  console.log('Response:', JSON.stringify(getPersonResult, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ 阶段2测试完成！');
  console.log('\n📋 验证清单：');
  console.log('  [ ] 医生批量上传返回 ret: 0');
  console.log('  [ ] 医生列表查询返回数据');
  console.log('  [ ] 医生签名上传返回 ret: 0');
  console.log('  [ ] 医生批量下载返回 doctors 数组');
  console.log('  [ ] 居民批量上传返回 ret: 0');
  console.log('  [ ] 居民列表查询返回数据');
  console.log('  [ ] 居民清单下载返回 persons 数组');
}

runTests().catch(console.error);