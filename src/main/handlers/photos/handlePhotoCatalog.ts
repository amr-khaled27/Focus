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
import { handle } from "@main/utils/handle";
import { PhotoTemplateInput } from "@shared/types/PhotoTemplate";

export default function handlePhotoCatalog(
  mainWindow: Electron.BrowserWindow | null,
) {
  handle(mainWindow, "getPhotoTemplates", async (event) => {
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

  handle(
    mainWindow,
    "createPhotoTemplate",
    async (event, ...args: unknown[]) => {
      const payload = args[0] as PhotoTemplateInput;
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
    },
  );

  handle(mainWindow, "editTemplate", async (event, ...args: unknown[]) => {
    const [templateId, payload] = args as [number, PhotoTemplateInput];
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

  handle(mainWindow, "insertDraftPhoto", async (event, ...args: unknown[]) => {
    const payload = args[0] as {
      templateId: number;
      personName?: string | null;
      photoName?: string | null;
      qty: number;
    };

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

  handle(mainWindow, "editDraftPhoto", async (event, ...args: unknown[]) => {
    const [photoId, payload] = args as [
      number,
      {
        templateId: number;
        personName?: string | null;
        photoName?: string | null;
        qty: number;
      },
    ];
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

  handle(mainWindow, "getDraftPhotos", async (event) => {
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

  handle(mainWindow, "deleteDraftPhoto", async (event, ...args: unknown[]) => {
    const photoId = args[0] as number;
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
