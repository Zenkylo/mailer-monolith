module.exports = {
  apps: [
    {
      name: 'mailer-web',
      script: './build/bin/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333,
      },
      // Restart policies
      autorestart: true,
      max_restarts: 15,
      restart_delay: 2000,
      max_memory_restart: '1G',

      // Health monitoring
      min_uptime: '10s',
      kill_timeout: 5000,

      // Logging
      error_file: './tmp/logs/web-err.log',
      out_file: './tmp/logs/web-out.log',
      log_file: './tmp/logs/web-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Advanced restart conditions
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G',

      // Process monitoring
      monitoring: false, // Set to true if you have PM2 Plus
    },
    {
      name: 'mailer-queue-worker',
      script: './build/bin/console.js',
      args: 'queue:work',
      instances: 1,
      exec_mode: 'fork', // Queue workers should use fork mode
      env: {
        NODE_ENV: 'production',
      },
      // Restart policies - more aggressive for queue worker
      autorestart: true,
      max_restarts: 20, // Queue workers can be more resilient
      restart_delay: 4000,
      max_memory_restart: '512M',

      // Health monitoring
      min_uptime: '10s',
      kill_timeout: 5000,

      // Logging
      error_file: './tmp/logs/queue-err.log',
      out_file: './tmp/logs/queue-out.log',
      log_file: './tmp/logs/queue-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Advanced restart conditions
      exp_backoff_restart_delay: 100,

      // Process monitoring
      monitoring: false, // Set to true if you have PM2 Plus
    },
  ],
}
