/**
 * 现场图上传接口 (仅Q100型号)
 * POST /regist
 */

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { act } = req.body;
  
  if (act === 'submitLivePhoto') {
    // 可直接忽略，返回成功
    console.log('Live photo received (ignored):', req.body.ticket);
  }
  
  res.json({ ret: 0, error_msg: '' });
});

module.exports = router;