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

// Stock consumption at checkout time now lives entirely in
// finalizeDraftOrder (db/services/orders.ts). That function aggregates
// demand per stock item across every draft line and validates
// sufficiency before deducting anything, which this module's earlier
// per-item helpers didn't do - so it's the only stock-deduction path
// left, rather than two paths that could drift out of sync.
