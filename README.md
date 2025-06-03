# MIET Lambda Hub

MIET Lambda Hub is a modern web application for managing and executing Lua scripts in the cloud. It provides a user-friendly interface for creating projects, writing scripts, and executing them via HTTP API.

## Features

- 🔐 **Authentication System**
  - User registration and login
  - Secure token-based authentication
  - Profile management

- 📁 **Project Management**
  - Create and manage multiple projects
  - Organize scripts within projects
  - Project deletion and cleanup

- 📝 **Script Editor**
  - Syntax highlighting for Lua
  - Real-time script editing
  - Auto-save functionality
  - Script settings configuration
  - Memory limit and timeout settings

- 🔄 **Script Execution**
  - Execute scripts directly from the editor
  - View execution logs and results
  - Track execution costs and resource usage
  - Test scripts via HTTP endpoints

- 🎨 **Modern UI/UX**
  - Dark/Light theme support
  - Responsive design
  - Drag-and-drop script organization
  - Keyboard shortcuts
  - Beautiful animations and transitions

- 📊 **Monitoring & Logging**
  - Execution history
  - Resource usage tracking
  - Script change history
  - Error logging and debugging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lambda-executor-ui.git
cd lambda-executor-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
REACT_APP_API_URL=http://your-api-url:8081
```

## Development

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Deployment with Nginx

1. Build the application for production:
```bash
npm run build
```

2. Install Nginx (if not already installed):
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx
```

3. Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/lambda-hub
```

4. Add the following configuration:
```nginx
server {
    listen 80;
    server_name miet-lambda.reos.fun.com;  # Replace with your domain

    root /var/www/lambda-hub;     # Path to your build directory
    index index.html;

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8081/;  # Your backend API URL
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

5. Create a symbolic link to enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lambda-hub /etc/nginx/sites-enabled/
```

6. Copy the build files to the web directory:
```bash
sudo mkdir -p /var/www/lambda-hub
sudo cp -r build/* /var/www/lambda-hub/
```

7. Set proper permissions:
```bash
sudo chown -R www-data:www-data /var/www/lambda-hub
sudo chmod -R 755 /var/www/lambda-hub
```

8. Test Nginx configuration:
```bash
sudo nginx -t
```

9. Restart Nginx:
```bash
sudo systemctl restart nginx
```

10. (Optional) Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d miet-lambda.reos.fun.com
```

Your application should now be accessible at `http://miet-lambda.reos.fun.com` (or `https://miet-lambda.reos.fun.com` if you set up SSL).

### Troubleshooting

- Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

- Check Nginx access logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

- Verify file permissions:
```bash
ls -la /var/www/lambda-hub
```

- Test Nginx configuration:
```bash
sudo nginx -t
```

## Project Structure

```
src/
├── components/         # React components
├── contexts/          # React contexts
├── services/          # API services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx           # Main application component
```

## API Integration

The application integrates with a backend API for:
- User authentication
- Project management
- Script execution
- Resource monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Font Awesome](https://fontawesome.com/)
