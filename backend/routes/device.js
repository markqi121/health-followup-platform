/**
 * 设备注册接口
 * POST /device
 * 
 * 协议规范：
 * - 设备每次开机发起请求
 * - 机构变更时返回错误，设备将清除本地所有医生/患者数据
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

// POST /device - 设备注册
router.post('/', async (req, res) => {
  try {
    const {
      device_id,
      sn,
      version,
      timestamp,
      register_time,
      contact,
      contact_phone,
      org_name
    } = req.body;

    // 参数校验
    if (!sn) {
      return res.json({
        ret: -1,
        error_msg: 'Missing required field: sn'
      });
    }

    // 检查设备是否已存在
    const existingDevice = await dbAsync.get(
      'SELECT * FROM devices WHERE sn = ?',
      [sn]
    );

    let orgChanged = false;
    let oldOrgId = null;

    if (existingDevice) {
      // 设备已存在，检查机构是否变更
      oldOrgId = existingDevice.org_id;
      if (org_name && existingDevice.org_name !== org_name) {
        orgChanged = true;
      }

      // 更新设备信息
      await dbAsync.run(
        `UPDATE devices SET 
          device_id = ?, version = ?, register_time = ?, 
          contact = ?, contact_phone = ?, org_name = ?,
          updated_at = strftime('%s', 'now')
        WHERE sn = ?`,
        [device_id, version, register_time, contact, contact_phone, org_name, sn]
      );
    } else {
      // 新设备注册
      await dbAsync.run(
        `INSERT INTO devices 
        (device_id, sn, version, register_time, contact, contact_phone, org_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [device_id, sn, version, register_time, contact, contact_phone, org_name]
      );
    }

    // 返回响应
    if (orgChanged) {
      // 机构变更，返回类型2响应
      res.json({
        ret: -2,
        error_msg: 'Organization changed, please clear local data',
        data: {
          org_id: oldOrgId || '',
          org_name: existingDevice?.org_name || ''
        }
      });
    } else {
      // 简单成功响应
      res.json({
        ret: 0,
        error_msg: ''
      });
    }

  } catch (error) {
    console.error('Device registration error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Registration failed'
    });
  }
});

// GET /device - 查询已注册设备列表（调试用）
router.get('/', async (req, res) => {
  try {
    const devices = await dbAsync.all(
      'SELECT * FROM devices ORDER BY created_at DESC'
    );
    res.json({
      ret: 0,
      error_msg: '',
      data: devices
    });
  } catch (error) {
    res.json({
      ret: -1,
      error_msg: error.message
    });
  }
});

module.exports = router;