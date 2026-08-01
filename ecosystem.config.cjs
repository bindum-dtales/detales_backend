module.exports = {
  apps: [
    {
      name: "dtales-backend",
      script: "index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        SUPABASE_URL: "https://upkfbtqljrnlufflknkv.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        PORT: 10000
      }
    }
  ]
};
