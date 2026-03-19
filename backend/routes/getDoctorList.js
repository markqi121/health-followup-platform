/**
 * 医生批量下载接口
 * POST /getDoctorList
 * 
 * 请求参数：
 * - sn: 设备序列号
 * - lastUpdate: yyyyMMddHHmmss，设备端医生数据最后更新时间
 * 
 * 响应：
 * - doctors: 数组，结构同「医生数据上传」的doctor对象
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

router.post('/', async (req, res) => {
  try {
    const { sn, lastUpdate } = req.body;

    // 参数校验
    if (!sn) {
      return res.json({
        ret: -1,
        error_msg: 'Missing required field: sn'
      });
    }

    let doctors;

    if (lastUpdate) {
      // 转换时间格式：yyyyMMddHHmmss -> Unix timestamp
      const year = lastUpdate.substring(0, 4);
      const month = lastUpdate.substring(4, 6);
      const day = lastUpdate.substring(6, 8);
      const hour = lastUpdate.substring(8, 10);
      const minute = lastUpdate.substring(10, 12);
      const second = lastUpdate.substring(12, 14);
      
      const lastUpdateDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      const lastUpdateTimestamp = Math.floor(lastUpdateDate.getTime() / 1000);

      // 查询更新时间大于lastUpdate的医生
      doctors = await dbAsync.all(
        `SELECT idcard, name, gender, date_of_birth, addr, phone, 
                status, record_way, create_time, update_time, avatar
         FROM doctors 
         WHERE update_time > ? OR created_at > ?
         ORDER BY update_time DESC`,
        [lastUpdateTimestamp, lastUpdateTimestamp]
      );
    } else {
      // 查询所有医生
      doctors = await dbAsync.all(
        `SELECT idcard, name, gender, date_of_birth, addr, phone, 
                status, record_way, create_time, update_time, avatar
         FROM doctors 
         ORDER BY created_at DESC`
      );
    }

    res.json({
      ret: 0,
      error_msg: '',
      doctors: doctors || []
    });

  } catch (error) {
    console.error('Get doctor list error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Get doctor list failed',
      doctors: []
    });
  }
});

module.exports = router;