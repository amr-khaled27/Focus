import { User } from "./User";
import { PhotoTemplateWithStock } from "./PhotoTemplate";
import { Photo } from "./Photo";
import { PaperTemplateWithStock } from "./PaperTemplate";
import { PaperItem } from "./PaperItem";
import { Stock, TemplateRecipe, RecipeWithStock } from "./Inventory";

export type EventPayloadMapping = {
  // auth routes
  getUsers: { success: boolean; users?: Omit<User, "pin">[]; error?: string };
  initAdmin: {
    success: boolean;
    user?: Omit<User, "pin" | "createdAt">;
    error?: string;
  };
  isAdminInitialized: {
    success: boolean;
    isInitialized: boolean;
    error?: string;
  };
  isUserAuthenticated: {
    success: boolean;
    authenticated: boolean;
    user: Omit<User, "pin"> | null;
    error?: string;
  };
  login: {
    success: boolean;
    user?: Omit<User, "pin" | "createdAt">;
    error?: string;
  };
  logout: { success: boolean; error?: string };

  // photo routes
  getPhotoTemplates:
    | { success: true; templates: PhotoTemplateWithStock[] }
    | { success: false; error: string };
  createPhotoTemplate:
    | { success: true; template: PhotoTemplateWithStock }
    | { success: false; error: string };
  editTemplate:
    | { success: true; template: PhotoTemplateWithStock }
    | { success: false; error: string };
  insertDraftPhoto:
    | { success: true; photo: Photo }
    | { success: false; error: string };
  editDraftPhoto:
    | { success: true; photo: Photo }
    | { success: false; error: string };
  getDraftPhotos:
    | { success: true; photos: Photo[] }
    | { success: false; error: string };
  deleteDraftPhoto: { success: true } | { success: false; error: string };

  // paper routes
  getPaperTemplates:
    | { success: true; templates: PaperTemplateWithStock[] }
    | { success: false; error: string };
  createPaperTemplate:
    | { success: true; template: PaperTemplateWithStock }
    | { success: false; error: string };
  editPaperTemplate:
    | { success: true; template: PaperTemplateWithStock }
    | { success: false; error: string };
  deletePaperTemplate: { success: true } | { success: false; error: string };
  insertDraftPaper:
    | { success: true; paperItem: PaperItem }
    | { success: false; error: string };
  editDraftPaper:
    | { success: true; paperItem: PaperItem }
    | { success: false; error: string };
  getDraftPaperItems:
    | { success: true; paperItems: PaperItem[] }
    | { success: false; error: string };
  deleteDraftPaper: { success: true } | { success: false; error: string };

  // inventory routes
  getStocks:
    | { success: true; stocks: Stock[] }
    | { success: false; error: string };
  getStockById:
    | { success: true; stock: Stock }
    | { success: false; error: string };
  createStock:
    | { success: true; stock: Stock }
    | { success: false; error: string };
  editStock:
    | { success: true; stock: Stock }
    | { success: false; error: string };
  deleteStock: { success: true } | { success: false; error: string };
  adjustStockQuantity:
    | { success: true; stock: Stock }
    | { success: false; error: string };

  getRecipesForTemplate:
    | { success: true; recipes: RecipeWithStock[] }
    | { success: false; error: string };
  createTemplateRecipe:
    | { success: true; recipe: TemplateRecipe }
    | { success: false; error: string };
  editTemplateRecipe:
    | { success: true; recipe: TemplateRecipe }
    | { success: false; error: string };
  deleteTemplateRecipe: { success: true } | { success: false; error: string };
  deleteRecipesForTemplate:
    | { success: true }
    | { success: false; error: string };

  // order routes
  finalizeOrder:
    | {
        success: true;
        order: { id: number; itemCount: number; total: number };
      }
    | { success: false; error: string };
};
