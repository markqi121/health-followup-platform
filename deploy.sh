#!/bin/bash

# 健康随访包平台 - 腾讯云部署脚本
# 使用方法：在服务器上运行 bash deploy.sh

set -e

echo "=========================================="
echo "🚀 健康随访包平台部署脚本"
echo "=========================================="

# 配置
PROJECT_NAME="health-followup-platform"
GITHUB_REPO="https://github.com/markqi121/health-followup-platform.git"
APP_DIR="/opt/$PROJECT_NAME"
PORT=3000

# 颜色输出
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then 
    red "请使用 root 权限运行: sudo bash deploy.sh"
    exit 1
fi

# 1. 系统更新
echo ""
yellow "[1/8] 更新系统..."
apt-get update -qq
apt-get upgrade -y -qq
green "✅ 系统更新完成"

# 2. 安装 Node.js
echo ""
yellow "[2/8] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs -qq
fi
node -v
green "✅ Node.js 安装完成"

# 3. 安装 PM2
echo ""
yellow "[3/8] 安装 PM2..."
npm install -g pm2 --silent
pm2 --version
green "✅ PM2 安装完成"

# 4. 克隆代码
echo ""
yellow "[4/8] 克隆代码..."
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
fi
mkdir -p /opt
cd /opt
git clone "$GITHUB_REPO" "$PROJECT_NAME"
cd "$APP_DIR"
green "✅ 代码克隆完成"

# 5. 安装依赖
echo ""
yellow "[5/8] 安装依赖..."
cd backend
npm install --silent
green "✅ 依赖安装完成"

# 6. 配置防火墙
echo ""
yellow "[6/8] 配置防火墙..."
ufw allow $PORT/tcp || true
ufw allow 22/tcp || true
ufw --force enable || true
green "✅ 防火墙配置完成"

# 7. 创建 PM2 配置
echo ""
yellow "[7/8] 配置 PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'health-followup-api',
    script: './server.js',
    cwd: '/opt/health-followup-platform/backend',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/health-followup/error.log',
    out_file: '/var/log/health-followup/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    restart_delay: 3000,
    max_restarts: 10
  }]
};
EOF

# 创建日志目录
mkdir -p /var/log/health-followup
green "✅ PM2 配置完成"

# 8. 启动服务
echo ""
yellow "[8/8] 启动服务..."
pm2 delete health-followup-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root || true
green "✅ 服务启动完成"

# 完成
echo ""
echo "=========================================="
green "🎉 部署成功！"
echo "=========================================="
echo ""
echo "📊 服务状态："
pm2 status
echo ""
echo "🌐 访问地址："
echo "   API: http://$(curl -s ifconfig.me):3000/health"
echo ""
echo "📋 常用命令："
echo "   查看日志: pm2 logs health-followup-api"
echo "   重启服务: pm2 restart health-followup-api"
echo "   停止服务: pm2 stop health-followup-api"
echo ""
echo "⚠️  安全提醒："
echo "   1. 修改 root 密码: passwd"
echo "   2. 配置安全组：开放 3000 端口"
echo "   3. 建议使用域名 + HTTPS"
echo "=========================================="
