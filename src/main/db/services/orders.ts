import { isNull, eq, and, inArray } from "drizzle-orm";
import { getDatabase } from "../client";
import {
  photoItems,
  paperItems,
  items,
  orders,
  payments,
  sessions,
  templateRecipes,
  stocks,
} from "../schema";

type DraftLine = {
  templateType: "photo" | "paper";
  templateId: number;
  qty: number;
};

export async function finalizeDraftOrder(payload: {
  customerPaid: number;
}): Promise<{
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
      .select({ photo: photoItems, item: items })
      .from(photoItems)
      .innerJoin(items, eq(photoItems.itemId, items.id))
      .where(isNull(items.orderId));

    const draftPapers = await transaction
      .select({ paperItem: paperItems, item: items })
      .from(paperItems)
      .innerJoin(items, eq(paperItems.itemId, items.id))
      .where(isNull(items.orderId));

    if (draftPhotos.length === 0 && draftPapers.length === 0) {
      throw new Error("Draft batch is empty");
    }

    const photosTotal = draftPhotos.reduce(
      (sum, p) => sum + p.photo.price * p.photo.qty,
      0,
    );
    const papersTotal = draftPapers.reduce(
      (sum, p) => sum + p.paperItem.price * p.paperItem.qty,
      0,
    );
    const total = photosTotal + papersTotal;

    const status = payload.customerPaid >= total ? "paid" : "pending";

    // ------------------------------------------------------------
    // Stock consumption
    // ------------------------------------------------------------
    // Build the flat list of "what template, how many units" this
    // order is about to sell. Templates with no linked recipe rows
    // just won't show up in `neededByStock` below, which is the
    // whole mechanism for "some templates consume stock, some don't".
    const draftLines: DraftLine[] = [
      ...draftPhotos.map((p) => ({
        templateType: "photo" as const,
        templateId: p.photo.templateId,
        qty: p.photo.qty,
      })),
      ...draftPapers.map((p) => ({
        templateType: "paper" as const,
        templateId: p.paperItem.paperTemplateId,
        qty: p.paperItem.qty,
      })),
    ];

    if (draftLines.length > 0) {
      // Pull every recipe row relevant to the templates in this order.
      // (templateRecipes has no composite index to filter on cheaply,
      // so we grab by templateType and filter templateId in JS.)
      const photoTemplateIds = draftLines
        .filter((l) => l.templateType === "photo")
        .map((l) => l.templateId);
      const paperTemplateIds = draftLines
        .filter((l) => l.templateType === "paper")
        .map((l) => l.templateId);

      const recipeRows = await transaction
        .select()
        .from(templateRecipes)
        .where(
          and(
            eq(templateRecipes.templateType, "photo"),
            photoTemplateIds.length > 0
              ? inArray(templateRecipes.templateId, photoTemplateIds)
              : eq(templateRecipes.templateId, -1), // no-op, matches nothing
          ),
        );

      const paperRecipeRows =
        paperTemplateIds.length > 0
          ? await transaction
              .select()
              .from(templateRecipes)
              .where(
                and(
                  eq(templateRecipes.templateType, "paper"),
                  inArray(templateRecipes.templateId, paperTemplateIds),
                ),
              )
          : [];

      const allRecipes = [...recipeRows, ...paperRecipeRows];

      // Sum up total consumption per stockId across every draft line,
      // so a stock item that's used by multiple templates in this
      // order is checked against its combined demand.
      const neededByStock = new Map<number, number>();
      for (const line of draftLines) {
        const matching = allRecipes.filter(
          (r) =>
            r.templateType === line.templateType &&
            r.templateId === line.templateId,
        );
        for (const recipe of matching) {
          const needed = recipe.quantityUsed * line.qty;
          neededByStock.set(
            recipe.stockId,
            (neededByStock.get(recipe.stockId) || 0) + needed,
          );
        }
      }

      if (neededByStock.size > 0) {
        const stockIds = Array.from(neededByStock.keys());
        const stockRows = await transaction
          .select()
          .from(stocks)
          .where(inArray(stocks.id, stockIds));

        const stockById = new Map(stockRows.map((s) => [s.id, s]));

        // Validate first - if anything would go negative, bail out
        // before writing anything, so the whole order fails cleanly.
        for (const [stockId, needed] of neededByStock) {
          const stock = stockById.get(stockId);
          if (!stock) continue; // linked stock item was deleted; nothing to check
          if (stock.quantityOnHand < needed) {
            throw new Error(
              `Insufficient stock for "${stock.name}": need ${needed} ${stock.unit}, only ${stock.quantityOnHand} available`,
            );
          }
        }

        // All good - deduct.
        for (const [stockId, needed] of neededByStock) {
          const stock = stockById.get(stockId);
          if (!stock) continue;
          await transaction
            .update(stocks)
            .set({ quantityOnHand: stock.quantityOnHand - needed })
            .where(eq(stocks.id, stockId));
        }
      }
    }

    const orderResult = await transaction
      .insert(orders)
      .values({
        createdAt: new Date().toISOString(),
        userId: session[0].userId,
        total,
        status,
      })
      .returning();
    const order = orderResult[0];

    await transaction.insert(payments).values({
      type: "order",
      orderId: order.id,
      userId: session[0].userId,
      amount: payload.customerPaid,
      createdAt: new Date().toISOString(),
    });

    // Attach all unassigned items to this order
    await transaction
      .update(items)
      .set({ orderId: order.id })
      .where(isNull(items.orderId));

    const totalItemCount =
      draftPhotos.reduce((sum, p) => sum + p.photo.qty, 0) +
      draftPapers.reduce((sum, p) => sum + p.paperItem.qty, 0);

    return {
      id: order.id,
      itemCount: totalItemCount,
      total,
    };
  });
}
