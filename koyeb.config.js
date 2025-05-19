// koyeb.config.js
module.exports = {
  service: {
    name: "greencyclebank-backend",
    env: {
      // Pengaturan untuk Node.js
      NODE_ENV: "production",
      NODE_OPTIONS: "--max-old-space-size=512",
      // Tambahkan placeholder untuk env vars - nilai sebenarnya akan diisi dari Koyeb Secret/Environment
      DATABASE_URL: "KOYEB_SECRET",
      FRONTEND_URL: "KOYEB_SECRET",
      SENTRY_DSN: "KOYEB_SECRET",
      JWT_SECRET: "KOYEB_SECRET",
      JWT_EXPIRATION: "KOYEB_SECRET"
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
