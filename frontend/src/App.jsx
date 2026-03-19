import { useState, useEffect } from 'react';
import HealthCard from './components/HealthCard';
import './App.css';

function App() {
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取检测数据
  useEffect(() => {
    fetchCheckups();
  }, []);

  const fetchCheckups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/checkup');
      const data = await response.json();
      
      if (data.ret === 0) {
        setCheckups(data.data || []);
      } else {
        setError(data.error_msg || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 按类型分组（每种类型只显示最新一条）
  const latestByType = checkups.reduce((acc, curr) => {
    if (!acc[curr.type] || curr.time > acc[curr.type].time) {
      acc[curr.type] = curr;
    }
    return acc;
  }, {});

  const latestCheckups = Object.values(latestByType).sort((a, b) => b.time - a.time);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">⏳ 加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">❌ {error}</div>
        <button onClick={fetchCheckups} className="retry-btn">重试</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏥 健康指标</h1>
        <span className="count">{latestCheckups.length} 项指标</span>
      </header>

      <main className="main">
        {latestCheckups.length === 0 ? (
          <div className="empty">📭 暂无检测数据</div>
        ) : (
          <div className="cards-list">
            {latestCheckups.map((checkup) => (
              <HealthCard key={checkup.id} checkup={checkup} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <button onClick={fetchCheckups} className="refresh-btn">🔄 刷新数据</button>
      </footer>
    </div>
  );
}

export default App;
