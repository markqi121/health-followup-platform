/**
 * 健康基础数据上传接口
 * POST /checkup - 批量上传
 * 
 * 协议要点：
 * - checkups 数组批量上传
 * - type 取值 1-34, 99, 100, 801, 802, 9110 等
 * - value 根据 type 不同有不同的结构
 * - 时间戳均为 UTC 秒级整数
 * 
 * 核心检测类型：
 * Type 1: 无创血压 {sp: 收缩压, dp: 舒张压}
 * Type 2: 血糖 {mode: 1/2, glu: 血糖值}
 * Type 4: 体温
 * Type 5: 血氧 {spo: 血氧, pr: 脉率}
 * Type 6: 尿常规
 * Type 7: 尿酸
 * Type 8: 总胆固醇
 * Type 9: 血脂
 * Type 20: 糖化血红蛋白 {hba1c: 值}
 * Type 22: 血红蛋白 {hb: 值}
 * ... 等34种类型
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

// 检测类型名称映射（用于日志和调试）
const CHECKUP_TYPE_NAMES = {
  1: '无创血压',
  2: '血糖',
  4: '体温',
  5: '血氧饱和度',
  6: '尿常规',
  7: '尿酸',
  8: '总胆固醇',
  9: '血脂',
  10: '胎心率',
  11: '腰臀比',
  13: '肺功能',
  14: '中医体质',
  16: '竹信单导心电',
  17: '体成分(类型17)',
  18: '健康风险报告',
  19: '手持脂肪仪',
  20: '糖化血红蛋白',
  22: '血红蛋白',
  24: '星康单导心电',
  25: 'GDS检测',
  26: 'SAS检测',
  27: 'SDS检测',
  28: 'PSQI检测',
  29: '体成分(类型29)',
  30: '左右手血压检测',
  31: '视力',
  32: '心电图(蓝牙)',
  33: '血生化',
  34: '贝雅测距',
  99: '体检报告',
  100: '家医签约',
  801: '高血压随访',
  802: '糖尿病随访',
  9110: '健康体检表'
};

router.post('/', async (req, res) => {
  try {
    const { device_id, sn, version, timestamp, checkups } = req.body;

    // 参数校验
    if (!checkups || !Array.isArray(checkups) || checkups.length === 0) {
      return res.json({
        ret: -1,
        error_msg: 'Missing or invalid checkups array'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 批量处理体检数据
    for (const checkup of checkups) {
      try {
        const { type, person, doctor, value, time } = checkup;

        // 必填字段校验
        if (!type || !person || !value || !time) {
          results.failed++;
          results.errors.push({ 
            type, 
            person, 
            error: 'Missing required fields: type, person, value or time' 
          });
          continue;
        }

        // value 转 JSON 字符串
        const valueStr = JSON.stringify(value);

        // 插入体检数据
        await dbAsync.run(
          `INSERT INTO checkups 
          (type, person_idcard, doctor_idcard, value, time, device_sn, uploaded)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [type, person, doctor || null, valueStr, time, sn, 1]
        );

        results.success++;
        
        // 日志记录（调试用）
        const typeName = CHECKUP_TYPE_NAMES[type] || `Type${type}`;
        console.log(`[Checkup] ${typeName} uploaded for ${person}`);

      } catch (err) {
        results.failed++;
        results.errors.push({ 
          type: checkup.type, 
          person: checkup.person, 
          error: err.message 
        });
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
    console.error('Checkup upload error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Checkup upload failed'
    });
  }
});

// GET /checkup - 查询体检数据列表（调试用）
router.get('/', async (req, res) => {
  try {
    const { person, type, limit = 50 } = req.query;
    
    let sql = `
      SELECT c.*, 
        CASE c.type
          WHEN 1 THEN '无创血压'
          WHEN 2 THEN '血糖'
          WHEN 4 THEN '体温'
          WHEN 5 THEN '血氧'
          WHEN 6 THEN '尿常规'
          WHEN 20 THEN '糖化血红蛋白'
          WHEN 22 THEN '血红蛋白'
          ELSE '其他'
        END as type_name
      FROM checkups c 
      WHERE 1=1
    `;
    const params = [];

    if (person) {
      sql += ' AND c.person_idcard = ?';
      params.push(person);
    }
    if (type) {
      sql += ' AND c.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY c.time DESC LIMIT ?';
    params.push(parseInt(limit));

    const checkups = await dbAsync.all(sql, params);
    
    // 解析 value JSON
    const parsedCheckups = checkups.map(c => ({
      ...c,
      value: JSON.parse(c.value || '{}')
    }));

    res.json({
      ret: 0,
      error_msg: '',
      data: parsedCheckups
    });
  } catch (error) {
    res.json({ ret: -1, error_msg: error.message });
  }
});

module.exports = router;