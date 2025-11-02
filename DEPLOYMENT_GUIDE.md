# Deployment Guide for BizManager Application

This guide provides step-by-step instructions for manually deploying the BizManager application on a VPS, as well as using automated deployment through GitHub Actions.

## Prerequisites

1. A VPS with Ubuntu 20.04 or later (recommended)
2. Root or sudo access to the VPS
3. A domain name (optional but recommended for production)
4. For GitHub Actions deployment: SSH access to your VPS and Docker Hub account

## Server Setup

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Software

```bash
# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager for Node.js applications)
sudo npm install -g pm2

# Install SQLite (if using SQLite as database)
sudo apt install -y sqlite3

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### 3. Install and Configure Database (SQLite)

For this application, we'll use SQLite for simplicity. In production, you might want to use PostgreSQL.

```bash
# Create directory for the database
sudo mkdir -p /var/lib/bizmanager
sudo chown $USER:$USER /var/lib/bizmanager
```

## GitHub Actions Deployment (Recommended)

The application includes automated deployment workflows using GitHub Actions. There are two workflows:

1. **CI/CD Pipeline** (`ci-cd.yml`) - Runs tests and deploys on every push
2. **Deploy Pipeline** (`deploy.yml`) - Dedicated deployment workflow that can be triggered manually

### Setting up GitHub Actions Secrets

To use the automated deployment, you need to set up the following secrets in your GitHub repository:

1. Go to your repository settings
2. Click on "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `VPS_HOST`: Your VPS IP address or domain
   - `VPS_USERNAME`: SSH username for your VPS
   - `VPS_SSH_KEY`: Private SSH key for accessing your VPS
   - `VPS_PORT`: SSH port (default: 22)
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token
   - `APP_URL`: The URL where your application will be accessible (e.g., http://your-domain.com)

### Deployment Process

The automated deployment workflow includes:

1. Building the application
2. Deploying to your VPS via SSH
3. Creating backups of previous deployments
4. Running database migrations
5. Restarting the application with PM2
6. Building and pushing Docker images
7. Health checking the deployed application

To trigger the deployment workflow:
1. Push to the `main` branch, or
2. Manually trigger the "Deploy to Production" workflow from the GitHub Actions tab

## Manual Application Deployment

### 1. Clone or Transfer Application Files

Option 1: Clone from repository (if available)
```bash
cd /var/www
git clone <your-repository-url> bizmanager
cd bizmanager
```

Option 2: Upload files manually using SCP or SFTP
```bash
# From your local machine, transfer files to VPS
scp -r /path/to/local/bizmanager user@your-vps-ip:/var/www/
```

### 2. Install Dependencies

```bash
cd /var/www/bizmanager
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
nano /var/www/bizmanager/.env
```

Add the following content (adjust values as needed):

```
# Database configuration
DATABASE_URL="file:/var/lib/bizmanager/bizmanager.db"

# Authentication secret
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"

# Next.js configuration
NEXT_PUBLIC_BASE_URL="http://your-domain.com"
NODE_ENV="production"
```

Generate a strong AUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

```bash
cd /var/www/bizmanager
npx prisma migrate deploy
```

### 5. Seed the Database (Optional)

If you want to populate the database with initial data:

```bash
cd /var/www/bizmanager
npm run seed
```

### 6. Build the Application

```bash
cd /var/www/bizmanager
npm run build
```

## Process Management with PM2

### 1. Create PM2 Configuration File

Create a file named `ecosystem.config.js` in the root directory:

```bash
nano /var/www/bizmanager/ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [{
    name: 'bizmanager',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/bizmanager',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. Start the Application with PM2

```bash
cd /var/www/bizmanager
pm2 start ecosystem.config.js
```

### 3. Set PM2 to Start on Boot

```bash
pm2 startup
pm2 save
```

## Web Server Configuration (Nginx)

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/bizmanager
```

Add the following content (adjust domain name as needed):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/bizmanager /etc/nginx/sites-enabled/
```

### 3. Test Nginx Configuration

```bash
sudo nginx -t
```

### 4. Restart Nginx

```bash
sudo systemctl restart nginx
```

## SSL Certificate (Optional but Recommended)

To secure your application with HTTPS, you can use Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to complete the SSL certificate installation.

## Firewall Configuration

Enable UFW firewall and allow necessary ports:

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow ssh

# Allow HTTP (port 80)
sudo ufw allow 80

# Allow HTTPS (port 443)
sudo ufw allow 443
```

## Monitoring and Maintenance

### View Application Logs

```bash
# View PM2 logs
pm2 logs

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Application

```bash
# Restart the application
pm2 restart bizmanager

# Reload after making configuration changes
pm2 reload bizmanager
```

### Update Application

To update the application:

```bash
# Pull latest changes (if using Git)
cd /var/www/bizmanager
git pull

# Install/update dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 reload bizmanager
```

## Troubleshooting

1. If the application fails to start, check PM2 logs:
   ```bash
   pm2 logs bizmanager
   ```

2. If the website is not accessible, check Nginx configuration:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. Check if the application is running on port 3000:
   ```bash
   curl http://localhost:3000
   ```

4. Verify database connectivity:
   ```bash
   # Check if database file exists
   ls -la /var/lib/bizmanager/
   ```

## Security Considerations

1. Change default passwords and secrets
2. Regularly update system packages
3. Use strong SSL/TLS configurations
4. Implement proper backup strategies
5. Monitor logs for suspicious activity
6. Restrict unnecessary ports with firewall