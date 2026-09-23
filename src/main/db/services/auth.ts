import { eq } from "drizzle-orm";
import { getDatabase } from "../client";
import { users, sessions } from "../schema";
import { User } from "@shared/types/User";
import { verifyPIN } from "@main/utils/PINHashing";

export async function getLoginUsers(): Promise<Omit<User, "pin">[]> {
  return getDatabase()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.id);
}

export async function getAdminInitialized(): Promise<boolean> {
  const adminUser = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  return adminUser.length > 0;
}

export async function createSession(
  sessionId: string,
  userId: number,
): Promise<void> {
  await getDatabase().insert(sessions).values({ sessionId, userId });
}

export async function authenticateUser(
  userId: number,
  pin: string,
): Promise<Omit<User, "pin"> | null> {
  const result = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = result[0];
  if (!user || !(await verifyPIN(pin, user.pin))) {
    return null;
  }

  return user;
}

export async function getSession(): Promise<Omit<User, "pin"> | null> {
  const session = await getDatabase().select().from(sessions).limit(1);

  if (session.length === 0) {
    return null;
  }

  const user = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.id, session[0].userId))
    .limit(1);

  return user.length > 0 ? user[0] : null;
}

export async function clearSession(): Promise<void> {
  await getDatabase().delete(sessions).execute();
}

export async function addUser(user: Omit<User, "id">): Promise<User> {
  const result = await getDatabase().insert(users).values(user).returning();
  return result[0];
}
