import { and, eq } from "drizzle-orm";
import { getDatabase } from "../client";
import { stocks, templateRecipes } from "../schema";
import {
  Stock,
  TemplateRecipe,
  RecipeWithStock,
  CreateStockInput,
  UpdateStockInput,
  CreateTemplateRecipeInput,
  UpdateTemplateRecipeInput,
} from "@shared/types/Inventory";

// ==========================================
// Stock CRUD Operations
// ==========================================

export async function getStocks(): Promise<Stock[]> {
  return getDatabase().select().from(stocks);
}

export async function getStockById(stockId: number): Promise<Stock | null> {
  const result = await getDatabase()
    .select()
    .from(stocks)
    .where(eq(stocks.id, stockId))
    .limit(1);

  return result[0] || null;
}

export async function createStock(input: CreateStockInput): Promise<Stock> {
  const result = await getDatabase().insert(stocks).values(input).returning();

  return result[0];
}

export async function editStock(
  stockId: number,
  input: UpdateStockInput,
): Promise<Stock> {
  const result = await getDatabase()
    .update(stocks)
    .set(input)
    .where(eq(stocks.id, stockId))
    .returning();

  if (result.length === 0) {
    throw new Error("Stock item not found");
  }

  return result[0];
}

export async function deleteStock(stockId: number): Promise<boolean> {
  const result = await getDatabase()
    .delete(stocks)
    .where(eq(stocks.id, stockId))
    .returning();

  return result.length > 0;
}

export async function adjustStockQuantity(
  stockId: number,
  delta: number,
): Promise<Stock> {
  const existingStock = await getStockById(stockId);
  if (!existingStock) {
    throw new Error("Stock item not found");
  }

  const updatedQuantity = existingStock.quantityOnHand + delta;

  const result = await getDatabase()
    .update(stocks)
    .set({ quantityOnHand: updatedQuantity })
    .where(eq(stocks.id, stockId))
    .returning();

  return result[0];
}

// ==========================================
// Template Recipe Operations
// ==========================================

export async function getRecipesForTemplate(
  templateType: string,
  templateId: number,
): Promise<RecipeWithStock[]> {
  const rows = await getDatabase()
    .select({
      recipe: templateRecipes,
      stock: stocks,
    })
    .from(templateRecipes)
    .innerJoin(stocks, eq(templateRecipes.stockId, stocks.id))
    .where(
      and(
        eq(templateRecipes.templateType, templateType),
        eq(templateRecipes.templateId, templateId),
      ),
    );

  return rows.map((r) => ({
    ...r.recipe,
    stock: r.stock,
  }));
}

export async function createTemplateRecipe(
  input: CreateTemplateRecipeInput,
): Promise<TemplateRecipe> {
  const stockExists = await getStockById(input.stockId);
  if (!stockExists) {
    throw new Error("Target stock item does not exist");
  }

  const result = await getDatabase()
    .insert(templateRecipes)
    .values(input)
    .returning();

  return result[0];
}

export async function editTemplateRecipe(
  recipeId: number,
  input: UpdateTemplateRecipeInput,
): Promise<TemplateRecipe> {
  const result = await getDatabase()
    .update(templateRecipes)
    .set(input)
    .where(eq(templateRecipes.id, recipeId))
    .returning();

  if (result.length === 0) {
    throw new Error("Template recipe not found");
  }

  return result[0];
}

export async function deleteTemplateRecipe(recipeId: number): Promise<boolean> {
  const result = await getDatabase()
    .delete(templateRecipes)
    .where(eq(templateRecipes.id, recipeId))
    .returning();

  return result.length > 0;
}

export async function deleteRecipesForTemplate(
  templateType: string,
  templateId: number,
): Promise<boolean> {
  const result = await getDatabase()
    .delete(templateRecipes)
    .where(
      and(
        eq(templateRecipes.templateType, templateType),
        eq(templateRecipes.templateId, templateId),
      ),
    )
    .returning();

  return result.length > 0;
}

// ==========================================
// Stock Consumption (call this at checkout time)
// ==========================================

/**
 * Deducts stock for one finalized order item, based on whatever recipe
 * rows exist for its template. A template with no recipe rows (i.e. one
 * that was never linked to stock) is a no-op here - that's the whole
 * mechanism for "some templates consume stock, some don't".
 *
 * `qty` is however many units of the template were sold in this item
 * (e.g. the photo/paper item's `qty` field).
 *
 * Standalone version, for callers that are NOT already inside a
 * transaction. If you're deducting stock as part of a larger operation
 * (like finalizing an order), use `consumeStockForItemTx` instead so the
 * deduction is atomic with everything else in that operation.
 */
export async function consumeStockForItem(
  templateType: string,
  templateId: number,
  qty: number,
): Promise<void> {
  const recipes = await getRecipesForTemplate(templateType, templateId);

  for (const recipe of recipes) {
    await adjustStockQuantity(recipe.stockId, -(recipe.quantityUsed * qty));
  }
}

// The type of the `tx` callback parameter drizzle passes into
// `getDatabase().transaction(async (tx) => { ... })`. Deriving it this way
// keeps it correct regardless of which sqlite driver `getDatabase` wraps.
type Transaction = Parameters<
  Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]
>[0];

/**
 * Same deduction as `consumeStockForItem`, but runs against an
 * in-progress transaction (`tx`) instead of a fresh connection, so it
 * commits or rolls back together with whatever else that transaction is
 * doing - e.g. call this once per item inside `finalizeDraftOrder`'s
 * transaction, right alongside creating the order and payment rows.
 */
export async function consumeStockForItemTx(
  tx: Transaction,
  templateType: string,
  templateId: number,
  qty: number,
): Promise<void> {
  const recipeRows = await tx
    .select()
    .from(templateRecipes)
    .where(
      and(
        eq(templateRecipes.templateType, templateType),
        eq(templateRecipes.templateId, templateId),
      ),
    );

  for (const recipe of recipeRows) {
    const stockRows = await tx
      .select()
      .from(stocks)
      .where(eq(stocks.id, recipe.stockId))
      .limit(1);

    const stock = stockRows[0];
    if (!stock) continue; // linked stock item was deleted; nothing to deduct

    await tx
      .update(stocks)
      .set({
        quantityOnHand: stock.quantityOnHand - recipe.quantityUsed * qty,
      })
      .where(eq(stocks.id, recipe.stockId));
  }
}
