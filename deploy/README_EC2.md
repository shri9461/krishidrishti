# AWS EC2 Deployment Guide - KrishiDrishti

This guide explains how to deploy the KrishiDrishti application on a single **AWS EC2 (Ubuntu 22.04 LTS)** virtual server using **Nginx**, **PM2**, and **Let's Encrypt SSL**.

---

## Prerequisites & AWS Setup

### 1. Launch EC2 Instance
- **OS**: Ubuntu Server 22.04 LTS (HVM)
- **Instance Type**: `t2.micro` or `t3.micro` (eligible for Free Tier)
- **Key Pair**: Create and download a `.pem` file for SSH access.
- **Network Settings (Security Group)**:
  - Add **Inbound Rules**:
    - `SSH` (Port 22) -> Limit to `My IP` (for security)
    - `HTTP` (Port 80) -> `0.0.0.0/0` (Anywhere)
    - `HTTPS` (Port 443) -> `0.0.0.0/0` (Anywhere)

### 2. Connect to EC2
Open your terminal (Mac/Linux) or Git Bash (Windows) and connect:
```bash
# Set correct read permissions for your private key
chmod 400 /path/to/your-key.pem

# Connect to your EC2 instance via SSH
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-dns-or-ip
```

---

## Step 1: Install System Dependencies

Once connected to your EC2 instance, run the following commands to update the system and install required tools:

```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (Web Server)
sudo apt install nginx -y

# Install PM2 (Process Manager for Node.js) globally
sudo npm install pm2 -g

# Install Certbot (for SSL certificates)
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 2: Set Up Directory & Clone Codebase

We will locate our application directory under `/var/www/krishidrishti`:

```bash
# Create the folder and set ownership permissions to the ubuntu user
sudo mkdir -p /var/www/krishidrishti
sudo chown -R ubuntu:ubuntu /var/www/krishidrishti

# Clone your project Git repository (replace with your repository URL)
git clone https://github.com/your-username/krishidrishti.git /var/www/krishidrishti
```

---

## Step 3: Configure Environment Variables

Create and fill in the environment variable file for the Express backend server:

```bash
# Navigate to the server folder
cd /var/www/krishidrishti/server

# Create a production .env file
nano .env
```

Paste the following variables, filling in your specific details:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here

# Mail config (Optional fallback)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit nano)*

---

## Step 4: Build Frontend & Install Dependencies

```bash
# Go to application root
cd /var/www/krishidrishti

# Install root, backend, and frontend packages
npm run install:all

# Navigate to client and build Vite production files
cd client
npm run build
```
*(This creates the static HTML/JS/CSS assets inside `/var/www/krishidrishti/client/dist`)*

---

## Step 5: Configure Nginx Reverse Proxy

Copy the provided Nginx virtual host configuration into the Nginx configuration directory:

```bash
# Copy deploy/nginx.conf to sites-available
sudo cp /var/www/krishidrishti/deploy/nginx.conf /etc/nginx/sites-available/krishidrishti

# Edit configuration to update your domain name and IP address
sudo nano /etc/nginx/sites-available/krishidrishti
```
*Change `your-domain.com` and `your-ec2-public-ip` to your actual domain name/IP address.*

```bash
# Enable the site configuration by creating a symlink
sudo ln -s /etc/nginx/sites-available/krishidrishti /etc/nginx/sites-enabled/

# Remove Nginx default index configuration to avoid conflicts
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration for syntax errors
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 6: Start Backend using PM2

Start the Node.js Express server process using PM2 so it keeps running in the background:

```bash
# Go to the deploy directory
cd /var/www/krishidrishti

# Start server using the ecosystem configuration
pm2 start deploy/ecosystem.config.cjs

# Save PM2 process list to load on system reboots
pm2 save

# Setup PM2 startup script to automatically load on server starts
pm2 startup
```
*(Copy and run the exact command outputted by `pm2 startup` in your terminal)*

---

## Step 7: Secure the Site with SSL (HTTPS)

Deploy free SSL certificates using Let's Encrypt via Certbot:

```bash
# Request certificate and let Certbot configure Nginx redirect rules automatically
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
*Follow the on-screen prompts to input your email address and accept the terms.*

---

## Monitoring and Maintenance

- **Restart Backend Node Process**: `pm2 restart krishidrishti-backend`
- **View Backend Server Logs**: `pm2 logs krishidrishti-backend`
- **Nginx Server Logs**:
  - Access log: `tail -f /var/log/nginx/access.log`
  - Error log: `tail -f /var/log/nginx/error.log`
