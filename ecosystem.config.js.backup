module.exports = {
  apps: [{
    name: 'duofuturo-bi',
    script: './server/index.js',
    cwd: '/var/www/apps/duofuturo-bi',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/www/logs/duofuturo-bi-error.log',
    out_file: '/var/www/logs/duofuturo-bi-out.log',
    log_file: '/var/www/logs/duofuturo-bi-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};