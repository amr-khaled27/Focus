import { ElectronAPI } from "@electron-toolkit/preload";
import { Photo } from "@shared/types/Photo";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";
import { EventPayloadMapping } from "@shared/types/EventPayloadMapping";

type unsubscribe = () => void;

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      // auth
      getUsers: () => Promise<EventPayloadMapping["getUsers"]>;
      initAdmin: (payload: {
        name: string;
        email: string;
        pin: string;
      }) => Promise<EventPayloadMapping["initAdmin"]>;
      isAdminInitialized: () => Promise<
        EventPayloadMapping["isAdminInitialized"]
      >;
      isUserAuthenticated: () => Promise<
        EventPayloadMapping["isUserAuthenticated"]
      >;
      login: (payload: {
        userId: number;
        pin: string;
      }) => Promise<EventPayloadMapping["login"]>;
      logout: () => Promise<EventPayloadMapping["logout"]>;

      // photo
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
