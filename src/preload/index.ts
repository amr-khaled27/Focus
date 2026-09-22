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
