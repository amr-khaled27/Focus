import { create } from "zustand";
import PhotosState from "@renderer/interfaces/PhotosInterface";

const usePhotosStore = create<PhotosState>((set) => ({
  templates: [],
  draftPhotos: [],

  loadTemplates: async () => {
    const response = await window.api.getPhotoTemplates();
    if (!response.success) return response;
    set({ templates: response.templates });
    return { success: true, value: response.templates };
  },

  createTemplate: async (template) => {
    const response = await window.api.createPhotoTemplate(template);
    if (!response.success) return response;
    set((state) => ({ templates: [...state.templates, response.template] }));
    return { success: true, value: response.template };
  },

  editTemplate: async (templateId, template) => {
    const response = await window.api.editTemplate(templateId, template);
    if (!response.success) return response;
    set((state) => ({
      templates: state.templates.map((item) =>
        item.id === templateId ? response.template : item,
      ),
    }));
    return { success: true, value: response.template };
  },

  addDraftPhoto: async (input) => {
    const response = await window.api.insertDraftPhoto(input);
    if (!response.success) return response;
    set((state) => ({ draftPhotos: [...state.draftPhotos, response.photo] }));
    return { success: true, value: response.photo };
  },

  deleteDraftPhoto: async (photoId) => {
    const response = await window.api.deleteDraftPhoto(photoId);
    if (!response.success) return response;
    set((state) => ({
      draftPhotos: state.draftPhotos.filter((photo) => photo.id !== photoId),
    }));
    return { success: true, value: undefined };
  },

  editDraftPhoto: async (photoId, input) => {
    const response = await window.api.editDraftPhoto(photoId, input);
    if (!response.success) return response;
    set((state) => ({
      draftPhotos: state.draftPhotos.map((photo) =>
        photo.id === photoId ? response.photo : photo,
      ),
    }));
    return { success: true, value: response.photo };
  },

  loadDraftPhotos: async () => {
    const response = await window.api.getDraftPhotos();
    if (!response.success) return response;
    set({ draftPhotos: response.photos });
    return { success: true, value: response.photos };
  },

  finalizeOrder: async ({ customerPaid }) => {
    const response = await window.api.finalizeOrder({ customerPaid });
    if (!response.success) return response;
    set({ draftPhotos: [] });
    return {
      success: true,
      value: {
        id: response.order.orderId,
        itemCount: response.order.itemCount,
        total: response.order.total,
      },
    };
  },
}));

export default usePhotosStore;
