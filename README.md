# Health Followup Platform

健康随访包物联网数据展示平台 - 基于随访包通讯协议 v1.9.7

## 🚀 在线访问

- **前端页面**: https://markqi121.github.io/health-followup-platform/
- **后端API**: http://120.24.31.251:3000
- **健康检查**: http://120.24.31.251:3000/health

## 📁 项目结构

```
health-followup-platform/
├── backend/          # Node.js + Express 后端
│   ├── server.js     # 主服务入口
│   ├── models/       # 数据库模型
│   ├── routes/       # API 路由
│   └── uploads/      # 上传文件存储
├── frontend/         # React 前端
│   └── dist/         # 构建输出
├── database/         # 数据库文件
└── docs/             # 协议文档
```

## 🛠️ 技术栈

- **后端**: Node.js + Express + SQLite
- **前端**: React + Vite + Tailwind CSS
- **协议**: HTTP/JSON 随访包数据接口 v1.9.7

## 📡 已实现接口

| 接口 | 功能 | 状态 |
|------|------|------|
| POST /device | 设备注册 | ✅ |
| POST /doctor | 医生批量上传 | ✅ |
| POST /doctorSign | 医生签名单条上传 | ✅ |
| POST /getDoctorList | 医生批量下载 | ✅ |
| POST /person | 居民批量上传 | ✅ |
| POST /getPersonList | 居民批量下载 | ✅ |
| POST /checkup | 体检数据批量上传 | ✅ |
| POST /ecg | 12导联心电上传 | ✅ |
| POST /1004 | B超上传 | ✅ |
| POST /report | 健康报告上传 | 🚧 |
| POST /regist | 现场图上传 | 🚧 |

## 🚀 本地开发

### 启动后端
```bash
cd backend
npm install
npm start
# 服务运行在 http://localhost:3000
```

### 启动前端
```bash
cd frontend
cd dist
python3 -m http.server 5173
# 页面在 http://localhost:5173
```

## 📊 支持的检测类型

- 🩺 无创血压 (Type 1)
- 🩸 血糖 (Type 2)
- 🌡️ 体温 (Type 4)
- 💨 血氧 (Type 5)
- 🧪 尿常规 (Type 6)
- 🧪 尿酸 (Type 7)
- 🧪 胆固醇 (Type 8)
- 🧪 血脂 (Type 9)
- 🩸 糖化血红蛋白 (Type 20)
- 🩸 血红蛋白 (Type 22)
- 🧪 血生化 (Type 33)
- 📈 12导联心电 (Type 1001)
- 🔍 B超 (Type 1004)

## 📄 协议文档

基于《2_随访包与平台通讯数据接口规范V1.9.7》

## 📦 部署

### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署后端
vercel --prod

# 部署前端
vercel --prod
```

## 📝 License

MIT
