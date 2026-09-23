import { and, eq, isNull } from "drizzle-orm";
import { getDatabase } from "../client";
import { photoTemplates, photoItems, items } from "../schema";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";
import { Photo } from "@shared/types/Photo";

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

  return getDatabase().transaction(async (tx) => {
    const parentItem = await tx
      .insert(items)
      .values({
        itemType: "photo",
        orderId: null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = await tx
      .insert(photoItems)
      .values({
        itemId: parentItem[0].id,
        templateId: input.templateId,
        createdAt: new Date().toISOString(),
        price: template[0].price,
        width: template[0].width,
        height: template[0].height,
        cost: template[0].cost,
        qty: input.qty,
        personName: input.personName || null,
        photoName: input.photoName || null,
      })
      .returning();

    return result[0];
  });
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

  return getDatabase().transaction(async (tx) => {
    const draftPhoto = await tx
      .select({ photo: photoItems, item: items })
      .from(photoItems)
      .innerJoin(items, eq(photoItems.itemId, items.id))
      .where(and(eq(photoItems.id, photoId), isNull(items.orderId)))
      .limit(1);

    if (draftPhoto.length === 0) {
      throw new Error("Draft photo not found");
    }

    const result = await tx
      .update(photoItems)
      .set({
        templateId: input.templateId,
        createdAt: new Date().toISOString(),
        price: template[0].price,
        width: template[0].width,
        height: template[0].height,
        qty: input.qty,
        personName: input.personName || null,
        photoName: input.photoName || null,
      })
      .where(eq(photoItems.id, photoId))
      .returning();

    return result[0];
  });
}

export async function getPhotosWithNoOrder(): Promise<Photo[]> {
  return getDatabase()
    .select({ photoItems: photoItems })
    .from(photoItems)
    .innerJoin(items, eq(photoItems.itemId, items.id))
    .where(isNull(items.orderId))
    .then((res) => res.map((r) => r.photoItems));
}

export async function deleteDraftPhoto(photoId: number): Promise<boolean> {
  return getDatabase().transaction(async (tx) => {
    const draft = await tx
      .select({ itemId: photoItems.itemId })
      .from(photoItems)
      .innerJoin(items, eq(photoItems.itemId, items.id))
      .where(and(eq(photoItems.id, photoId), isNull(items.orderId)))
      .limit(1);

    if (draft.length === 0) return false;

    const result = await tx
      .delete(items)
      .where(eq(items.id, draft[0].itemId))
      .execute();

    return result.rowsAffected > 0;
  });
}
