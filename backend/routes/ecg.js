/**
 * 12导联心电上传接口
 * POST /ecg - 单条上传，multipart/form-data
 * 
 * 协议要点：
 * - 请求方式：POST multipart/form-data
 * - 上传附件键名：uploadFile
 * - 所需字段：device_id, sn, version, person, doctor, time
 * - 文件格式：实际接收PNG图片（协议写PDF但实际是PNG）
 * - 文件保存：服务器保存后返回文件路径
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { dbAsync } = require('../models/database');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'ecg');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `ecg_${req.body.person}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});

router.post('/', upload.single('uploadFile'), async (req, res) => {
  try {
    console.log('[ECG] Upload request received');
    console.log('[ECG] Body:', req.body);
    console.log('[ECG] File:', req.file);

    const { device_id, sn, version, person, doctor, time } = req.body;

    // 参数校验
    if (!person || !time) {
      return res.json({
        ret: -1,
        error_msg: 'Missing required fields: person or time'
      });
    }

    // 文件校验
    if (!req.file) {
      return res.json({
        ret: -1,
        error_msg: 'No file uploaded (expected field: uploadFile)'
      });
    }

    // 保存记录到数据库
    const filePath = `/uploads/ecg/${req.file.filename}`;
    const now = Math.floor(Date.now() / 1000);

    await dbAsync.run(
      `INSERT INTO ecg_records (person_idcard, doctor_idcard, file_path, file_name, upload_time, device_sn) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [person, doctor || null, filePath, req.file.filename, parseInt(time) || now, sn || device_id]
    );

    console.log('[ECG] Saved to database:', filePath);

    res.json({
      ret: 0,
      error_msg: ''
    });

  } catch (error) {
    console.error('[ECG] Upload error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'ECG upload failed'
    });
  }
});

// GET /ecg - 查询心电记录（调试用）
router.get('/', async (req, res) => {
  try {
    const { person } = req.query;
    let sql = 'SELECT * FROM ecg_records';
    const params = [];

    if (person) {
      sql += ' WHERE person_idcard = ?';
      params.push(person);
    }
    sql += ' ORDER BY upload_time DESC LIMIT 50';

    const records = await dbAsync.all(sql, params);
    res.json({
      ret: 0,
      error_msg: '',
      data: records
    });
  } catch (error) {
    res.json({ ret: -1, error_msg: error.message });
  }
});

module.exports = router;
