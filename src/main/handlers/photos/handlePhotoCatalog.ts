import isTrustedSender from "@main/utils/isTrustedSender";
import {
  createPhotoTemplate,
  deleteDraftPhoto,
  editDraftPhoto,
  editTemplate,
  getPhotoTemplates,
  getPhotosWithNoOrder,
  insertDraftPhoto,
} from "@main/db/index";
import { ipcMain } from "electron";

export default function handlePhotoCatalog(
  mainWindow: Electron.BrowserWindow | null,
) {
  ipcMain.handle("getPhotoTemplates", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, templates: await getPhotoTemplates() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحميل القوالب",
      };
    }
  });

  ipcMain.handle("createPhotoTemplate", async (event, payload) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, template: await createPhotoTemplate(payload) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل إنشاء القالب",
      };
    }
  });

  ipcMain.handle("editTemplate", async (event, templateId: number, payload) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return {
        success: true,
        template: await editTemplate(templateId, payload),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تعديل القالب",
      };
    }
  });

  ipcMain.handle("insertDraftPhoto", async (event, payload) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, photo: await insertDraftPhoto(payload) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل إضافة الصورة",
      };
    }
  });

  ipcMain.handle("editDraftPhoto", async (event, photoId: number, payload) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return {
        success: true,
        photo: await editDraftPhoto(photoId, payload),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تعديل الصورة",
      };
    }
  });

  ipcMain.handle("getDraftPhotos", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, photos: await getPhotosWithNoOrder() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحميل الدفعة",
      };
    }
  });

  ipcMain.handle("deleteDraftPhoto", async (event, photoId: number) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      const deleted = await deleteDraftPhoto(photoId);
      return deleted
        ? { success: true }
        : { success: false, error: "الصورة غير موجودة في الدفعة الحالية" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل حذف الصورة",
      };
    }
  });
}
