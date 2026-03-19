#!/bin/bash
# 阶段4测试脚本 - 心电和B超上传接口

echo "🧪 阶段4测试 - 文件上传接口"
echo "=========================================="

# 创建测试图片
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png

echo ""
echo "1️⃣ 测试心电上传 (/ecg)"
ECG_RESULT=$(curl -s -X POST http://localhost:3000/ecg \
  -F "uploadFile=@/tmp/test_image.png" \
  -F "device_id=DEV001" \
  -F "sn=SN2024001" \
  -F "version=197" \
  -F "person=110101195001011111" \
  -F "doctor=110101199001011234" \
  -F "time=$(date +%s)")
echo "Response: $ECG_RESULT"

echo ""
echo "2️⃣ 测试B超上传 (/1004)"
ULTRA_RESULT=$(curl -s -X POST http://localhost:3000/1004 \
  -F "uploadFile=@/tmp/test_image.png" \
  -F "device_id=DEV001" \
  -F "sn=SN2024001" \
  -F "version=197" \
  -F "person=110101195001011111" \
  -F "doctor=110101199001011234" \
  -F "time=$(date +%s)")
echo "Response: $ULTRA_RESULT"

echo ""
echo "3️⃣ 检查上传目录"
echo "心电目录:"
ls -la /home/dangkang/.openclaw/workspace-tech/projects/health-followup-platform/backend/uploads/ecg/ 2>/dev/null || echo "  (空)"
echo ""
echo "B超目录:"
ls -la /home/dangkang/.openclaw/workspace-tech/projects/health-followup-platform/backend/uploads/ultrasound/ 2>/dev/null || echo "  (空)"

echo ""
echo "=========================================="
if echo "$ECG_RESULT" | grep -q '"ret":0' && echo "$ULTRA_RESULT" | grep -q '"ret":0'; then
  echo "✅ 阶段4测试通过！两个接口都返回成功"
else
  echo "❌ 阶段4测试失败，请检查响应"
fi
