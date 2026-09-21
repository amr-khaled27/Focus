import { Checkout } from "@renderer/components/POS/Checkout";
import { ItemModal } from "@renderer/components/POS/ItemModal";
import { TemplateGrid } from "@renderer/components/POS/TemplateGrid";
import { Input } from "@renderer/components/Input";
import usePhotosStore from "@renderer/store/photos";
import useSettingsStore from "@renderer/store/settings";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type TemplateFormValues = {
  name: string;
  width: string;
  height: string;
  price: string;
  cost: string;
};

const emptyTemplate: TemplateFormValues = {
  name: "",
  width: "",
  height: "",
  price: "",
  cost: "",
};

type TemplateModalState = {
  open: boolean;
  editingId: number | null;
};

export default function POSMain() {
  const renderRef = useRef(0);
  useEffect(() => {
    renderRef.current += 1;
    console.log(`POSMain rendered ${renderRef.current} times`);
  });
  const user = useSettingsStore((state) => state.user);
  const clearUser = useSettingsStore((state) => state.clearUser);
  const loadTemplates = usePhotosStore((state) => state.loadTemplates);
  const loadDraftPhotos = usePhotosStore((state) => state.loadDraftPhotos);
  const createTemplate = usePhotosStore((state) => state.createTemplate);
  const editTemplate = usePhotosStore((state) => state.editTemplate);
  const navigate = useNavigate();
  const [itemTemplateId, setItemTemplateId] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [templateModal, setTemplateModal] = useState<TemplateModalState>({
    open: false,
    editingId: null,
  });
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const templateForm = useForm<TemplateFormValues>({
    defaultValues: emptyTemplate,
  });

  useEffect(() => {
    void Promise.all([loadTemplates(), loadDraftPhotos()]).then((results) => {
      const failed = results.find((result) => !result.success);
      if (failed && !failed.success) setStatus(failed.error);
    });
  }, [loadTemplates, loadDraftPhotos]);

  const closeItemModal = useCallback(() => {
    setItemTemplateId(null);
    setEditingPhotoId(null);
  }, []);

  const openItemModal = useCallback((templateId: number | undefined) => {
    if (templateId === undefined) return;
    setEditingPhotoId(null);
    setItemTemplateId(templateId);
  }, []);

  const openTemplateModal = useCallback(() => {
    templateForm.reset(emptyTemplate);
    setTemplateModal({ open: true, editingId: null });
  }, [templateForm]);

  const openTemplateEdit = useCallback(
    (templateId: number) => {
      const template = usePhotosStore
        .getState()
        .templates.find((item) => item.id === templateId);
      if (!template) return;
      templateForm.reset({
        name: template.name,
        width: String(template.width),
        height: String(template.height),
        price: String(template.price),
        cost: String(template.cost),
      });
      setTemplateModal({ open: true, editingId: templateId });
    },
    [templateForm],
  );

  const openPhotoEdit = useCallback((photoId: number) => {
    const photo = usePhotosStore
      .getState()
      .draftPhotos.find((item) => item.id === photoId);
    if (!photo) return;
    setItemTemplateId(photo.templateId);
    setEditingPhotoId(photoId);
  }, []);

  const closeTemplateModal = useCallback(() => {
    setTemplateModal({ open: false, editingId: null });
    templateForm.reset(emptyTemplate);
  }, [templateForm]);

  const handleTemplateSubmit = async (values: TemplateFormValues) => {
    setIsBusy(true);
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
    <main className="min-h-screen bg-background text-text" dir="rtl">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
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

      <div className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-12 md:items-start lg:gap-8 lg:p-10">
        <TemplateGrid
          selectedTemplateId={itemTemplateId}
          onSelect={openItemModal}
          onCreate={openTemplateModal}
          onEdit={openTemplateEdit}
        />
        <Checkout isBusy={isBusy} onEditPhoto={openPhotoEdit} />
        {status && (
          <p
            role="status"
            className="rounded-xl bg-accent/5 px-4 py-3 text-sm font-bold text-accent md:col-span-12"
          >
            {status}
          </p>
        )}
      </div>

      <ItemModal
        templateId={itemTemplateId}
        photoId={editingPhotoId}
        onClose={closeItemModal}
      />

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
                <p className="text-sm font-semibold text-accent">قالب صورة</p>
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
              <div className="grid grid-cols-2 gap-3">
                <Input.Root>
                  <Input.Label>العرض</Input.Label>
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
                  <Input.Label>الارتفاع</Input.Label>
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
