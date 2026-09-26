import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { invoke } from "./utils";

// Custom APIs for renderer
const api = {
  // auth
  getUsers: () => invoke("getUsers"),
  isAdminInitialized: () => invoke("isAdminInitialized"),
  initAdmin: (payload) => invoke("initAdmin", payload),
  isUserAuthenticated: () => invoke("isUserAuthenticated"),
  login: (payload) => invoke("login", payload),
  logout: () => invoke("logout"),

  // photo
  getPhotoTemplates: () => invoke("getPhotoTemplates"),
  createPhotoTemplate: (payload) => invoke("createPhotoTemplate", payload),
  editTemplate: (templateId, payload) =>
    invoke("editTemplate", templateId, payload),
  insertDraftPhoto: (payload) => invoke("insertDraftPhoto", payload),
  editDraftPhoto: (photoId, payload) =>
    invoke("editDraftPhoto", photoId, payload),
  getDraftPhotos: () => invoke("getDraftPhotos"),
  deleteDraftPhoto: (photoId) => invoke("deleteDraftPhoto", photoId),

  // paper
  getPaperTemplates: () => invoke("getPaperTemplates"),
  createPaperTemplate: (payload) => invoke("createPaperTemplate", payload),
  editPaperTemplate: (templateId, payload) =>
    invoke("editPaperTemplate", templateId, payload),
  deletePaperTemplate: (templateId) =>
    invoke("deletePaperTemplate", templateId),
  insertDraftPaperItem: (payload) => invoke("insertDraftPaper", payload),
  editDraftPaperItem: (paperItemId, payload) =>
    invoke("editDraftPaper", paperItemId, payload),
  getDraftPaperItems: () => invoke("getDraftPaperItems"),
  deleteDraftPaperItem: (paperItemId) =>
    invoke("deleteDraftPaper", paperItemId),

  // inventory
  getStocks: () => invoke("getStocks"),
  getStockById: (stockId) => invoke("getStockById", stockId),
  createStock: (payload) => invoke("createStock", payload),
  editStock: (stockId, payload) => invoke("editStock", stockId, payload),
  deleteStock: (stockId) => invoke("deleteStock", stockId),
  adjustStockQuantity: (stockId, delta) =>
    invoke("adjustStockQuantity", stockId, delta),

  getRecipesForTemplate: (templateType, templateId) =>
    invoke("getRecipesForTemplate", templateType, templateId),
  createTemplateRecipe: (payload) => invoke("createTemplateRecipe", payload),
  editTemplateRecipe: (recipeId, payload) =>
    invoke("editTemplateRecipe", recipeId, payload),
  deleteTemplateRecipe: (recipeId) => invoke("deleteTemplateRecipe", recipeId),
  deleteRecipesForTemplate: (templateType, templateId) =>
    invoke("deleteRecipesForTemplate", templateType, templateId),

  // order
  finalizeOrder: (payload) => invoke("finalizeOrder", payload),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
