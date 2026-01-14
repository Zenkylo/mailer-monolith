#!/bin/bash
echo "🔄 Switching to external load balancer mode..."

# Update nginx config for external LB mode
echo "⚙️  Updating nginx configuration..."
sed -i 's/return 301 https/# return 301 https/' docker/nginx/nginx.conf

# Update environment if .env exists
if [ -f .env ]; then
    if grep -q "DEPLOYMENT_MODE" .env; then
        sed -i 's/DEPLOYMENT_MODE=standalone/DEPLOYMENT_MODE=external_lb/' .env
    else
        echo "DEPLOYMENT_MODE=external_lb" >> .env
    fi
fi

# Restart nginx only
echo "🔄 Restarting nginx..."
docker-compose restart nginx

echo "✅ Switched to external LB mode"
echo "📝 Configure your Digital Ocean Load Balancer to:"
echo "   - Point to this server's IP address on port 80"
echo "   - Handle SSL termination"
echo "   - Forward HTTP traffic to your droplets"