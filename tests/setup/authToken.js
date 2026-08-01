function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

export function makeTestToken(payload = {}) {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const body = base64url({
    sub: "mock-user-id",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  });

  return `${header}.${body}.mock-signature`;
}

export default { makeTestToken };
