/**
 * 健康报告上传接口
 * POST /report - 批量上传
 */

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  // TODO: 阶段3实现
  res.json({ ret: 0, error_msg: '' });
});

module.exports = router;