/**
 * 医生签名上传接口
 * POST /doctorSign
 * 
 * 请求参数：
 * - sn: 设备序列号
 * - idcard: 医生身份证号
 * - signature: 签名图片base64编码
 */

const express = require('express');
const router = express.Router();
const { dbAsync } = require('../models/database');

router.post('/', async (req, res) => {
  try {
    const { sn, idcard, signature } = req.body;

    // 参数校验
    if (!idcard || !signature) {
      return res.json({
        ret: -1,
        error_msg: 'Missing required fields: idcard or signature'
      });
    }

    // 检查医生是否存在
    const doctor = await dbAsync.get(
      'SELECT id FROM doctors WHERE idcard = ?',
      [idcard]
    );

    if (!doctor) {
      return res.json({
        ret: -1,
        error_msg: 'Doctor not found'
      });
    }

    // 更新签名
    await dbAsync.run(
      'UPDATE doctors SET signature = ?, update_time = strftime(\'%s\', \'now\') WHERE idcard = ?',
      [signature, idcard]
    );

    res.json({ ret: 0, error_msg: '' });

  } catch (error) {
    console.error('Doctor sign upload error:', error);
    res.json({
      ret: -1,
      error_msg: error.message || 'Signature upload failed'
    });
  }
});

module.exports = router;