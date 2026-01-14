#!/bin/bash

# SSL Certificate setup script for Let's Encrypt

DOMAIN=${1:-your-domain.com}
EMAIL=${2:-your-email@example.com}

if [ "$DOMAIN" = "your-domain.com" ] || [ "$EMAIL" = "your-email@example.com" ]; then
    echo "❌ Error: Please provide your actual domain and email"
    echo "Usage: $0 your-domain.com your-email@domain.com"
    exit 1
fi

echo "🔐 Setting up SSL for domain: $DOMAIN"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Stop nginx if running
echo "🛑 Stopping nginx..."
docker-compose down nginx 2>/dev/null || true

# Get certificate
echo "📜 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -ne 0 ]; then
    echo "❌ Failed to obtain SSL certificate"
    exit 1
fi

# Create ssl directory
mkdir -p docker/ssl

# Copy certificates
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem docker/ssl/your-domain.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem docker/ssl/your-domain.key
sudo chown $(whoami):$(whoami) docker/ssl/*

# Update nginx config with actual domain
echo "⚙️  Updating nginx configuration..."
sed -i "s/your-domain.com/$DOMAIN/g" docker/nginx/nginx.conf

echo "✅ SSL certificates installed!"
echo "📝 Next steps:"
echo "   1. Update your .env file with APP_URL=https://$DOMAIN"
echo "   2. Point your domain DNS to this server's IP address"
echo "   3. Run: docker-compose up -d"
echo ""
echo "🔄 To renew certificates, run: sudo certbot renew"