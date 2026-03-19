# 健康随访包IoT平台 - 测试报告

**文档日期**: 2026-03-20  
**版本**: v1.0  
**服务器**: 120.24.31.251 (阿里云CentOS 8)  

---

## 📋 目录

1. [测试环境](#1-测试环境)
2. [测试样例](#2-测试样例)
3. [Bug记录与修复](#3-bug记录与修复)
4. [接口调用示例](#4-接口调用示例)
5. [测试脚本汇总](#5-测试脚本汇总)

---

## 1. 测试环境

### 1.1 服务器配置
```
IP: 120.24.31.251
系统: CentOS Linux 8 (已停止维护)
Node.js: v14.15.2
PM2: v6.0.14 (内存版 v4.5.4)
数据库: SQLite3
防火墙: firewalld
```

### 1.2 项目路径
```
部署目录: /opt/health-followup-platform/
后端代码: /opt/health-followup-platform/backend/
前端代码: /opt/health-followup-platform/frontend/
数据库:   /opt/health-followup-platform/backend/database/health_followup.db
上传文件: /opt/health-followup-platform/backend/uploads/
```

### 1.3 访问地址
- 前端页面: http://120.24.31.251:3000
- 后端API: http://120.24.31.251:3000/health
- 宝塔面板: https://120.24.31.251:28393/e572e1e6

---

## 2. 测试样例

### 2.1 设备注册测试

#### 请求
```bash
curl -X POST http://120.24.31.251:3000/device \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "model": "M100",
    "version": "1.0.0"
  }'
```

#### 响应
```json
{
  "ret": 0,
  "error_msg": "",
  "data": {
    "id": 1,
    "sn": "TEST001",
    "status": "registered"
  }
}
```

#### 验证
```bash
curl http://120.24.31.251:3000/device?sn=TEST001
```

---

### 2.2 医生数据测试

#### 批量上传
```bash
curl -X POST http://120.24.31.251:3000/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "doctors": [
      {
        "idcard": "110101199001011234",
        "name": "张医生",
        "phone": "13800138001",
        "hospital": "测试医院",
        "department": "内科"
      }
    ]
  }'
```

#### 批量下载
```bash
curl -X POST http://120.24.31.251:3000/getDoctorList \
  -H "Content-Type: application/json" \
  -d '{"sn": "TEST001"}'
```

---

### 2.3 居民数据测试

#### 批量上传
```bash
curl -X POST http://120.24.31.251:3000/person \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "persons": [
      {
        "idcard": "110101199001011239",
        "name": "王五",
        "phone": "13800138002",
        "gender": "男",
        "birthday": "1990-01-01"
      }
    ]
  }'
```

#### 批量下载
```bash
curl -X POST http://120.24.31.251:3000/getPersonList \
  -H "Content-Type: application/json" \
  -d '{"sn": "TEST001"}'
```

---

### 2.4 体检数据测试

#### 血压 (type: 1)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 1,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"sp\":120,\"dp\":80,\"pulse\":72}",
        "time": 1700000000
      },
      {
        "type": 1,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"sp\":180,\"dp\":110,\"pulse\":85}",
        "time": 1700000100
      }
    ]
  }'
```

#### 血糖 (type: 2)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 2,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":5.8}",
        "time": 1700000000
      },
      {
        "type": 2,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":6.2}",
        "time": 1700000100
      }
    ]
  }'
```

#### 体温 (type: 4)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 4,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":36.8}",
        "time": 1700000000
      }
    ]
  }'
```

#### 血氧 (type: 5)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 5,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":97}",
        "time": 1700000000
      }
    ]
  }'
```

#### 尿酸 (type: 7)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 7,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":420}",
        "time": 1700000000
      }
    ]
  }'
```

#### 血脂 (type: 9)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 9,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"tc\":5.2,\"tg\":1.8,\"hdl\":1.1,\"ldl\":3.2}",
        "time": 1700000000
      }
    ]
  }'
```

#### 胆固醇 (type: 8)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 8,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":5.8}",
        "time": 1700000000
      }
    ]
  }'
```

#### 糖化血红蛋白 (type: 20)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 20,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":6.5}",
        "time": 1700000000
      }
    ]
  }'
```

#### 血红蛋白 (type: 22)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 22,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"value\":145}",
        "time": 1700000000
      }
    ]
  }'
