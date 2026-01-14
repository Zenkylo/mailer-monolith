#!/bin/bash
# Generic VM Setup Script for Docker Infrastructure
# This has been tested on a Ubuntu 20 VM.

set -e

echo "🐧 Setting up VM for Docker infrastructure deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install NVM and Node.js
echo "📦 Installing NVM and Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 22
nvm use 22
nvm alias default 22

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p "/opt/app"
sudo mkdir -p /opt/backups
sudo chown -R $USER:$USER "/opt/app" /opt/backups

# Configure firewall
echo "🔥 Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create systemd service for automatic startup
echo "🚀 Creating systemd service..."
sudo tee "/etc/systemd/system/docker-app.service" > /dev/null <<EOF
[Unit]
Description=Docker Infrastructure Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable "docker-app.service"

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install -y htop iotop nethogs

# Create deployment user and setup
echo "👤 Creating deployment user..."
sudo useradd -m -s /bin/bash deploy || true
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-logs > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=100M
    missingok
    delaycompress
    copytruncate
}
EOF

# Final setup
echo "🎯 Final setup..."
sudo systemctl restart docker

echo ""
echo "✅ VM setup complete!"
echo "Refer to DEPLOYMENT.md for next steps."
echo ""