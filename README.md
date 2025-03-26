# Video-on-Demand Platform

A scalable video-on-demand platform built with Next.js and hosted on DigitalOcean droplets. This project demonstrates how to build and scale a video streaming application, with performance benchmarks comparing different droplet configurations.

## Features

- Next.js frontend and API
- Video upload and streaming capabilities
- Nginx reverse proxy
- PM2 process management
- Load balancing support
- Performance optimization guides

## Prerequisites

- DigitalOcean account
- SSH key pair
- Basic understanding of Next.js

## Quick Start

1. Fork and clone the repository:
```bash
git clone git@github.com:Haimantika/video-on-demand.git
```

2. Set up your DigitalOcean droplet:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2
sudo npm install -g pm2
```

3. Configure Nginx:
```bash
# Create and edit Nginx config
sudo nano /etc/nginx/sites-available/video-on-demand
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/video-on-demand /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

5. Deploy the application:
```bash
cd frontend
npm install
npm run build
pm2 start npm --name "video-on-demand" -- start
pm2 save
pm2 startup
```

## Performance Benchmarks

### Basic vs Premium Droplet Comparison

| Metric | Basic ($12/mo) | Premium ($32/mo) | Improvement |
|--------|---------------|------------------|-------------|
| CPU Performance | 413.50 events/sec | 958.68 events/sec | 2.32x |
| Disk Read Speed | 21.9 MiB/s | 38.9 MiB/s | 77% |
| Network Download | 1449.83 Mbit/s | 4976.82 Mbit/s | 3.4x |
| Concurrent Users | 8.06 req/sec | 3716.82 req/sec | 461x |
| TTFB | 3.53s | 0.82s | 4x |

## Scaling Options

1. **Load Balancer**: Distribute traffic across multiple droplets
2. **Vertical Scaling**: Upgrade droplet size for better performance
3. **Horizontal Scaling**: Add more droplets behind a load balancer

## Resources

- [DigitalOcean Droplet Documentation](https://docs.digitalocean.com/products/droplets/)
- [Video Processing Best Practices](https://docs.digitalocean.com/products/droplets/)
- [Load Balancer Setup Guide](https://docs.digitalocean.com/products/load-balancers/)