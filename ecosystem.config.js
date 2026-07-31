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
        SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwa2ZidHFsanJubHVmZmxrbmt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk4ODIwOCwiZXhwIjoyMDg0NTY0MjA4fQ.wIQe5KZAZFdKst5s1v9TbH844D0xqHpoOFstVTUnOUM"
      }
    }
  ]
};
