import { isNull, eq } from "drizzle-orm";
import { getDatabase } from "../client";
import {
  photoItems,
  paperItems,
  items,
  orders,
  payments,
  sessions,
} from "../schema";

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
