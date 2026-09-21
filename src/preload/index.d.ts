import { ElectronAPI } from "@electron-toolkit/preload";
import { User } from "@shared/types/User";
import { Photo } from "@shared/types/Photo";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";

type unsubscribe = () => void;

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUsers: () => Promise<Omit<User, "pin">[]>;
      isAdminInitialized: () => Promise<boolean>;
      initAdmin: (payload: {
        name: string;
        email: string;
        pin: string;
      }) => Promise<
        | {
            success: true;
            user: Pick<User, "id" | "name" | "email" | "role">;
          }
        | { success: false; error: string }
      >;
      isUserAuthenticated: () => Promise<{
        authenticated: boolean;
        user: Omit<User, "pin"> | null;
      }>;
      login: (payload: { userId: number; pin: string }) => Promise<
        | {
            success: true;
            user: Pick<User, "id" | "name" | "email" | "role">;
          }
        | { success: false; error: string }
      >;
      logout: () => Promise<{ success: boolean }>;
      getPhotoTemplates: () => Promise<
        | { success: true; templates: PhotoTemplate[] }
        | { success: false; error: string }
      >;
      createPhotoTemplate: (
        payload: Omit<PhotoTemplate, "id">,
      ) => Promise<
        | { success: true; template: PhotoTemplate }
        | { success: false; error: string }
      >;
      editTemplate: (
        templateId: number,
        payload: Omit<PhotoTemplate, "id">,
      ) => Promise<
        | { success: true; template: PhotoTemplate }
        | { success: false; error: string }
      >;
      insertDraftPhoto: (payload: {
        templateId: number;
        personName?: string | null;
        photoName?: string | null;
        qty: number;
      }) => Promise<
        { success: true; photo: Photo } | { success: false; error: string }
      >;
      editDraftPhoto: (
        photoId: number,
        payload: {
          templateId: number;
          personName?: string | null;
          photoName?: string | null;
          qty: number;
        },
      ) => Promise<
        { success: true; photo: Photo } | { success: false; error: string }
      >;
      getDraftPhotos: () => Promise<
        { success: true; photos: Photo[] } | { success: false; error: string }
      >;
      deleteDraftPhoto: (
        photoId: number,
      ) => Promise<{ success: true } | { success: false; error: string }>;
      finalizeOrder: ({ customerPaid }: { customerPaid: number }) => Promise<
        | {
            success: true;
            order: { id: number; itemCount: number; total: number };
          }
        | { success: false; error: string }
      >;
    };
  }
}
