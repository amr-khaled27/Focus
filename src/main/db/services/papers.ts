import { and, eq, isNull } from "drizzle-orm";
import { getDatabase } from "../client";
import {
  paperTemplates,
  paperItems,
  items,
  sessions,
  templateRecipes,
} from "../schema";
import {
  PaperTemplateInput,
  PaperTemplateWithStock,
} from "@shared/types/PaperTemplate";

const TEMPLATE_TYPE = "paper";

export async function getPaperTemplates(): Promise<PaperTemplateWithStock[]> {
  // Left join so templates with no recipe row still come back, with
  // stockLink: null. Assumes at most one recipe row per template, which
  // is what createPaperTemplate/editPaperTemplate below now enforce.
  const rows = await getDatabase()
    .select({ template: paperTemplates, recipe: templateRecipes })
    .from(paperTemplates)
    .leftJoin(
      templateRecipes,
      and(
        eq(templateRecipes.templateId, paperTemplates.id),
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

export async function createPaperTemplate(
  input: PaperTemplateInput,
): Promise<PaperTemplateWithStock> {
  const { stockLink, ...templateFields } = input;

  return getDatabase().transaction(async (tx) => {
    const result = await tx
      .insert(paperTemplates)
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

export async function editPaperTemplate(
  templateId: number,
  input: PaperTemplateInput,
): Promise<PaperTemplateWithStock> {
  const { stockLink, ...templateFields } = input;

  return getDatabase().transaction(async (tx) => {
    const result = await tx
      .update(paperTemplates)
      .set(templateFields)
      .where(eq(paperTemplates.id, templateId))
      .returning();

    if (result.length === 0) {
      throw new Error("Paper template not found");
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
