/**
 * 健康随访包数据接入平台 - 后端服务
 * Health Followup Platform Backend
 * 
 * 阶段1: 基础框架 + 设备注册接口
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// 初始化数据库
const db = require('./models/database');

// 路由导入
const deviceRoutes = require('./routes/device');
const doctorRoutes = require('./routes/doctor');
const personRoutes = require('./routes/person');
const checkupRoutes = require('./routes/checkup');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件（用于上传的心电/B超文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Math.floor(Date.now() / 1000),
    version: '1.0.0'
  });
});

// API 路由 - 按协议规范直接拼接到基础URL
app.use('/device', deviceRoutes);
app.use('/doctor', doctorRoutes);
app.use('/doctorSign', require('./routes/doctorSign'));
app.use('/getDoctorList', require('./routes/getDoctorList'));
app.use('/doctorLogin', require('./routes/doctorLogin'));
app.use('/person', personRoutes);
app.use('/getPersonList', require('./routes/getPersonList'));
app.use('/checkup', checkupRoutes);
app.use('/ecg', require('./routes/ecg'));
app.use('/1004', require('./routes/b ultrasound'));
app.use('/report', reportRoutes);
app.use('/regist', require('./routes/regist'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    ret: -1,
    error_msg: err.message || 'Internal Server Error'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    ret: -1,
    error_msg: 'API Not Found'
  });
});

// 启动服务（测试环境不启动）
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Health Followup Platform Server`);
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`📝 API Base URL: http://localhost:${PORT}`);
    console.log(`💾 Database: SQLite (health_followup.db)`);
    console.log(`\nTest with: curl http://localhost:${PORT}/health`);
  });
}

module.exports = app;