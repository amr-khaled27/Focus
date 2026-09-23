import { ElectronAPI } from "@electron-toolkit/preload";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";
import { PaperTemplate } from "@shared/types/PaperTemplate";
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
        EventPayloadMapping["getPhotoTemplates"]
      >;
      createPhotoTemplate: (
        payload: Omit<PhotoTemplate, "id">,
      ) => Promise<EventPayloadMapping["createPhotoTemplate"]>;
      editTemplate: (
        templateId: number,
        payload: Omit<PhotoTemplate, "id">,
      ) => Promise<EventPayloadMapping["editTemplate"]>;
      insertDraftPhoto: (payload: {
        templateId: number;
        personName?: string | null;
        photoName?: string | null;
        qty: number;
      }) => Promise<EventPayloadMapping["insertDraftPhoto"]>;
      editDraftPhoto: (
        photoId: number,
        payload: {
          templateId: number;
          personName?: string | null;
          photoName?: string | null;
          qty: number;
        },
      ) => Promise<EventPayloadMapping["editDraftPhoto"]>;
      getDraftPhotos: () => Promise<EventPayloadMapping["getDraftPhotos"]>;
      deleteDraftPhoto: (
        photoId: number,
      ) => Promise<EventPayloadMapping["deleteDraftPhoto"]>;

      // paper
      getPaperTemplates: () => Promise<
        EventPayloadMapping["getPaperTemplates"]
      >;
      createPaperTemplate: (
        payload: Omit<PaperTemplate, "id">,
      ) => Promise<EventPayloadMapping["createPaperTemplate"]>;
      editPaperTemplate: (
        templateId: number,
        payload: Omit<PaperTemplate, "id">,
      ) => Promise<EventPayloadMapping["editPaperTemplate"]>;
      deletePaperTemplate: (
        templateId: number,
      ) => Promise<EventPayloadMapping["deletePaperTemplate"]>;
      insertDraftPaperItem: (payload: {
        paperTemplateId: number;
        qty: number;
      }) => Promise<EventPayloadMapping["insertDraftPaperItem"]>;
      editDraftPaperItem: (
        paperItemId: number,
        payload: {
          paperTemplateId: number;
          qty: number;
        },
      ) => Promise<EventPayloadMapping["editDraftPaperItem"]>;
      getDraftPaperItems: () => Promise<
        EventPayloadMapping["getDraftPaperItems"]
      >;
      deleteDraftPaperItem: (
        paperItemId: number,
      ) => Promise<EventPayloadMapping["deleteDraftPaperItem"]>;

      // orders
      finalizeOrder: ({
        customerPaid,
      }: {
        customerPaid: number;
      }) => Promise<EventPayloadMapping["finalizeOrder"]>;
    };
  }
}