```

#### 尿常规 (type: 6)
```bash
curl -X POST http://120.24.31.251:3000/checkup \
  -H "Content-Type: application/json" \
  -d '{
    "sn": "TEST001",
    "checkups": [
      {
        "type": 6,
        "person": "110101199001011239",
        "doctor": "110101199001011234",
        "value": "{\"ph\":6.5,\"protein\":\"阴性\",\"glucose\":\"阴性\",\"ketone\":\"阴性\"}",
        "time": 1700000000
      }
    ]
  }'
```

#### 查询体检数据
```bash
curl "http://120.24.31.251:3000/checkup?person=110101199001011239"
```

---

### 2.5 文件上传测试

#### 心电图片上传 (POST /ecg)
```bash
curl -X POST http://120.24.31.251:3000/ecg \
  -F "sn=TEST001" \
  -F "person=110101199001011239" \
  -F "doctor=110101199001011234" \
  -F "time=1700000000" \
  -F "file=@test_ecg.png"
```

#### B超上传 (POST /1004)
```bash
curl -X POST http://120.24.31.251:3000/1004 \
  -F "sn=TEST001" \
  -F "person=110101199001011239" \
  -F "doctor=110101199001011234" \
  -F "time=1700000000" \
  -F "file=@test_ultrasound.png"
```

---

## 3. Bug记录与修复

### Bug 1: 数据库路径硬编码

**现象**: SQLite数据库文件在服务器上无法创建

**原因**: 代码中使用的是WSL本地绝对路径
```javascript
// 错误代码
const DB_PATH = '/home/dangkang/.openclaw/workspace-tech/projects/.../health_followup.db';
```

**修复**: 改为相对路径
```javascript
// 正确代码
const DB_PATH = path.join(__dirname, '../database/health_followup.db');
```

**文件**: `/opt/health-followup-platform/backend/models/database.js`

---

### Bug 2: 数据库文件未生成

**现象**: `SQLITE_CANTOPEN: unable to open database file`

**原因**: 数据库目录不存在，SQLite无法自动创建文件

**修复**:
```bash
# 1. 创建数据库目录
mkdir -p /opt/health-followup-platform/backend/database

# 2. 创建空数据库文件
touch /opt/health-followup-platform/backend/database/health_followup.db

# 3. 设置权限
chmod 755 /opt/health-followup-platform/backend/database
chmod 644 /opt/health-followup-platform/backend/database/health_followup.db
```

---

### Bug 3: 外部端口不通

**现象**: 本地curl正常，外部无法访问3000端口

**原因**: firewalld未开放3000端口（iptables已放行但firewalld优先）

**修复**:
```bash
# 开放3000端口
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# 验证
firewall-cmd --list-ports
```

---

### Bug 4: server.js为空

**现象**: 服务启动失败，PM2状态为errored

**原因**: 部署过程中server.js文件被覆盖为空文件

**修复**: 重新上传完整的server.js文件
```bash
# 从本地重新上传
sftp root@120.24.31.251
put server-fixed.js /opt/health-followup-platform/backend/server.js

# 重启服务
pm2 restart health-api
```

---

### Bug 5: health路由缺失

**现象**: 访问 `/health` 返回404

**原因**: 缺少health.js路由文件

**修复**:
1. 创建 `/opt/health-followup-platform/backend/routes/health.js`
2. 在server.js中引入路由

```javascript
// health.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'health-followup-platform' });
});

module.exports = router;
```

---

### Bug 6: 前端API跨域问题

**现象**: 前端页面无法获取后端数据（CORS错误）

**原因**: 前端在GitHub Pages(HTTPS)，后端在阿里云(HTTP)，协议+域名都不同

**修复**: 将前端也部署到阿里云服务器，使用相对路径
```javascript
// 修改前
const API_URL = 'http://120.24.31.251:3000/checkup';

// 修改后
const API_URL = '/checkup';
```

**部署步骤**:
1. 上传前端文件到 `/opt/health-followup-platform/frontend/`
2. 在server.js中配置静态文件服务
3. 重启服务

---

### Bug 7: 数据库字段名错误

**现象**: `SQLITE_ERROR: no such column: updated_at`

**原因**: doctorSign.js中使用`updated_at`，但表结构是`update_time`

**修复**:
```javascript
// 错误
SET updated_at = CURRENT_TIMESTAMP

