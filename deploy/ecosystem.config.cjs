module.exports = {
  apps: [
    {
      name: 'krishidrishti-backend',
      script: 'server.js',
      cwd: '/var/www/krishidrishti/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
