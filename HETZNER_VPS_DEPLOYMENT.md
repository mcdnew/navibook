# 🖥️ Hetzner VPS Deployment Guide - Day Charter Application

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [VPS Setup](#vps-setup)
4. [Initial Server Configuration](#initial-server-configuration)
5. [Installing Dependencies](#installing-dependencies)
6. [Database Setup](#database-setup)
7. [Application Deployment](#application-deployment)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL Certificate Setup](#ssl-certificate-setup)
10. [Process Management](#process-management)
11. [Auto-Deployment](#auto-deployment)
12. [Monitoring & Maintenance](#monitoring--maintenance)
13. [Backup Strategy](#backup-strategy)
14. [Troubleshooting](#troubleshooting)
15. [Cost Comparison](#cost-comparison)

---

## Overview

### Why Hetzner VPS?

**Pros:**
- 💰 Cost-effective (~€5-20/month vs Vercel Pro $20/month)
- 🔒 Full control over server
- 📊 Predictable costs (no bandwidth surprises)
- 🚀 High performance (dedicated resources)
- 🌍 EU-based (GDPR compliant)

**Cons:**
- ⚙️ More setup and maintenance
- 🛠️ Requires server management knowledge
- 📈 Manual scaling
- 🔧 You handle updates/security

---

## Prerequisites

### Required Accounts
- ✅ Hetzner Cloud account
- ✅ Domain registrar access (for DNS)
- ✅ Supabase account (or self-hosted PostgreSQL)
- ✅ GitHub account (for code deployment)

### Local Requirements
- ✅ SSH client
- ✅ Basic Linux knowledge
- ✅ Git installed locally

---

## VPS Setup

### Step 1: Create Hetzner Account

1. Go to https://www.hetzner.com/cloud
2. Sign up for account
3. Verify email
4. Add payment method

### Step 2: Create VPS (Server)

1. **Login to Hetzner Cloud Console**
   - https://console.hetzner.cloud

2. **Create New Project**
   - Click "New Project"
   - Name: `day-charter-production`

3. **Add Server**
   - Click "Add Server"

4. **Select Location**
   - Recommended: `Nuremberg` (Germany - EU central)
   - Or closest to your users

5. **Select Image**
   - **OS**: Ubuntu 22.04 LTS
   - (Most stable, widely supported)

6. **Select Server Type**

   **Recommended Configurations:**

   **Small Production (Recommended Start):**
   - CPX21 (AMD)
   - 3 vCPU
   - 4 GB RAM
   - 80 GB SSD
   - **€6.90/month**

   **Medium Production:**
   - CPX31 (AMD)
   - 4 vCPU
   - 8 GB RAM
   - 160 GB SSD
   - **€13.90/month**

   **Large Production:**
   - CPX41 (AMD)
   - 8 vCPU
   - 16 GB RAM
   - 240 GB SSD
   - **€26.90/month**

7. **Networking**
   - ✅ IPv4
   - ✅ IPv6 (optional)

8. **SSH Key**
   - Add your SSH public key
   - Or create new one:
     ```bash
     ssh-keygen -t ed25519 -C "your_email@example.com"
     cat ~/.ssh/id_ed25519.pub
     ```
   - Paste into Hetzner

9. **Firewall (Create Now)**
   - Create new firewall:
     - Name: `web-server-firewall`
     - Inbound Rules:
       - SSH: Port 22 (TCP) from YOUR_IP
       - HTTP: Port 80 (TCP) from anywhere
       - HTTPS: Port 443 (TCP) from anywhere
     - Outbound: All

10. **Volumes** (Optional)
    - Skip for now (can add later for backups)

11. **Click "Create & Buy Now"**

### Step 3: Server Created

You'll receive:
- **IP Address**: `135.181.xxx.xxx`
- **Root Password**: (via email if no SSH key)

**Save these credentials securely!**

---

## Initial Server Configuration

### Step 1: Connect via SSH

```bash
# Replace with your server IP
ssh root@135.181.xxx.xxx
```

### Step 2: Update System

```bash
# Update package list
apt update

# Upgrade all packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential ufw fail2ban
```

### Step 3: Create Non-Root User

```bash
# Create deploy user
adduser deploy

# Add to sudo group
usermod -aG sudo deploy

# Copy SSH keys to new user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

### Step 4: Configure Firewall (UFW)

```bash
# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this first!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

### Step 5: Configure Fail2Ban (Security)

```bash
# Install
apt install -y fail2ban

# Create local config
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
nano /etc/fail2ban/jail.local

# Set these values:
# [DEFAULT]
# bantime = 3600
# findtime = 600
# maxretry = 5

# Restart
systemctl restart fail2ban
systemctl enable fail2ban
```

### Step 6: Test Non-Root Login

```bash
# From your local machine
ssh deploy@135.181.xxx.xxx

# Should work without password (using SSH key)
```

### Step 7: Disable Root SSH (Optional but Recommended)

```bash
sudo nano /etc/ssh/sshd_config

# Change:
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

---

## Installing Dependencies

### Step 1: Install Node.js (via nvm)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should show v18.x.x
npm --version
```

### Step 2: Install pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Verify
pnpm --version
```

### Step 3: Install PM2 (Process Manager)

```bash
# Install globally
npm install -g pm2

# Setup PM2 startup script
pm2 startup

# Follow the instructions it outputs
# (Will give you a command to run with sudo)
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 5: Install Certbot (SSL Certificates)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify
certbot --version
```

---

## Database Setup

### Option 1: Use Supabase (Recommended)

**Already have Supabase?**
- Use same project as development
- Or create new production project

**Environment Variables:**
- Same as Vercel deployment
- See [Vercel Guide](./VERCEL_DEPLOYMENT_GUIDE.md)

### Option 2: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE daycharter;
CREATE USER daycharteruser WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE daycharter TO daycharteruser;
\q

# Connection string:
# postgresql://daycharteruser:password@localhost:5432/daycharter
```

**Apply Migrations:**
```bash
# Copy migration files to server
# Then apply via psql
sudo -u postgres psql -d daycharter < migrations/001_initial_schema.sql
# ... etc for all migrations
```

---

## Application Deployment

### Step 1: Clone Repository

```bash
# As deploy user
cd /home/deploy

# Clone your repo
git clone https://github.com/yourorg/day-charter.git

# Navigate
cd day-charter
```

### Step 2: Create Environment File

```bash
# Create .env.local
nano .env.local
```

**Add variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Direct DB connection
DATABASE_URL=postgresql://...
SUPABASE_DB_PASSWORD=...

# Production mode
NODE_ENV=production

# Cron (if using Vercel Pro-like features)
ENABLE_CRON_JOBS=false  # or true if implementing custom cron
```

**Secure the file:**
```bash
chmod 600 .env.local
```

### Step 3: Install Dependencies

```bash
# Install packages
pnpm install

# This may take 2-5 minutes
```

### Step 4: Build Application

```bash
# Build for production
pnpm build

# This creates optimized production build
# Takes 2-5 minutes
```

### Step 5: Test Application

```bash
# Start application
pnpm start

# Should show:
# ready - started server on 0.0.0.0:3000
```

**Test from another terminal:**
```bash
curl http://localhost:3000

# Should return HTML
```

**Stop test server:**
```bash
# Ctrl+C
```

---

## Process Management (PM2)

### Step 1: Create PM2 Ecosystem File

```bash
cd /home/deploy/day-charter

nano ecosystem.config.js
```

**Add configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'day-charter',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: '/home/deploy/day-charter',
    instances: 2,  // Use 2 CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
  }]
}
```

### Step 2: Create Logs Directory

```bash
mkdir -p /home/deploy/day-charter/logs
```

### Step 3: Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# View status
pm2 status

# View logs
pm2 logs day-charter

# Monitor
pm2 monit
```

### PM2 Useful Commands

```bash
# Restart app
pm2 restart day-charter

# Stop app
pm2 stop day-charter

# Reload (zero-downtime restart)
pm2 reload day-charter

# Delete app
pm2 delete day-charter

# View logs
pm2 logs day-charter --lines 100

# Clear logs
pm2 flush
```

---

## Nginx Configuration

### Step 1: Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/daycharter
```

**Add configuration:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourapp.com www.yourapp.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourapp.com www.yourapp.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourapp.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Client max body size (for uploads)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

### Step 2: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/daycharter /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### Step 1: Update DNS First

Before getting SSL certificate, point your domain to server:

```
Type: A
Name: @
Value: 135.181.xxx.xxx (your server IP)
TTL: 3600

Type: A
Name: www
Value: 135.181.xxx.xxx
TTL: 3600
```

**Wait for DNS propagation** (5 minutes to 48 hours)

Check:
```bash
dig yourapp.com +short
# Should show your server IP
```

### Step 2: Get SSL Certificate

```bash
# For both domain and www subdomain
sudo certbot --nginx -d yourapp.com -d www.yourapp.com

# Follow prompts:
# Email: your@email.com
# Terms: Agree
# Share email: Your choice
# Redirect HTTP to HTTPS: Yes (2)
```

### Step 3: Test Auto-Renewal

```bash
# Dry run
sudo certbot renew --dry-run

# Should succeed
```

### Step 4: Verify HTTPS

Visit: https://yourapp.com
- Should show your app
- Green padlock in browser
- Certificate valid

---

## Auto-Deployment

### Option 1: Git Hooks (Simple)

```bash
# On server, in project directory
cd /home/deploy/day-charter

# Create update script
nano deploy.sh
```

**Add script:**
```bash
#!/bin/bash
cd /home/deploy/day-charter

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
pnpm install

echo "🔨 Building application..."
pnpm build

echo "🔄 Reloading PM2..."
pm2 reload ecosystem.config.js

echo "✅ Deployment complete!"
```

**Make executable:**
```bash
chmod +x deploy.sh
```

**Deploy command:**
```bash
# When you push to GitHub, run on server:
./deploy.sh
```

### Option 2: GitHub Actions (Automatic)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hetzner VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/deploy/day-charter
            ./deploy.sh
```

**Setup GitHub Secrets:**
- `SSH_HOST`: Your server IP
- `SSH_USER`: deploy
- `SSH_KEY`: Your private SSH key

### Option 3: Webhook (Advanced)

Install webhook receiver on server:

```bash
npm install -g webhook

# Create webhook config
# Setup endpoint
# Configure GitHub webhook
```

---

## Monitoring & Maintenance

### Daily Monitoring

**PM2 Monitor:**
```bash
pm2 monit
```

**Check Logs:**
```bash
pm2 logs day-charter --lines 50
```

**System Resources:**
```bash
htop
# or
top
```

**Disk Usage:**
```bash
df -h
```

### Weekly Maintenance

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clean up
sudo apt autoremove -y
sudo apt autoclean

# Check PM2
pm2 status

# Restart if needed
pm2 reload day-charter
```

### Monthly Tasks

```bash
# Review logs
pm2 logs day-charter --lines 1000

# Check for errors
grep -i error /home/deploy/day-charter/logs/err.log

# Test SSL renewal
sudo certbot renew --dry-run

# Check disk space
df -h
```

---

## Backup Strategy

### Application Backup

```bash
# Create backup script
nano /home/deploy/backup.sh
```

**Script content:**
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
  /home/deploy/day-charter \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs'

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "✅ Backup complete: app_$DATE.tar.gz"
```

**Automate with cron:**
```bash
crontab -e

# Add line (daily at 2 AM):
0 2 * * * /home/deploy/backup.sh
```

### Database Backup (if self-hosted)

```bash
# PostgreSQL backup
pg_dump -U daycharteruser daycharter > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql
```

### Off-site Backup

**Option 1: Hetzner Storage Box**
- €3.81/month for 100GB
- Mount via SFTP/rsync

**Option 2: rsync to another server**
```bash
rsync -avz /home/deploy/backups/ user@backup-server:/backups/
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs day-charter

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 [PID]

# Restart
pm2 restart day-charter
```

### Nginx Errors

```bash
# Test config
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config for SSL paths
sudo nginx -t
```

### Out of Memory

```bash
# Check memory usage
free -h

# Add swap space (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### High CPU Usage

```bash
# Check processes
top

# Check PM2 instances
pm2 status

# Reduce instances if needed
# Edit ecosystem.config.js, set instances: 1
pm2 reload ecosystem.config.js
```

---

## Cost Comparison

### Hetzner VPS (Small Production)

**Server:**
- CPX21: €6.90/month
- Supabase Free: €0/month
- Domain: €10/year (~€0.83/month)
- **Total: ~€7.73/month** (~$8.50/month)

**Includes:**
- 3 vCPU
- 4 GB RAM
- 80 GB SSD
- 20 TB traffic
- Unlimited deployments
- Full control

### Vercel + Supabase (Pro)

**Services:**
- Vercel Pro: $20/month
- Supabase Free: $0/month
- Domain: $10/year (~$0.83/month)
- **Total: ~$20.83/month**

**Includes:**
- Serverless (auto-scaling)
- 1TB bandwidth
- Analytics
- Zero config
- Managed infrastructure

### Savings with Hetzner

**Monthly:** €7.73 vs $20.83 = **Save ~€11/month** (~$12/month)
**Yearly:** **Save ~€132/year** (~$145/year)

**Trade-off:**
- ✅ Save money
- ❌ More setup time
- ❌ More maintenance
- ❌ Manual scaling

---

## Performance Optimization

### Enable Caching

```nginx
# In Nginx config, add:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;
proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;

# In location block:
proxy_cache my_cache;
proxy_cache_valid 200 60m;
add_header X-Cache-Status $upstream_cache_status;
```

### PM2 Clustering

```javascript
// ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

### Node.js Optimization

```bash
# In .env.local
NODE_OPTIONS="--max-old-space-size=2048"
```

---

## Security Checklist

Before going live:

- [ ] Firewall configured (UFW)
- [ ] Fail2Ban installed and running
- [ ] Root SSH login disabled
- [ ] SSH key authentication only
- [ ] Non-root user created
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Security headers configured
- [ ] .env.local file secured (chmod 600)
- [ ] Regular backups configured
- [ ] Monitoring setup
- [ ] Auto-updates enabled (unattended-upgrades)

---

## Quick Reference Commands

```bash
# Application
pm2 status                    # Check app status
pm2 logs day-charter          # View logs
pm2 restart day-charter       # Restart app
./deploy.sh                   # Deploy updates

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
sudo systemctl restart nginx  # Restart

# SSL
sudo certbot renew            # Renew certificates
sudo certbot certificates     # Check status

# System
htop                          # Monitor resources
df -h                         # Disk usage
free -h                       # Memory usage
sudo systemctl status nginx   # Service status

# Logs
pm2 logs day-charter          # App logs
sudo tail -f /var/log/nginx/access.log  # Nginx access
sudo tail -f /var/log/nginx/error.log   # Nginx errors
```

---

## Support Resources

### Hetzner
- Docs: https://docs.hetzner.com
- Community: https://community.hetzner.com
- Status: https://status.hetzner.com

### PM2
- Docs: https://pm2.keymetrics.io/docs
- GitHub: https://github.com/Unitech/pm2

### Nginx
- Docs: https://nginx.org/en/docs
- SSL Test: https://www.ssllabs.com/ssltest

### Let's Encrypt
- Docs: https://letsencrypt.org/docs
- Certbot: https://certbot.eff.org

---

## Deployment Checklist

### Initial Setup
- [ ] Hetzner account created
- [ ] VPS created and running
- [ ] SSH key configured
- [ ] Firewall rules set
- [ ] Non-root user created
- [ ] Fail2Ban installed
- [ ] Node.js installed
- [ ] pnpm installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Certbot installed

### Application Deployment
- [ ] Repository cloned
- [ ] .env.local created
- [ ] Dependencies installed
- [ ] Application built
- [ ] PM2 configured
- [ ] App running on :3000
- [ ] Nginx configured
- [ ] DNS pointed to server
- [ ] SSL certificate obtained
- [ ] HTTPS working

### Production Ready
- [ ] Auto-deployment configured
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] Database migrations applied
- [ ] Tested all features
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation updated

---

**Status**: Production-Ready VPS Deployment Guide
**Cost**: ~€7.73/month (~$8.50/month)
**Setup Time**: 2-4 hours
**Maintenance**: ~1 hour/month

---

🎯 **Your application can run on Hetzner VPS for less than $9/month with full control!**
