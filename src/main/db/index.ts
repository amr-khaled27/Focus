import { app } from "electron";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq, isNull } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { join } from "path";
import {
  users,
  sessions,
  photos,
  photoTemplates,
  orders,
  orderItems,
} from "./schema";
import { User } from "@shared/types/User";
import { is } from "@electron-toolkit/utils";
import { verifyPIN } from "@main/utils/PINHashing";
import { Photo } from "@shared/types/Photo";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";

let db: ReturnType<typeof drizzle> | undefined;

function getDatabase() {
  if (!db) {
    throw new Error("Database has not been initialized");
  }

  return db;
}

export async function initializeDatabase() {
  let dbUrl = "";
  if (is.dev) {
    console.log("dev db at: " + join(process.cwd(), "app.db"));
    dbUrl = join(process.cwd(), "app.db");
  } else {
    dbUrl = join(app.getPath("userData"), "app.db");
  }

  const client = createClient({
    url: "file:" + dbUrl,
  });
  const database = drizzle(client);
  db = database;

  await migrate(database, {
    migrationsFolder: join(app.getAppPath(), "drizzle"),
  });
}

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

export async function getPhotoTemplates(): Promise<PhotoTemplate[]> {
  return getDatabase().select().from(photoTemplates);
}

export async function createPhotoTemplate(
  template: Omit<PhotoTemplate, "id">,
): Promise<PhotoTemplate> {
  const result = await getDatabase()
    .insert(photoTemplates)
    .values(template)
    .returning();
  return result[0];
}

export async function editTemplate(
  templateId: number,
  template: Omit<PhotoTemplate, "id">,
): Promise<PhotoTemplate> {
  const result = await getDatabase()
    .update(photoTemplates)
    .set(template)
    .where(eq(photoTemplates.id, templateId))
    .returning();
  if (result.length === 0) {
    throw new Error("Photo template not found");
  }
  return result[0];
}

export async function insertDraftPhoto(input: {
  templateId: number;
  personName?: string | null;
  photoName?: string | null;
  qty: number;
}): Promise<Photo> {
  const template = await getDatabase()
    .select()
    .from(photoTemplates)
    .where(eq(photoTemplates.id, input.templateId))
    .limit(1);
  if (template.length === 0) {
    throw new Error("Photo template not found");
  }

  const result = await getDatabase()
    .insert(photos)
    .values({
      templateId: input.templateId,
      createdAt: new Date().toISOString(),
      price: template[0].price,
      width: template[0].width,
      height: template[0].height,
      qty: input.qty,
      personName: input.personName || null,
      photoName: input.photoName || null,
      orderId: null,
    })
    .returning();
  return result[0];
}

export async function editDraftPhoto(
  photoId: number,
  input: {
    templateId: number;
    personName?: string | null;
    photoName?: string | null;
    qty: number;
  },
): Promise<Photo> {
  const template = await getDatabase()
    .select()
    .from(photoTemplates)
    .where(eq(photoTemplates.id, input.templateId))
    .limit(1);
  if (template.length === 0) {
    throw new Error("Photo template not found");
  }

  const result = await getDatabase()
    .update(photos)
    .set({
      templateId: input.templateId,
      price: template[0].price,
      width: template[0].width,
      height: template[0].height,
      qty: input.qty,
      personName: input.personName || null,
      photoName: input.photoName || null,
    })
    .where(and(eq(photos.id, photoId), isNull(photos.orderId)))
    .returning();
  if (result.length === 0) {
    throw new Error("Draft photo not found");
  }
  return result[0];
}

export async function insertPhoto(
  photo: Omit<Photo, "id" | "createdAt" | "orderId">,
): Promise<Photo> {
  const result = await getDatabase()
    .insert(photos)
    .values({ ...photo, createdAt: new Date().toISOString(), orderId: null })
    .returning();
  return result[0];
}

export async function deletePhoto(photoId: number): Promise<boolean> {
  const result = await getDatabase()
    .delete(photos)
    .where(eq(photos.id, photoId))
    .execute();
  return result.rowsAffected > 0;
}

export async function getPhotosWithNoOrder(): Promise<Photo[]> {
  return getDatabase().select().from(photos).where(isNull(photos.orderId));
}

export async function deleteDraftPhoto(photoId: number): Promise<boolean> {
  const result = await getDatabase()
    .delete(photos)
    .where(and(eq(photos.id, photoId), isNull(photos.orderId)))
    .execute();
  return result.rowsAffected > 0;
}

export async function finalizeDraftOrder(): Promise<{
  id: number;
  itemCount: number;
  total: number;
}> {
  const session = await getDatabase().select().from(sessions).limit(1);
  if (session.length === 0) {
    throw new Error("No authenticated user");
  }

  return getDatabase().transaction(async (transaction) => {
    const draftPhotos = await transaction
      .select()
      .from(photos)
      .where(isNull(photos.orderId));
    if (draftPhotos.length === 0) {
      throw new Error("Draft batch is empty");
    }

    const orderResult = await transaction
      .insert(orders)
      .values({
        createdAt: new Date().toISOString(),
        userId: session[0].userId,
      })
      .returning();
    const order = orderResult[0];

    await transaction.insert(orderItems).values(
      draftPhotos.map((photo) => ({
        orderId: order.id,
        photoId: photo.id,
        quantity: photo.qty,
        total: photo.price * photo.qty,
      })),
    );
    await transaction
      .update(photos)
      .set({ orderId: order.id })
      .where(isNull(photos.orderId));

    return {
      id: order.id,
      itemCount: draftPhotos.reduce((sum, photo) => sum + photo.qty, 0),
      total: draftPhotos.reduce(
        (sum, photo) => sum + photo.price * photo.qty,
        0,
      ),
    };
  });
}
