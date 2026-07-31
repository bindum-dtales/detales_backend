import { randomUUID } from "crypto";
import { requestContext } from "../utils/requestContext.js";

export default function requestId(req, res, next) {
  const id = randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-ID", id);

  requestContext.run({ requestId: id }, next);
}
