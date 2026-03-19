/**
 * 居民上传接口
 * POST /person - 批量上传
 * 
 * 协议要点：
 * - persons 数组批量上传
 * - idcard 是唯一标识
 * - status: 1=可用/0=删除
 * - health_doc: JSON对象，居民健康档案
 * - create_doctor/update_doctor: 创建/修改医生身份证号
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

router.post('/', async (req, res) => {
  try {
    const { device_id, sn, version, timestamp, persons } = req.body;

    // 参数校验
    if (!persons || !Array.isArray(persons) || persons.length === 0) {
      return res.json({
        ret: -1,
        error_msg: 'Missing or invalid persons array'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 批量处理居民数据
    for (const person of persons) {
      try {
        const {
          idcard,
          health_card,
          name,
          gender,
          date_of_birth,
          addr,
          phone,
          nation,
          status = 1,
          record_way = 1,
          health_doc,
          create_time,
          update_time,
          create_doctor,
          update_doctor,
          avatar
        } = person;

        // 必填字段校验
        if (!idcard || !name) {
          results.failed++;
          results.errors.push({ idcard, error: 'Missing required fields: idcard or name' });
          continue;
        }

        // health_doc 转 JSON 字符串
        const healthDocStr = health_doc ? JSON.stringify(health_doc) : null;

        // 检查居民是否已存在
        const existing = await dbAsync.get(
          'SELECT id FROM persons WHERE idcard = ?',
          [idcard]
        );

        if (existing) {
          // 更新居民信息
          await dbAsync.run(
            `UPDATE persons SET 
              health_card = ?, name = ?, gender = ?, date_of_birth = ?, addr = ?, phone = ?,
              nation = ?, status = ?, record_way = ?, health_doc = ?, update_time = ?,
              update_doctor = ?, avatar = ?
            WHERE idcard = ?`,
            [health_card, name, gender, date_of_birth, addr, phone, nation, status, 
             record_way, healthDocStr, update_time, update_doctor, avatar, idcard]
          );
        } else {
          // 插入新居民
          await dbAsync.run(
            `INSERT INTO persons 
            (idcard, health_card, name, gender, date_of_birth, addr, phone, nation, 
             status, record_way, health_doc, create_time, update_time, create_doctor, update_doctor, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [idcard, health_card, name, gender, date_of_birth, addr, phone, nation,
             status, record_way, healthDocStr, create_time, update_time, create_doctor, update_doctor, avatar]
          );
        }

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ idcard: person.idcard, error: err.message });
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
    console.error('Person upload error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Person upload failed'
    });
  }
});

// GET /person - 查询居民列表（调试用）
router.get('/', async (req, res) => {
  try {
    const persons = await dbAsync.all(
      `SELECT id, idcard, health_card, name, gender, phone, nation, status, 
              record_way, create_doctor, update_doctor, create_time, update_time 
       FROM persons ORDER BY created_at DESC`
    );
    res.json({
      ret: 0,
      error_msg: '',
      data: persons
    });
  } catch (error) {
    res.json({ ret: -1, error_msg: error.message });
  }
});

module.exports = router;