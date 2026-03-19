/**
 * API 测试脚本 - 阶段3：体检数据上传接口验证
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Health Followup API - Stage 3 Tests\n');
  console.log('='.repeat(60));

  const personId = '110101195001011111'; // 张大爷
  const doctorId = '110101199001011234'; // 王医生
  const now = Math.floor(Date.now() / 1000);

  // Test 1: 无创血压 (Type 1)
  console.log('\n1️⃣ 测试无创血压上传 (Type 1)');
  const bpData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [{
      type: 1,
      person: personId,
      doctor: doctorId,
      value: { sp: 120, dp: 80 },
      time: now
    }]
  };
  const bpResult = await request('/checkup', 'POST', bpData);
  console.log('Response:', JSON.stringify(bpResult, null, 2));

  // Test 2: 血糖 (Type 2)
  console.log('\n2️⃣ 测试血糖上传 (Type 2)');
  const gluData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [{
      type: 2,
      person: personId,
      doctor: doctorId,
      value: { mode: 1, glu: 5.8 },
      time: now
    }]
  };
  const gluResult = await request('/checkup', 'POST', gluData);
  console.log('Response:', JSON.stringify(gluResult, null, 2));

  // Test 3: 体温 (Type 4)
  console.log('\n3️⃣ 测试体温上传 (Type 4)');
  const tempData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [{
      type: 4,
      person: personId,
      doctor: doctorId,
      value: { temp: 36.5 },
      time: now
    }]
  };
  const tempResult = await request('/checkup', 'POST', tempData);
  console.log('Response:', JSON.stringify(tempResult, null, 2));

  // Test 4: 血氧饱和度 (Type 5)
  console.log('\n4️⃣ 测试血氧饱和度上传 (Type 5)');
  const spoData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [{
      type: 5,
      person: personId,
      doctor: doctorId,
      value: { spo: 98, pr: 72 },
      time: now
    }]
  };
  const spoResult = await request('/checkup', 'POST', spoData);
  console.log('Response:', JSON.stringify(spoResult, null, 2));

  // Test 5: 尿常规 (Type 6)
  console.log('\n5️⃣ 测试尿常规上传 (Type 6)');
  const urineData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [{
      type: 6,
      person: personId,
      doctor: doctorId,
      value: {
        ph: '6.0',
        nit: '-',
        pro: '-',
        glu: '-',
        bil: '-',
        ubg: '-',
        ket: '-',
        sg: '1.020',
        leu: '-',
        vc: '0',
        bld: '-'
      },
      time: now
    }]
  };
  const urineResult = await request('/checkup', 'POST', urineData);
  console.log('Response:', JSON.stringify(urineResult, null, 2));

  // Test 6: 批量混合上传（多种检测类型）
  console.log('\n6️⃣ 测试批量混合上传（5种检测同时上传）');
  const batchData = {
    device_id: 'DEV001',
    sn: 'SN2024001',
    version: 197,
    timestamp: now,
    checkups: [
      { type: 7, person: personId, doctor: doctorId, value: { ua: 350 }, time: now },
      { type: 8, person: personId, doctor: doctorId, value: { chol: 4.5 }, time: now },
      { type: 20, person: personId, doctor: doctorId, value: { hba1c: 6.2 }, time: now },
      { type: 22, person: personId, doctor: doctorId, value: { hb: 145 }, time: now },
      { type: 14, person: personId, doctor: doctorId, value: { constitution: '气虚质' }, time: now }
    ]
  };
  const batchResult = await request('/checkup', 'POST', batchData);
  console.log('Response:', JSON.stringify(batchResult, null, 2));

  // Test 7: 查询体检数据
  console.log('\n7️⃣ 查询体检数据列表');
  const listResult = await request('/checkup');
  console.log('Total checkups:', listResult.data?.length || 0);
  console.log('Data preview:');
  listResult.data?.forEach((c, i) => {
    console.log(`  [${i+1}] ${c.type_name} (Type${c.type}):`, JSON.stringify(c.value));
  });

  // Test 8: 按居民查询
  console.log('\n8️⃣ 按居民查询体检数据');
  const personResult = await request(`/checkup?person=${personId}`);
  console.log(`Found ${personResult.data?.length || 0} records for ${personId}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ 阶段3测试完成！');
  console.log('\n📋 验证清单：');
  console.log('  [ ] 血压上传返回 ret: 0');
  console.log('  [ ] 血糖上传返回 ret: 0');
  console.log('  [ ] 体温上传返回 ret: 0');
  console.log('  [ ] 血氧上传返回 ret: 0');
  console.log('  [ ] 尿常规上传返回 ret: 0');
  console.log('  [ ] 批量混合上传返回 ret: 0');
  console.log('  [ ] 体检数据列表查询返回数据');
}

runTests().catch(console.error);