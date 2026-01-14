#!/bin/bash
# Generic DigitalOcean Droplet Setup Script for Docker Infrastructure
# Run this once on a fresh Ubuntu droplet

set -e

# Configuration
APP_NAME="${1:-myapp}"
COMPOSE_URL="${2:-}"
APP_DIR="/opt/${APP_NAME}"

if [ -z "$COMPOSE_URL" ]; then
    echo "❌ Usage: $0 <app-name> <docker-compose-url>"
    echo "   Example: $0 myapp https://example.com/docker-compose.yml"
    exit 1
fi

echo "🐧 Setting up DigitalOcean droplet for Docker infrastructure deployment..."
echo "📦 App name: $APP_NAME"
echo "🔗 Compose URL: $COMPOSE_URL"

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

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p "$APP_DIR"
sudo mkdir -p /opt/backups
sudo chown -R $USER:$USER "$APP_DIR" /opt/backups

# Download docker-compose.yml
echo "📥 Downloading docker-compose.yml..."
cd "$APP_DIR"
wget -O docker-compose.yml "$COMPOSE_URL"

# Create basic .env template
echo "📝 Creating .env template..."
tee .env.example > /dev/null <<EOF
# Database Configuration
DB_PASSWORD=your_secure_database_password_here
REDIS_PASSWORD=your_secure_redis_password_here

# Add your other environment variables here
APP_KEY=your_32_character_app_key_here
APP_URL=https://your-domain.com

# Email/AWS SES (if needed)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
EOF

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
sudo tee "/etc/systemd/system/${APP_NAME}.service" > /dev/null <<EOF
[Unit]
Description=${APP_NAME} Infrastructure Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable "${APP_NAME}.service"

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
echo "✅ DigitalOcean droplet setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Log out and log back in to apply Docker group membership"
echo "2. Copy .env.example to .env and configure your environment variables:"
echo "   cd $APP_DIR && cp .env.example .env && nano .env"
echo "3. Start your infrastructure services:"
echo "   cd $APP_DIR && docker-compose up -d"
echo "4. Deploy your application separately (outside Docker)"
echo ""
echo "🔧 Useful commands:"
echo "- Check status: systemctl status ${APP_NAME}"
echo "- View logs: cd $APP_DIR && docker-compose logs -f"
echo "- Stop services: cd $APP_DIR && docker-compose down"
echo "- Update compose file: cd $APP_DIR && wget -O docker-compose.yml $COMPOSE_URL"
echo ""