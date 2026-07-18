import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "cajuos_session";
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL ?? "";

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export type TokenPayload = { email: string };

/** Sign a JWT payload with given TTL string (e.g. "15m", "7d"). */
export async function signToken(
  payload: TokenPayload,
  expiresIn: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(getSecret());
}

/** Verify and decode a JWT. Returns null if invalid. */
export async function verifyToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL();
}

export { COOKIE_NAME, ADMIN_EMAIL };
