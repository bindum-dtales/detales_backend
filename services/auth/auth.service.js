import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import httpStatus from "../../constants/httpStatus.js";
import errorCodes from "../../constants/errorCodes.js";
import services from "../../constants/services.js";
import env from "../../config/env.js";

const TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60;

export async function login({ username, password }) {
  const usernameMatches = username === env.ADMIN_USERNAME;
  const passwordMatches = usernameMatches && (await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH));

  if (!usernameMatches || !passwordMatches) {
    throw new AppError("Invalid username or password.", {
      status: httpStatus.UNAUTHORIZED,
      service: services.AUTH,
      code: errorCodes.INVALID_CREDENTIALS
    });
  }

  const token = jwt.sign({ role: "admin" }, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN_SECONDS });

  return { token, expiresIn: TOKEN_EXPIRES_IN_SECONDS };
}

export default { login };
