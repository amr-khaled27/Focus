import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPIN(
  pin: string,
  storedHash: string,
): Promise<boolean> {
  return bcrypt.compare(pin, storedHash);
}
