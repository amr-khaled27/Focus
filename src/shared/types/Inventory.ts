// Shared inventory types, used by both the main-process db/service layer
// and the renderer (zustand store + pages). Keep this file as the single
// source of truth for the Stock / TemplateRecipe shapes so the two sides
// never drift apart on field names again.

export interface Stock {
  id: number;
  name: string;
  quantityOnHand: number;
  reorderLevel: number | null;
  unit: string;
  costPerUnit: number;
}

export type CreateStockInput = {
  name: string;
  quantityOnHand: number;
  reorderLevel?: number | null;
  unit: string;
  costPerUnit: number;
};

export type UpdateStockInput = Partial<CreateStockInput>;

export interface TemplateRecipe {
  id: number;
  stockId: number;
  templateType: string;
  templateId: number;
  quantityUsed: number;
}

// A recipe row joined with the stock item it consumes, as returned by
// getRecipesForTemplate.
export type RecipeWithStock = TemplateRecipe & { stock: Stock };

export type CreateTemplateRecipeInput = {
  stockId: number;
  templateType: string;
  templateId: number;
  quantityUsed?: number;
};

export type UpdateTemplateRecipeInput = Partial<
  Omit<CreateTemplateRecipeInput, "templateType" | "templateId">
>;
