import isTrustedSender from "@main/utils/isTrustedSender";
import {
  createPaperTemplate,
  deleteDraftPaper,
  deletePaperTemplate,
  editDraftPaper,
  editPaperTemplate,
  getPaperItemsWithNoOrder,
  getPaperTemplates,
  insertDraftPaper,
} from "@main/db/index";
import { handle } from "@main/utils/handle";
import { PaperTemplateInput } from "@shared/types/PaperTemplate";

export default function handlePaperCatalog(
  mainWindow: Electron.BrowserWindow | null,
) {
  // ==========================================
  // PAPER TEMPLATES IPC
  // ==========================================

  handle(mainWindow, "getPaperTemplates", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, templates: await getPaperTemplates() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحميل قالب الورق",
      };
    }
  });

  handle(
    mainWindow,
    "createPaperTemplate",
    async (event, ...args: unknown[]) => {
      const payload = args[0] as PaperTemplateInput;

      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        return {
          success: true,
          template: await createPaperTemplate(payload),
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "فشل إنشاء قالب الورق",
        };
      }
    },
  );

  handle(mainWindow, "editPaperTemplate", async (event, ...args: unknown[]) => {
    const [templateId, payload] = args as [number, PaperTemplateInput];

    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return {
        success: true,
        template: await editPaperTemplate(templateId, payload),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تعديل قالب الورق",
      };
    }
  });

  handle(
    mainWindow,
    "deletePaperTemplate",
    async (event, ...args: unknown[]) => {
      const templateId = args[0] as number;
      if (!isTrustedSender(event, mainWindow)) {
        return { success: false, error: "طلب غير موثوق" };
      }
      try {
        const deleted = await deletePaperTemplate(templateId);
        return deleted
          ? { success: true }
          : { success: false, error: "قالب الورق غير موجود" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "فشل حذف قالب الورق",
        };
      }
    },
  );

  // ==========================================
  // DRAFT PAPER ITEMS IPC
  // ==========================================

  handle(mainWindow, "insertDraftPaper", async (event, ...args: unknown[]) => {
    const payload = args[0] as {
      paperTemplateId: number;
      qty: number;
    };

    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, paperItem: await insertDraftPaper(payload) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل إضافة الورق",
      };
    }
  });

  handle(mainWindow, "editDraftPaper", async (event, ...args: unknown[]) => {
    const [paperItemId, payload] = args as [
      number,
      {
        paperTemplateId: number;
        qty: number;
      },
    ];

    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return {
        success: true,
        paperItem: await editDraftPaper(paperItemId, payload),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تعديل الورق",
      };
    }
  });

  handle(mainWindow, "getDraftPaperItems", async (event) => {
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      return { success: true, paperItems: await getPaperItemsWithNoOrder() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل تحميل عناصر الورق",
      };
    }
  });

  handle(mainWindow, "deleteDraftPaper", async (event, ...args: unknown[]) => {
    const paperItemId = args[0] as number;
    if (!isTrustedSender(event, mainWindow)) {
      return { success: false, error: "طلب غير موثوق" };
    }
    try {
      const deleted = await deleteDraftPaper(paperItemId);
      return deleted
        ? { success: true }
        : { success: false, error: "عنصر الورق غير موجود في الدفعة الحالية" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "فشل حذف عنصر الورق",
      };
    }
  });
}
