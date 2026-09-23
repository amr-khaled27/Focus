import { and, eq, isNull } from "drizzle-orm";
import { getDatabase } from "../client";
import { paperTemplates, paperItems, items, sessions } from "../schema";

export async function getPaperTemplates() {
  return getDatabase().select().from(paperTemplates);
}

export async function createPaperTemplate(input: {
  name: string;
  type: string;
  width: number;
  height: number;
  cost: number;
  price: number;
}) {
  const result = await getDatabase()
    .insert(paperTemplates)
    .values(input)
    .returning();
  return result[0];
}

export async function editPaperTemplate(
  templateId: number,
  input: {
    name: string;
    type: string;
    width: number;
    height: number;
    cost: number;
    price: number;
  },
) {
  const result = await getDatabase()
    .update(paperTemplates)
    .set(input)
    .where(eq(paperTemplates.id, templateId))
    .returning();

  if (result.length === 0) {
    throw new Error("Paper template not found");
  }
  return result[0];
}

export async function deletePaperTemplate(
  templateId: number,
): Promise<boolean> {
  const result = await getDatabase()
    .delete(paperTemplates)
    .where(eq(paperTemplates.id, templateId))
    .execute();

  return result.rowsAffected > 0;
}

export async function insertDraftPaper(input: {
  paperTemplateId: number;
  qty: number;
}) {
  const session = await getDatabase().select().from(sessions).limit(1);
  if (session.length === 0) {
    throw new Error("No authenticated user");
  }

  const template = await getDatabase()
    .select()
    .from(paperTemplates)
    .where(eq(paperTemplates.id, input.paperTemplateId))
    .limit(1);

  if (template.length === 0) {
    throw new Error("Paper template not found");
  }

  return getDatabase().transaction(async (tx) => {
    const parentItem = await tx
      .insert(items)
      .values({
        itemType: "paper",
        orderId: null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = await tx
      .insert(paperItems)
      .values({
        createdAt: new Date().toISOString(),
        itemId: parentItem[0].id,
        paperTemplateId: input.paperTemplateId,
        price: template[0].price,
        cost: template[0].cost,
        qty: input.qty,
        addedBy: session[0].userId,
      })
      .returning();

    return result[0];
  });
}

export async function getPaperItemsWithNoOrder() {
  return getDatabase()
    .select({ paperItems: paperItems })
    .from(paperItems)
    .innerJoin(items, eq(paperItems.itemId, items.id))
    .where(isNull(items.orderId))
    .then((res) => res.map((r) => r.paperItems));
}

export async function editDraftPaper(
  paperItemId: number,
  input: {
    paperTemplateId: number;
    qty: number;
  },
) {
  const template = await getDatabase()
    .select()
    .from(paperTemplates)
    .where(eq(paperTemplates.id, input.paperTemplateId))
    .limit(1);

  if (template.length === 0) {
    throw new Error("Paper template not found");
  }

  return getDatabase().transaction(async (tx) => {
    const draftPaper = await tx
      .select({ paperItem: paperItems, item: items })
      .from(paperItems)
      .innerJoin(items, eq(paperItems.itemId, items.id))
      .where(and(eq(paperItems.id, paperItemId), isNull(items.orderId)))
      .limit(1);

    if (draftPaper.length === 0) {
      throw new Error("Draft paper item not found");
    }

    const result = await tx
      .update(paperItems)
      .set({
        paperTemplateId: input.paperTemplateId,
        price: template[0].price,
        cost: template[0].cost,
        qty: input.qty,
      })
      .where(eq(paperItems.id, paperItemId))
      .returning();

    return result[0];
  });
}

export async function deleteDraftPaper(paperItemId: number): Promise<boolean> {
  return getDatabase().transaction(async (tx) => {
    const draft = await tx
      .select({ itemId: paperItems.itemId })
      .from(paperItems)
      .innerJoin(items, eq(paperItems.itemId, items.id))
      .where(and(eq(paperItems.id, paperItemId), isNull(items.orderId)))
      .limit(1);

    if (draft.length === 0) return false;

    const result = await tx
      .delete(items)
      .where(eq(items.id, draft[0].itemId))
      .execute();

    return result.rowsAffected > 0;
  });
}