// 正确
SET update_time = CURRENT_TIMESTAMP
```

**文件**: `/opt/health-followup-platform/backend/routes/doctorSign.js`

---

### Bug 8: getDoctorList/getPersonList 缺少sn参数报错

**现象**: 不传入sn参数时接口返回错误

**修复**: 将sn参数改为可选

```javascript
// 修改前 - 必须传sn
const { sn } = req.body;
const doctors = db.getDoctorsByDevice(sn);

// 修改后 - sn可选
const { sn } = req.body;
const doctors = sn ? db.getDoctorsByDevice(sn) : db.getAllDoctors();
```

**文件**: 
- `/opt/health-followup-platform/backend/routes/getDoctorList.js`
- `/opt/health-followup-platform/backend/routes/getPersonList.js`

---

## 4. 接口调用示例

### 4.1 完整流程测试

```bash
#!/bin/bash

BASE_URL="http://120.24.31.251:3000"

echo "1. 健康检查"
curl -s "$BASE_URL/health" | jq .

echo -e "\n2. 设备注册"
curl -s -X POST "$BASE_URL/device" \
  -H "Content-Type: application/json" \
  -d '{"sn":"TEST001","model":"M100"}' | jq .

echo -e "\n3. 上传医生"
curl -s -X POST "$BASE_URL/doctor" \
  -H "Content-Type: application/json" \
  -d '{
    "sn":"TEST001",
    "doctors":[{"idcard":"110101199001011234","name":"张医生","hospital":"测试医院"}]
  }' | jq .

echo -e "\n4. 上传居民"
curl -s -X POST "$BASE_URL/person" \
  -H "Content-Type: application/json" \
  -d '{
    "sn":"TEST001",
    "persons":[{"idcard":"110101199001011239","name":"王五","gender":"男"}]
  }' | jq .

echo -e "\n5. 上传血压"
curl -s -X POST "$BASE_URL/checkup" \
  -H "Content-Type: application/json" \
  -d '{
    "sn":"TEST001",
    "checkups":[{
      "type":1,
      "person":"110101199001011239",
      "doctor":"110101199001011234",
      "value":"{\"sp\":120,\"dp\":80,\"pulse\":72}",
      "time":1700000000
    }]
  }' | jq .

echo -e "\n6. 查询数据"
curl -s "$BASE_URL/checkup?person=110101199001011239" | jq .
```

---

## 5. 测试脚本汇总

### 本地脚本位置
```
/home/dangkang/.openclaw/workspace-tech/
├── test-bp.js              # 血压测试
├── test-bp-correct.js      # 正确格式血压测试
├── test-bp-180.js          # 高血压测试
├── test-more-types.js      # 多种检测类型测试
├── test-all-api.js         # 全接口测试
├── test-device-api.js      # 设备API测试
├── test-stage2.js          # 阶段2测试
├── test-stage3.js          # 阶段3测试
├── test-stage4.sh          # 阶段4测试
└── full-regression-test.js # 回归测试
```

### 服务器端脚本位置
```
/opt/health-followup-platform/backend/test/
├── test-api.js
└── test-data.js
```

### PM2常用命令
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs health-api

# 重启服务
pm2 restart health-api

# 停止服务
pm2 stop health-api

# 开机自启
pm2 startup
pm2 save
```

---

## 附录：检测类型对照表

| Type | 检测项目 | value字段格式 |
|------|---------|--------------|
| 1 | 无创血压 | `{"sp":120,"dp":80,"pulse":72}` |
| 2 | 血糖 | `{"value":5.8}` |
| 4 | 体温 | `{"value":36.8}` |
| 5 | 血氧 | `{"value":97}` |
| 6 | 尿常规 | `{"ph":6.5,"protein":"阴性"...}` |
| 7 | 尿酸 | `{"value":420}` |
| 8 | 胆固醇 | `{"value":5.8}` |
| 9 | 血脂 | `{"tc":5.2,"tg":1.8,"hdl":1.1,"ldl":3.2}` |
| 20 | 糖化血红蛋白 | `{"value":6.5}` |
| 22 | 血红蛋白 | `{"value":145}` |
| 1004 | B超 | 文件上传 |

---

**文档维护**: 如有新的bug或测试样例，请更新此文档
