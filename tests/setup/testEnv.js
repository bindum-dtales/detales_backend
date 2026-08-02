import bcrypt from "bcrypt";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "https://test-project.supabase.test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.SUPABASE_BUCKET = "test-bucket";
process.env.FRONTEND_URL = "https://test.dtales.local";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.ADMIN_USERNAME = "test-admin";
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync("test-password", 4);
