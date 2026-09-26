import { and, eq, isNull } from "drizzle-orm";
import { getDatabase } from "../client";
import { photoTemplates, photoItems, items, templateRecipes } from "../schema";
import {
  PhotoTemplateInput,
  PhotoTemplateWithStock,
} from "@shared/types/PhotoTemplate";
import { Photo } from "@shared/types/Photo";

const TEMPLATE_TYPE = "photo";

export async function getPhotoTemplates(): Promise<PhotoTemplateWithStock[]> {
  // Left join so templates with no recipe row still come back, with
  // stockLink: null. Assumes at most one recipe row per template, which
  // is what createPhotoTemplate/editTemplate below now enforce.
  const rows = await getDatabase()
    .select({ template: photoTemplates, recipe: templateRecipes })
    .from(photoTemplates)
    .leftJoin(
      templateRecipes,
      and(
        eq(templateRecipes.templateId, photoTemplates.id),
        eq(templateRecipes.templateType, TEMPLATE_TYPE),
      ),
    );

  return rows.map((r) => ({
    ...r.template,
    stockLink: r.recipe
      ? { stockId: r.recipe.stockId, quantityUsed: r.recipe.quantityUsed }
      : null,
  }));
}

export async function createPhotoTemplate(
  input: PhotoTemplateInput,
): Promise<PhotoTemplateWithStock> {
  const { stockLink, ...templateFields } = input;

  return getDatabase().transaction(async (tx) => {
    const result = await tx
      .insert(photoTemplates)
      .values(templateFields)
      .returning();
    const template = result[0];

    if (stockLink) {
      await tx.insert(templateRecipes).values({
        stockId: stockLink.stockId,
        templateType: TEMPLATE_TYPE,
        templateId: template.id,
        quantityUsed: stockLink.quantityUsed,
      });
    }

    return { ...template, stockLink };
  });
}

export async function editTemplate(
  templateId: number,
  input: PhotoTemplateInput,
): Promise<PhotoTemplateWithStock> {
  const { stockLink, ...templateFields } = input;

  return getDatabase().transaction(async (tx) => {
    const result = await tx
      .update(photoTemplates)
      .set(templateFields)
      .where(eq(photoTemplates.id, templateId))
      .returning();

    if (result.length === 0) {
      throw new Error("Photo template not found");
    }
    const template = result[0];

    // Replace whatever recipe link existed before with the modal's
    // current choice. Covers "kept the same link", "changed stock or
    // qty", and "switched to outsourced" with one code path.
    await tx
      .delete(templateRecipes)
      .where(
        and(
          eq(templateRecipes.templateType, TEMPLATE_TYPE),
          eq(templateRecipes.templateId, templateId),
        ),
      );

    if (stockLink) {
      await tx.insert(templateRecipes).values({
        stockId: stockLink.stockId,
        templateType: TEMPLATE_TYPE,
        templateId,
        quantityUsed: stockLink.quantityUsed,
      });
    }

    return { ...template, stockLink };
  });
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
