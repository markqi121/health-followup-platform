/**
 * 医生数据上传接口
 * POST /doctor - 批量上传
 * 
 * 协议要点：
 * - doctors 数组批量上传
 * - idcard 是唯一标识
 * - status: 1=可用/0=禁用
 * - record_way: 0=刷卡录入/1=手工输入
 * - gender: 1=男/2=女
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

router.post('/', async (req, res) => {
  try {
    const { device_id, sn, version, timestamp, doctors } = req.body;

    // 参数校验
    if (!doctors || !Array.isArray(doctors) || doctors.length === 0) {
      return res.json({
        ret: -1,
        error_msg: 'Missing or invalid doctors array'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 批量处理医生数据
    for (const doctor of doctors) {
      try {
        const {
          idcard,
          name,
          gender,
          date_of_birth,
          addr,
          phone,
          status = 1,
          record_way = 1,
          create_time,
          update_time,
          avatar
        } = doctor;

        // 必填字段校验
        if (!idcard || !name) {
          results.failed++;
          results.errors.push({ idcard, error: 'Missing required fields: idcard or name' });
          continue;
        }

        // 检查医生是否已存在
        const existing = await dbAsync.get(
          'SELECT id FROM doctors WHERE idcard = ?',
          [idcard]
        );

        if (existing) {
          // 更新医生信息
          await dbAsync.run(
            `UPDATE doctors SET 
              name = ?, gender = ?, date_of_birth = ?, addr = ?, phone = ?,
              status = ?, record_way = ?, update_time = ?, avatar = ?
            WHERE idcard = ?`,
            [name, gender, date_of_birth, addr, phone, status, record_way, update_time, avatar, idcard]
          );
        } else {
          // 插入新医生
          await dbAsync.run(
            `INSERT INTO doctors 
            (idcard, name, gender, date_of_birth, addr, phone, status, record_way, create_time, update_time, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [idcard, name, gender, date_of_birth, addr, phone, status, record_way, create_time, update_time, avatar]
          );
        }

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ idcard: doctor.idcard, error: err.message });
      }
    }

    // 返回结果
    if (results.failed === 0) {
      res.json({ ret: 0, error_msg: '' });
    } else {
      res.json({
        ret: -1,
        error_msg: `Batch upload partial failed: ${results.success} success, ${results.failed} failed`,
        details: results.errors
      });
    }

  } catch (error) {
    console.error('Doctor upload error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Doctor upload failed'
    });
  }
});

// GET /doctor - 查询医生列表（调试用）
router.get('/', async (req, res) => {
  try {
    const doctors = await dbAsync.all(
      'SELECT id, idcard, name, gender, phone, status, record_way, create_time, update_time FROM doctors ORDER BY created_at DESC'
    );
    res.json({
      ret: 0,
      error_msg: '',
      data: doctors
    });
  } catch (error) {
    res.json({ ret: -1, error_msg: error.message });
  }
});

module.exports = router;