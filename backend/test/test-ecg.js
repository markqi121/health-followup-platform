/**
 * 阶段4测试 - 心电上传接口验证
 * 
 * 测试步骤：
 * 1. 创建一个测试用的PNG文件
 * 2. 使用multipart/form-data格式上传
 * 3. 验证返回结果
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'localhost';
const PORT = 3000;

// 创建一个简单的测试PNG文件（1x1像素的透明PNG）
const testPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const testPngBuffer = Buffer.from(testPngBase64, 'base64');
const testFilePath = path.join(__dirname, 'test_ecg.png');

function createTestFile() {
  fs.writeFileSync(testFilePath, testPngBuffer);
  console.log('✅ 测试文件创建成功:', testFilePath);
}

function buildMultipartRequest(boundary, fields, file) {
  let body = '';
  
  // 添加普通字段
  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }
  
  // 添加文件
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\n`;
  body += `Content-Type: ${file.contentType}\r\n\r\n`;
  
  const bodyBuffer = Buffer.concat([
    Buffer.from(body),
    file.buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);
  
  return bodyBuffer;
}

async function testEcgUpload() {
  console.log('🧪 阶段4测试 - 心电上传接口\n');
  console.log('='.repeat(60));

  try {
    // 创建测试文件
    createTestFile();

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const fields = {
      device_id: 'DEV001',
      sn: 'SN2024001',
      version: '197',
      person: '110101195001011111', // 张大爷
      doctor: '110101199001011234', // 王医生
      time: String(Math.floor(Date.now() / 1000))
    };

    const file = {
      fieldname: 'uploadFile',
      filename: 'ecg_test.png',
      contentType: 'image/png',
      buffer: fs.readFileSync(testFilePath)
    };

    const body = buildMultipartRequest(boundary, fields, file);

    console.log('\n1️⃣ 测试心电文件上传...');
    console.log('Fields:', fields);

    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/ecg',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });

    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.ret === 0) {
      console.log('✅ 心电上传成功！');
      
      // 查询记录
      console.log('\n2️⃣ 查询心电记录...');
      const queryResult = await new Promise((resolve) => {
        http.get(`http://${BASE_URL}:${PORT}/ecg?person=${fields.person}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(data);
            }
          });
        });
      });
      
      console.log('Query result:', JSON.stringify(queryResult.data || queryResult, null, 2));
    } else {
      console.log('❌ 心电上传失败:', result.error_msg);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n✅ 测试文件已清理');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 验证清单：');
  console.log('  [ ] 心电文件上传返回 ret: 0');
  console.log('  [ ] 文件保存到 uploads/ecg/ 目录');
  console.log('  [ ] 数据库记录查询返回数据');
}

testEcgUpload();
