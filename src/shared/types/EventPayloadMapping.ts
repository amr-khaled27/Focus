import { User } from "./User";
import { PhotoTemplate } from "./PhotoTemplate";
import { Photo } from "./Photo";

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
    | { success: true; template: Omit<PhotoTemplate, "id"> }
    | { success: false; error: string };
  editTemplate:
    | { success: true; template: PhotoTemplate }
    | { success: false; error: string };
  insertDraftPhoto:
    | { success: true; photo: Omit<Photo, "id"> }
    | { success: false; error: string };
  editDraftPhoto:
    | { success: true; photo: Omit<Photo, "id"> }
    | { success: false; error: string };
  getDraftPhotos:
    | { success: true; photos: Omit<Photo, "id">[] }
    | { success: false; error: string };
  deleteDraftPhoto: { success: true } | { success: false; error: string };
  finalizeOrder:
    | {
        success: true;
        order: { orderId: number; itemCount: number; total: number };
      }
    | { success: false; error: string };
};
