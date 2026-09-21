import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
  getUsers: () => ipcRenderer.invoke("getUsers"),
  isAdminInitialized: () => ipcRenderer.invoke("isAdminInitialized"),
  initAdmin: (payload) => ipcRenderer.invoke("initAdmin", payload),
  isUserAuthenticated: () => ipcRenderer.invoke("isUserAuthenticated"),
  login: (payload) => ipcRenderer.invoke("login", payload),
  logout: () => ipcRenderer.invoke("logout"),
  getPhotoTemplates: () => ipcRenderer.invoke("getPhotoTemplates"),
  createPhotoTemplate: (payload) =>
    ipcRenderer.invoke("createPhotoTemplate", payload),
  editTemplate: (templateId, payload) =>
    ipcRenderer.invoke("editTemplate", templateId, payload),
  insertDraftPhoto: (payload) =>
    ipcRenderer.invoke("insertDraftPhoto", payload),
  editDraftPhoto: (photoId, payload) =>
    ipcRenderer.invoke("editDraftPhoto", photoId, payload),
  getDraftPhotos: () => ipcRenderer.invoke("getDraftPhotos"),
  deleteDraftPhoto: (photoId) =>
    ipcRenderer.invoke("deleteDraftPhoto", photoId),
  finalizeOrder: (payload) => ipcRenderer.invoke("finalizeOrder", payload),
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
