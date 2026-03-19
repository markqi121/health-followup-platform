// 检测类型映射（根据协议文档）
const CHECKUP_TYPES = {
  1: { name: '无创血压', unit: 'mmHg', icon: '🩺' },
  2: { name: '血糖', unit: 'mmol/L', icon: '🩸' },
  4: { name: '体温', unit: '°C', icon: '🌡️' },
  5: { name: '血氧', unit: '%', icon: '💨' },
  6: { name: '尿常规', unit: '', icon: '🧪' },
  7: { name: '尿酸', unit: 'μmol/L', icon: '🧪' },
  8: { name: '胆固醇', unit: 'mmol/L', icon: '🧪' },
  9: { name: '血脂', unit: 'mmol/L', icon: '🧪' },
  20: { name: '糖化血红蛋白', unit: '%', icon: '🩸' },
  22: { name: '血红蛋白', unit: 'g/L', icon: '🩸' },
  33: { name: '血生化', unit: '', icon: '🧪' },
};

// 格式化检测值
function formatValue(type, valueStr) {
  try {
    const data = JSON.parse(valueStr);
    
    switch (type) {
      case 1: // 血压
        return `${data.systolic || '--'}/${data.diastolic || '--'}`;
      case 2: // 血糖
        return data.glucose || data.value || '--';
      case 4: // 体温
        return data.temperature || data.value || '--';
      case 5: // 血氧
        return data.oxygen || data.spo2 || data.value || '--';
      case 6: // 尿常规
        return data.result || '查看详情';
      default:
        return data.value || '--';
    }
  } catch {
    return valueStr;
  }
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '--';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 单张指标卡片
function HealthCard({ checkup }) {
  const typeInfo = CHECKUP_TYPES[checkup.type] || { name: '未知指标', unit: '', icon: '📊' };
  const value = formatValue(checkup.type, checkup.value);
  
  return (
    <div className="health-card">
      <div className="card-header">
        <span className="icon">{typeInfo.icon}</span>
        <span className="name">{typeInfo.name}</span>
      </div>
      <div className="card-body">
        <span className="value">{value}</span>
        <span className="unit">{typeInfo.unit}</span>
      </div>
      <div className="card-footer">
        <span className="time">{formatTime(checkup.time)}</span>
        <span className="device">{checkup.device_sn || ''}</span>
      </div>
    </div>
  );
}

export default HealthCard;
export { CHECKUP_TYPES, formatValue, formatTime };
