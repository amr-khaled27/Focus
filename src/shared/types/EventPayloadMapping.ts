import { User } from "./User";
import { PhotoTemplate } from "./PhotoTemplate";
import { Photo } from "./Photo";
import { PaperTemplate } from "./PaperTemplate";
import { PaperItem } from "./PaperItem";

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
    | { success: true; templates: PhotoTemplate[] }
    | { success: false; error: string };
  createPhotoTemplate:
    | { success: true; template: PhotoTemplate }
    | { success: false; error: string };
  editTemplate:
    | { success: true; template: PhotoTemplate }
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
    | { success: true; templates: PaperTemplate[] }
    | { success: false; error: string };
  createPaperTemplate:
    | { success: true; template: PaperTemplate }
    | { success: false; error: string };
  editPaperTemplate:
    | { success: true; template: PaperTemplate }
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

  // order routes
  finalizeOrder:
    | {
        success: true;
        order: { id: number; itemCount: number; total: number };
      }
    | { success: false; error: string };
};
