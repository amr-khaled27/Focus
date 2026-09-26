import { create } from "zustand";
import StockState from "@renderer/interfaces/StockInterface";

const useStockStore = create<StockState>((set) => ({
  stocks: [],
  recipes: [],

  loadStocks: async () => {
    const response = await window.api.getStocks();
    if (!response.success) return response;
    set({ stocks: response.stocks });
    return { success: true, value: response.stocks };
  },

  createStock: async (stock) => {
    const response = await window.api.createStock(stock);
    if (!response.success) return response;
    set((state) => ({ stocks: [...state.stocks, response.stock] }));
    return { success: true, value: response.stock };
  },

  editStock: async (stockId, stock) => {
    const response = await window.api.editStock(stockId, stock);
    if (!response.success) return response;
    set((state) => ({
      stocks: state.stocks.map((item) =>
        item.id === stockId ? response.stock : item,
      ),
    }));
    return { success: true, value: response.stock };
  },

  deleteStock: async (stockId) => {
    const response = await window.api.deleteStock(stockId);
    if (!response.success) return response;
    set((state) => ({
      stocks: state.stocks.filter((item) => item.id !== stockId),
    }));
    return { success: true, value: undefined };
  },

  adjustStockQuantity: async (stockId, delta) => {
    const response = await window.api.adjustStockQuantity(stockId, delta);
    if (!response.success) return response;
    set((state) => ({
      stocks: state.stocks.map((item) =>
        item.id === stockId ? response.stock : item,
      ),
    }));
    return { success: true, value: response.stock };
  },

  loadRecipesForTemplate: async (templateType, templateId) => {
    const response = await window.api.getRecipesForTemplate(
      templateType,
      templateId,
    );
    if (!response.success) return response;
    set({ recipes: response.recipes });
    return { success: true, value: response.recipes };
  },

  createTemplateRecipe: async (recipe) => {
    const response = await window.api.createTemplateRecipe(recipe);
    if (!response.success) return response;

    // Fetch updated recipes list to keep RecipeWithStock join object intact
    const recipesResponse = await window.api.getRecipesForTemplate(
      recipe.templateType,
      recipe.templateId,
    );
    if (recipesResponse.success) {
      set({ recipes: recipesResponse.recipes });
    }

    return { success: true, value: response.recipe };
  },

  editTemplateRecipe: async (recipeId, recipe) => {
    const response = await window.api.editTemplateRecipe(recipeId, recipe);
    if (!response.success) return response;

    set((state) => ({
      recipes: state.recipes.map((item) =>
        item.id === recipeId ? { ...item, ...response.recipe } : item,
      ),
    }));

    return { success: true, value: response.recipe };
  },

  deleteTemplateRecipe: async (recipeId) => {
    const response = await window.api.deleteTemplateRecipe(recipeId);
    if (!response.success) return response;
    set((state) => ({
      recipes: state.recipes.filter((item) => item.id !== recipeId),
    }));
    return { success: true, value: undefined };
  },

  deleteRecipesForTemplate: async (templateType, templateId) => {
    const response = await window.api.deleteRecipesForTemplate(
      templateType,
      templateId,
    );
    if (!response.success) return response;
    set({ recipes: [] });
    return { success: true, value: undefined };
  },
}));

export default useStockStore;
