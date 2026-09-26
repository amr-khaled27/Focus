import {
  Stock,
  RecipeWithStock,
  TemplateRecipe,
  CreateStockInput,
  UpdateStockInput,
  CreateTemplateRecipeInput,
  UpdateTemplateRecipeInput,
} from "@shared/types/Inventory";

export type ApiResult<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export default interface StockState {
  stocks: Stock[];
  recipes: RecipeWithStock[];

  loadStocks: () => Promise<ApiResult<Stock[]>>;
  createStock: (stock: CreateStockInput) => Promise<ApiResult<Stock>>;
  editStock: (
    stockId: number,
    stock: UpdateStockInput,
  ) => Promise<ApiResult<Stock>>;
  deleteStock: (stockId: number) => Promise<ApiResult<void>>;
  adjustStockQuantity: (
    stockId: number,
    delta: number,
  ) => Promise<ApiResult<Stock>>;

  loadRecipesForTemplate: (
    templateType: string,
    templateId: number,
  ) => Promise<ApiResult<RecipeWithStock[]>>;
  createTemplateRecipe: (
    recipe: CreateTemplateRecipeInput,
  ) => Promise<ApiResult<TemplateRecipe>>;
  editTemplateRecipe: (
    recipeId: number,
    recipe: UpdateTemplateRecipeInput,
  ) => Promise<ApiResult<TemplateRecipe>>;
  deleteTemplateRecipe: (recipeId: number) => Promise<ApiResult<void>>;
  deleteRecipesForTemplate: (
    templateType: string,
    templateId: number,
  ) => Promise<ApiResult<void>>;
}
