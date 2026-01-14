#!/bin/bash
echo "🔄 Switching to standalone mode..."

# Update nginx config for standalone mode
echo "⚙️  Updating nginx configuration..."
sed -i 's/# return 301 https/return 301 https/' docker/nginx/nginx.conf

# Update environment if .env exists  
if [ -f .env ]; then
    if grep -q "DEPLOYMENT_MODE" .env; then
        sed -i 's/DEPLOYMENT_MODE=external_lb/DEPLOYMENT_MODE=standalone/' .env
    else
        echo "DEPLOYMENT_MODE=standalone" >> .env
    fi
fi

# Restart nginx only
echo "🔄 Restarting nginx..."
docker-compose restart nginx

echo "✅ Switched to standalone mode"
echo "📝 Make sure SSL certificates are in docker/ssl/"
echo "   Run: ./scripts/setup-ssl.sh your-domain.com your-email@domain.com"