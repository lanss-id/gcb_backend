// koyeb.config.js
module.exports = {
  service: {
    name: "greencyclebank-backend",
    env: {
      // Pengaturan untuk Node.js
      NODE_ENV: "production",
      NODE_OPTIONS: "--max-old-space-size=512",
    },
    resources: {
      // Konfigurasi resource container di Koyeb
      cpu: 256, // 0.25 vCPU
      memory: 512, // 512MB RAM
      scale: {
        min: 1,
        max: 1
      }
    },
    health_checks: {
      path: "/api/health",
      port: 3001,
      initial_delay_seconds: 20,
      period_seconds: 5
    }
  }
};
