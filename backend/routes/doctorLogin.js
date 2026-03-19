/**
 * 医生辅助登录信息上传
 * POST /doctorLogin
 */

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  // 仅收集信息，不处理响应
  console.log('Doctor login info:', req.body);
  res.json({ ret: 0, error_msg: '' });
});

module.exports = router;