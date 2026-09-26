import { create } from "zustand";
import PaperState from "@renderer/interfaces/PaperInterface";

const usePaperStore = create<PaperState>((set) => ({
  paperTemplates: [],
  draftPaperItems: [],

  loadPaperTemplates: async () => {
    const response = await window.api.getPaperTemplates();
    if (!response.success) return response;
    set({ paperTemplates: response.templates });
    return { success: true, value: response.templates };
  },

  createPaperTemplate: async (template) => {
    const response = await window.api.createPaperTemplate(template);
    if (!response.success) return response;
    set((state) => ({
      paperTemplates: [...state.paperTemplates, response.template],
    }));
    return { success: true, value: response.template };
  },

  editPaperTemplate: async (templateId, template) => {
    const response = await window.api.editPaperTemplate(templateId, template);
    if (!response.success) return response;
    set((state) => ({
      paperTemplates: state.paperTemplates.map((item) =>
        item.id === templateId ? response.template : item,
      ),
    }));
    return { success: true, value: response.template };
  },

  deletePaperTemplate: async (templateId) => {
    const response = await window.api.deletePaperTemplate(templateId);
    if (!response.success) return response;
    set((state) => ({
      paperTemplates: state.paperTemplates.filter(
        (item) => item.id !== templateId,
      ),
    }));
    return { success: true, value: undefined };
  },

  addDraftPaperItem: async (input) => {
    console.log("inserting paper item");
    const response = await window.api.insertDraftPaperItem(input);
    if (!response.success) return response;
    set((state) => ({
      draftPaperItems: [...state.draftPaperItems, response.paperItem],
    }));
    return { success: true, value: response.paperItem };
  },

  editDraftPaperItem: async (paperItemId, input) => {
    const response = await window.api.editDraftPaperItem(paperItemId, input);
    if (!response.success) return response;
    set((state) => ({
      draftPaperItems: state.draftPaperItems.map((item) =>
        item.id === paperItemId ? response.paperItem : item,
      ),
    }));
    return { success: true, value: response.paperItem };
  },

  deleteDraftPaperItem: async (paperItemId) => {
    const response = await window.api.deleteDraftPaperItem(paperItemId);
    if (!response.success) return response;
    set((state) => ({
      draftPaperItems: state.draftPaperItems.filter(
        (item) => item.id !== paperItemId,
      ),
    }));
    return { success: true, value: undefined };
  },

  loadDraftPaperItems: async () => {
    const response = await window.api.getDraftPaperItems();
    if (!response.success) return response;
    set({ draftPaperItems: response.paperItems });
    return { success: true, value: response.paperItems };
  },

  finalizeOrder: async ({ customerPaid }) => {
    const response = await window.api.finalizeOrder({ customerPaid });
    if (!response.success) return response;
    set({ draftPaperItems: [] });
    return {
      success: true,
      value: {
        itemCount: response.order.itemCount,
        total: response.order.total,
      },
    };
  },
}));

usePaperStore.getState().loadPaperTemplates();
usePaperStore.getState().loadDraftPaperItems();

export default usePaperStore;
