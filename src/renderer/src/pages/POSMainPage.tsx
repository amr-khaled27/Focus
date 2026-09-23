import { Checkout } from "@renderer/components/POS/Checkout";
import { ItemModal } from "@renderer/components/POS/ItemModal"; // Or PaperItemModal if separate
import { TemplateGrid } from "@renderer/components/POS/TemplateGrid";
import { Input } from "@renderer/components/shared/Input";
import usePhotosStore from "@renderer/store/photos";
import usePaperStore from "@renderer/store/paper";
import useSettingsStore from "@renderer/store/settings";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type TemplateFormValues = {
  name: string;
  type: string;
  width: string;
  height: string;
  price: string;
  cost: string;
};

const emptyTemplate: TemplateFormValues = {
  name: "",
  type: "عادي",
  width: "",
  height: "",
  price: "",
  cost: "",
};

type TemplateModalState = {
  open: boolean;
  editingId: number | null;
  type: "photo" | "paper";
};

export default function POSMainPage() {
  const user = useSettingsStore((state) => state.user);
  const clearUser = useSettingsStore((state) => state.clearUser);

  // Photo store hooks
  const loadTemplates = usePhotosStore((state) => state.loadTemplates);
  const loadDraftPhotos = usePhotosStore((state) => state.loadDraftPhotos);
  const createTemplate = usePhotosStore((state) => state.createTemplate);
  const editTemplate = usePhotosStore((state) => state.editTemplate);

  // Paper store hooks
  const loadPaperTemplates = usePaperStore((state) => state.loadPaperTemplates);
  const loadDraftPaperItems = usePaperStore(
    (state) => state.loadDraftPaperItems,
  );
  const createPaperTemplate = usePaperStore(
    (state) => state.createPaperTemplate,
  );
  const editPaperTemplate = usePaperStore((state) => state.editPaperTemplate);

  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    type: "photo" | "paper";
  } | null>(null);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [templateModal, setTemplateModal] = useState<TemplateModalState>({
    open: false,
    editingId: null,
    type: "photo",
  });
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const templateForm = useForm<TemplateFormValues>({
    defaultValues: emptyTemplate,
  });

  useEffect(() => {
    void Promise.all([
      loadTemplates(),
      loadDraftPhotos(),
      loadPaperTemplates(),
      loadDraftPaperItems(),
    ]).then((results) => {
      const failed = results.find((result) => !result.success);
      if (failed && !failed.success) setStatus(failed.error);
    });
  }, [loadTemplates, loadDraftPhotos, loadPaperTemplates, loadDraftPaperItems]);

  const closeItemModal = useCallback(() => {
    setSelectedTemplate(null);
    setEditingItemId(null);
  }, []);

  const openItemModal = useCallback(
    (templateId: number, type: "photo" | "paper") => {
      setEditingItemId(null);
      setSelectedTemplate({ id: templateId, type });
    },
    [],
  );

  const openTemplateModal = useCallback(() => {
    templateForm.reset(emptyTemplate);
    setTemplateModal({ open: true, editingId: null, type: "photo" });
  }, [templateForm]);

  const openTemplateEdit = useCallback(
    (templateId: number, type: "photo" | "paper") => {
      if (type === "photo") {
        const template = usePhotosStore
          .getState()
          .templates.find((item) => item.id === templateId);
        if (!template) return;
        templateForm.reset({
          name: template.name,
          type: "صورة",
          width: String(template.width),
          height: String(template.height),
          price: String(template.price),
          cost: String(template.cost),
        });
      } else {
        const template = usePaperStore
          .getState()
          .paperTemplates.find((item) => item.id === templateId);
        if (!template) return;
        templateForm.reset({
          name: template.name,
          type: template.type || "عادي",
          width: String(template.width),
          height: String(template.height),
          price: String(template.price),
          cost: String(template.cost),
        });
      }
      setTemplateModal({ open: true, editingId: templateId, type });
    },
    [templateForm],
  );

  const openPhotoEdit = useCallback((photoId: number) => {
    const photo = usePhotosStore
      .getState()
      .draftPhotos.find((item) => item.id === photoId);
    if (!photo) return;
    setSelectedTemplate({ id: photo.templateId, type: "photo" });
    setEditingItemId(photoId);
  }, []);

  const openPaperEdit = useCallback((paperId: number) => {
    const paper = usePaperStore
      .getState()
      .draftPaperItems.find((item) => item.id === paperId);
    if (!paper) return;
    setSelectedTemplate({ id: paper.paperTemplateId, type: "paper" });
    setEditingItemId(paperId);
  }, []);

  const handleEditItem = useCallback(
    (id: number, type: "photo" | "paper") => {
      if (type === "photo") {
        openPhotoEdit(id);
      } else {
        openPaperEdit(id);
      }
    },
    [openPhotoEdit, openPaperEdit],
  );

  const closeTemplateModal = useCallback(() => {
    setTemplateModal({ open: false, editingId: null, type: "photo" });
    templateForm.reset(emptyTemplate);
  }, [templateForm]);

  const handleTemplateSubmit = async (values: TemplateFormValues) => {
    setIsBusy(true);

    if (templateModal.type === "photo") {
      const input = {
        name: values.name.trim(),
        width: Number(values.width),
        height: Number(values.height),
        unit: "cm",
        price: Number(values.price),
        cost: Number(values.cost),
      };
      const result =
        templateModal.editingId === null
          ? await createTemplate(input)
          : await editTemplate(templateModal.editingId, input);

      setIsBusy(false);
      if (!result.success) {
        setStatus(result.error);
        return;
      }
    } else {
      const input = {
        name: values.name.trim(),
        type: values.type.trim() || "عادي",
        width: Number(values.width),
        height: Number(values.height),
        price: Number(values.price),
        cost: Number(values.cost),
      };
      const result =
        templateModal.editingId === null
          ? await createPaperTemplate(input)
          : await editPaperTemplate(templateModal.editingId, input);

      setIsBusy(false);
      if (!result.success) {
        setStatus(result.error);
        return;
      }
    }

    closeTemplateModal();
    setStatus(
      templateModal.editingId === null
        ? "تم إنشاء القالب."
        : "تم تعديل القالب.",
    );
  };

  const handleLogout = async () => {
    await window.api.logout();
    clearUser();
    navigate("/", { replace: true });
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        لا يوجد مستخدم مسجل الدخول
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-text">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">نقطة البيع</p>
            <h1 className="text-2xl font-bold">اختر المنتج</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 w-full gap-4 overflow-y-auto md:grid-cols-12 md:items-start lg:gap-8">
        <TemplateGrid
          selectedTemplateId={selectedTemplate?.id ?? null}
          selectedType={selectedTemplate?.type ?? null}
          onSelect={openItemModal}
          onCreate={openTemplateModal}
          onEdit={openTemplateEdit}
        />
        <Checkout isBusy={isBusy} onEditItem={handleEditItem} />
        {status && (
          <p
            role="status"
            className="rounded-xl bg-accent/5 px-4 py-3 text-sm font-bold text-accent md:col-span-12"
          >
            {status}
          </p>
        )}
      </div>

      {/* Item Modal: Pass both templateId AND type (or conditional render if you have PaperModal vs ItemModal) */}
      {selectedTemplate && (
        <ItemModal
          templateId={selectedTemplate.id}
          type={selectedTemplate.type}
          editingItemId={editingItemId}
          onClose={closeItemModal}
        />
      )}

      {templateModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeTemplateModal()
          }
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent">
                  {templateModal.type === "photo" ? "قالب صورة" : "قالب ورق"}
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {templateModal.editingId === null
                    ? "إضافة قالب جديد"
                    : "تعديل القالب"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTemplateModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
              >
                ×
              </button>
            </div>

            {templateModal.editingId === null && (
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setTemplateModal((prev) => ({ ...prev, type: "photo" }))
                  }
                  className={`rounded-lg py-2 text-sm font-bold transition ${
                    templateModal.type === "photo"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  صورة
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTemplateModal((prev) => ({ ...prev, type: "paper" }))
                  }
                  className={`rounded-lg py-2 text-sm font-bold transition ${
                    templateModal.type === "paper"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ورق
                </button>
              </div>
            )}

            <form
              onSubmit={templateForm.handleSubmit(handleTemplateSubmit)}
              className="space-y-4"
            >
              <Input.Root>
                <Input.Label>اسم القالب</Input.Label>
                <Input.Control
                  required
                  registration={templateForm.register("name", {
                    required: true,
                  })}
                />
              </Input.Root>

              {templateModal.type === "paper" && (
                <Input.Root>
                  <Input.Label>نوع الورق</Input.Label>
                  <Input.Control
                    required
                    registration={templateForm.register("type", {
                      required: true,
                    })}
                  />
                </Input.Root>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input.Root>
                  <Input.Label>العرض (سم)</Input.Label>
                  <Input.Control
                    required
                    min="1"
                    type="number"
                    registration={templateForm.register("width", {
                      required: true,
                    })}
                  />
                </Input.Root>
                <Input.Root>
                  <Input.Label>الارتفاع (سم)</Input.Label>
                  <Input.Control
                    required
                    min="1"
                    type="number"
                    registration={templateForm.register("height", {
                      required: true,
                    })}
                  />
                </Input.Root>
              </div>

              <Input.Root>
                <Input.Label>السعر للعميل</Input.Label>
                <Input.Control
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  registration={templateForm.register("price", {
                    required: true,
                  })}
                />
              </Input.Root>

              <Input.Root>
                <Input.Label>التكلفة</Input.Label>
                <Input.Control
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  registration={templateForm.register("cost", {
                    required: true,
                  })}
                />
              </Input.Root>
              <button
                disabled={isBusy}
                className="h-14 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
              >
                {templateModal.editingId === null
                  ? "حفظ القالب"
                  : "حفظ التعديل"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
