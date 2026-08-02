import jwt from "jsonwebtoken";

export function makeTestToken(payload = {}, options = {}) {
  const signOptions = payload.exp !== undefined ? { ...options } : { expiresIn: "1h", ...options };
  return jwt.sign({ role: "admin", ...payload }, process.env.JWT_SECRET, signOptions);
}

export default { makeTestToken };
