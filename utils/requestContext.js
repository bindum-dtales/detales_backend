import { AsyncLocalStorage } from "async_hooks";

export const requestContext = new AsyncLocalStorage();

export function getRequestId() {
  return requestContext.getStore()?.requestId;
}

export default requestContext;
