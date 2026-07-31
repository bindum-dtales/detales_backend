import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./swaggerConfig.js";

const router = Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(openApiSpec));

export default router;
