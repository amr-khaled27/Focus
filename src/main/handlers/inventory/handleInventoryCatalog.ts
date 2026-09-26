import isTrustedSender from "@main/utils/isTrustedSender";
import {
  adjustStockQuantity,
  createStock,
  createTemplateRecipe,
  deleteRecipesForTemplate,
  deleteStock,
  deleteTemplateRecipe,
  editStock,
  editTemplateRecipe,
  getRecipesForTemplate,
  getStockById,
  getStocks,
} from "@main/db/services/inventory";
import {
  CreateStockInput,
  UpdateStockInput,
  CreateTemplateRecipeInput,
  UpdateTemplateRecipeInput,
} from "@shared/types/Inventory";
import { handle } from "@main/utils/handle";

export default function handleInventoryCatalog(
  mainWindow: Electron.BrowserWindow | null,
) {
  // ==========================================
  // Stock Handlers
  // ==========================================

  handle(mainWindow, "getStocks", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, stocks: await getStocks() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحميل المخزون",
      };
    }
  });

  handle(mainWindow, "getStockById", async (event, ...args: unknown[]) => {
    const stockId = args[0] as number;
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      const stock = await getStockById(stockId);
      return stock
        ? { success: true, stock }
        : { success: false, error: "عنصر المخزون غير موجود" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل جلب عنصر المخزون",
      };
    }
  });

  handle(mainWindow, "createStock", async (event, ...args: unknown[]) => {
    const payload = args[0] as CreateStockInput;
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, stock: await createStock(payload) };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "فشل إضافة عنصر المخزون",
      };
    }
  });

  handle(mainWindow, "editStock", async (event, ...args: unknown[]) => {
    const [stockId, payload] = args as [number, UpdateStockInput];
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return {
        success: true,
        stock: await editStock(stockId, payload),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "فشل تعديل عنصر المخزون",
      };
    }
  });

  handle(mainWindow, "deleteStock", async (event, ...args: unknown[]) => {
    const stockId = args[0] as number;
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      const deleted = await deleteStock(stockId);
      return deleted
        ? { success: true }
        : { success: false, error: "عنصر المخزون غير موجود" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل حذف عنصر المخزون",
      };
    }
  });

  handle(
    mainWindow,
    "adjustStockQuantity",
    async (event, ...args: unknown[]) => {
      const [stockId, delta] = args as [number, number];
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        return {
          success: true,
          stock: await adjustStockQuantity(stockId, delta),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "فشل تعديل كمية المخزون",
        };
      }
    },
  );

  // ==========================================
  // Template Recipe Handlers
  // ==========================================

  handle(
    mainWindow,
    "getRecipesForTemplate",
    async (event, ...args: unknown[]) => {
      const [templateType, templateId] = args as [string, number];
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        return {
          success: true,
          recipes: await getRecipesForTemplate(templateType, templateId),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "فشل تحميل الوصفة",
        };
      }
    },
  );

  handle(
    mainWindow,
    "createTemplateRecipe",
    async (event, ...args: unknown[]) => {
      const payload = args[0] as CreateTemplateRecipeInput;
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        return {
          success: true,
          recipe: await createTemplateRecipe(payload),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "فشل ربط المخزون بالقالب",
        };
      }
    },
  );

  handle(
    mainWindow,
    "editTemplateRecipe",
    async (event, ...args: unknown[]) => {
      const [recipeId, payload] = args as [number, UpdateTemplateRecipeInput];
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        return {
          success: true,
          recipe: await editTemplateRecipe(recipeId, payload),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "فشل تعديل ربط المخزون",
        };
      }
    },
  );

  handle(
    mainWindow,
    "deleteTemplateRecipe",
    async (event, ...args: unknown[]) => {
      const recipeId = args[0] as number;
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        const deleted = await deleteTemplateRecipe(recipeId);
        return deleted
          ? { success: true }
          : { success: false, error: "الربط غير موجود" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "فشل حذف ربط المخزون",
        };
      }
    },
  );

  handle(
    mainWindow,
    "deleteRecipesForTemplate",
    async (event, ...args: unknown[]) => {
      const [templateType, templateId] = args as [string, number];
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        await deleteRecipesForTemplate(templateType, templateId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "فشل حذف وصفات القالب",
        };
      }
    },
  );
}
