/**
 * 居民清单下载接口
 * POST /getPersonList
 * 
 * 请求参数：
 * - sn: 设备序列号
 * - lastUpdate: yyyyMMddHHmmss，设备端居民数据最后更新时间
 * 
 * 响应：
 * - persons: 数组，结构同「居民上传」的person对象（无status/health_doc字段）
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

router.post('/', async (req, res) => {
  try {
    const { sn, lastUpdate } = req.body;

    // sn 参数可选，用于设备端标识，不影响查询逻辑
    let persons;

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

      // 查询更新时间大于lastUpdate的居民
      persons = await dbAsync.all(
        `SELECT idcard, health_card, name, gender, date_of_birth, addr, phone, nation,
                record_way, create_time, update_time, create_doctor, update_doctor, avatar
         FROM persons 
         WHERE status = 1 AND (update_time > ? OR created_at > ?)
         ORDER BY update_time DESC`,
        [lastUpdateTimestamp, lastUpdateTimestamp]
      );
    } else {
      // 查询所有可用居民（不包含status=0的删除记录）
      persons = await dbAsync.all(
        `SELECT idcard, health_card, name, gender, date_of_birth, addr, phone, nation,
                record_way, create_time, update_time, create_doctor, update_doctor, avatar
         FROM persons 
         WHERE status = 1
         ORDER BY created_at DESC`
      );
    }

    res.json({
      ret: 0,
      error_msg: '',
      persons: persons || []
    });

  } catch (error) {
    console.error('Get person list error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Get person list failed',
      persons: []
    });
  }
});

module.exports = router;