export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-apip_session" : "apip_session";

export const BFF_PREFIX = "/api/bff";
