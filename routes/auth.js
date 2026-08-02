import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { validateLogin } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validateLogin, login);

export default router;
