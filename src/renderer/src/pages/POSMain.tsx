import usePhotosStore from "@renderer/store/photos";
import useSettingsStore from "@renderer/store/settings";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyTemplate = { name: "", width: "", height: "", price: "", cost: "" };
const emptyItem = { personName: "", photoName: "", qty: "1" };
const money = (value: number) => `${value.toFixed(2)} ج.م`;

type Modal = "item" | "template" | null;

export default function POSMain() {
  const { user, clearUser } = useSettingsStore();
  const {
    templates,
    draftPhotos,
    loadTemplates,
    createTemplate,
    editTemplate,
    addDraftPhoto,
    editDraftPhoto,
    deleteDraftPhoto,
    loadDraftPhotos,
    finalizeOrder,
  } = usePhotosStore();
  const navigate = useNavigate();
  const [modal, setModal] = useState<Modal>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(
    null,
  );
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplate);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void Promise.all([loadTemplates(), loadDraftPhotos()]).then((results) => {
      const failed = results.find((result) => !result.success);
      if (failed && !failed.success) setStatus(failed.error);
    });
  }, [loadTemplates, loadDraftPhotos]);

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );
  const totalItems = draftPhotos.reduce(
    (sum, photo) => sum + (photo.qty ?? 0),
    0,
  );
  const totalPrice = draftPhotos.reduce(
    (sum, photo) => sum + photo.price * (photo.qty ?? 0),
    0,
  );

  const closeModal = () => {
    setModal(null);
    setSelectedTemplateId(null);
    setEditingTemplateId(null);
    setEditingPhotoId(null);
    setTemplateForm(emptyTemplate);
    setItemForm(emptyItem);
  };

  const openItemModal = (templateId: number | undefined) => {
    if (templateId === undefined) return;
    setSelectedTemplateId(templateId);
    setItemForm(emptyItem);
    setEditingPhotoId(null);
    setModal("item");
  };

  const openTemplateModal = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplate);
    setModal("template");
  };

  const openTemplateEdit = (template: (typeof templates)[number]) => {
    if (template.id === undefined) return;
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      width: String(template.width),
      height: String(template.height),
      price: String(template.price),
      cost: String(template.cost),
    });
    setModal("template");
  };

  const openPhotoEdit = (photo: (typeof draftPhotos)[number]) => {
    if (photo.id === undefined) return;
    setSelectedTemplateId(photo.templateId);
    setEditingPhotoId(photo.id);
    setItemForm({
      personName: photo.personName || "",
      photoName: photo.photoName || "",
      qty: String(photo.qty ?? 1),
    });
    setModal("item");
  };

  const handleTemplateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBusy(true);
    const input = {
      name: templateForm.name.trim(),
      width: Number(templateForm.width),
      height: Number(templateForm.height),
      unit: "cm",
      price: Number(templateForm.price),
      cost: Number(templateForm.cost),
    };
    const result =
      editingTemplateId === null
        ? await createTemplate(input)
        : await editTemplate(editingTemplateId, input);
    setIsBusy(false);
    if (!result.success) {
      setStatus(result.error);
      return;
    }
    closeModal();
    setStatus(
      editingTemplateId === null ? "تم إنشاء القالب." : "تم تعديل القالب.",
    );
  };

  const handleItemSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedTemplateId === null) return;
    setIsBusy(true);
    const input = {
      templateId: selectedTemplateId,
      personName: itemForm.personName.trim() || undefined,
      photoName: itemForm.photoName.trim() || undefined,
      qty: Number(itemForm.qty),
    };
    const result =
      editingPhotoId === null
        ? await addDraftPhoto(input)
        : await editDraftPhoto(editingPhotoId, input);
    setIsBusy(false);
    if (!result.success) {
      setStatus(result.error);
      return;
    }
    closeModal();
    setStatus(
      editingPhotoId === null
        ? "تمت إضافة العنصر إلى checkout."
        : "تم تعديل العنصر.",
    );
  };

  const handleDelete = async (photoId: number | undefined) => {
    if (photoId === undefined) return;
    setIsBusy(true);
    const result = await deleteDraftPhoto(photoId);
    setIsBusy(false);
    setStatus(result.success ? "تم حذف العنصر." : result.error);
  };

  const handleFinalize = async () => {
    setIsBusy(true);
    const result = await finalizeOrder();
    setIsBusy(false);
    setStatus(
      result.success ? `تم حفظ الطلب رقم ${result.value.id}.` : result.error,
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
        <section className="min-w-0 md:col-span-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-accent">القوالب</p>
              <h2 className="text-3xl font-bold">اختر قالبًا</h2>
            </div>
            <span className="text-sm text-slate-500">
              اضغط على المنتج لإضافته
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                <button
                  type="button"
                  onClick={() => openItemModal(template.id)}
                  className="block w-full p-4 text-right"
                >
                  <span className="mb-4 flex aspect-4/3 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-3xl font-bold text-white">
                    صورة
                  </span>
                  <span className="block truncate font-bold">
                    {template.name}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {template.width} × {template.height} سم
                  </span>
                  <span className="mt-3 block text-sm font-bold text-primary">
                    {money(template.price)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openTemplateEdit(template)}
                  className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-accent opacity-0 shadow-sm transition group-hover:opacity-100"
                >
                  تعديل
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={openTemplateModal}
              className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-primary transition hover:border-primary hover:bg-primary/10"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
                +
              </span>
              <span className="font-bold">إضافة قالب جديد</span>
            </button>
          </div>
        </section>

        <section className="self-start rounded-3xl bg-primary p-6 text-white shadow-xl shadow-primary/15 sm:p-8 md:col-span-4 md:sticky md:top-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-white/65">
                checkout
              </p>
              <h2 className="text-3xl font-bold">طلبك الحالي</h2>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="rounded-xl bg-white/12 px-3 py-2">
                {totalItems} عنصر
              </span>
              <span className="rounded-xl bg-white px-4 py-2 font-bold text-primary">
                {money(totalPrice)}
              </span>
            </div>
          </div>

          {draftPhotos.length === 0 ? (
            <div className="py-16 text-center text-white/60">
              <div className="mb-3 text-4xl">◫</div>
              <p className="font-bold text-white/80">checkout فارغ</p>
              <p className="mt-1 text-sm">
                اختر قالبًا من الأعلى لإضافة أول عنصر.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {draftPhotos.map((photo) => {
                const template = templates.find(
                  (item) => item.id === photo.templateId,
                );
                return (
                  <div
                    key={photo.id}
                    className="flex flex-col gap-4 rounded-2xl bg-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/70 text-xl font-bold">
                        ص
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {template?.name || "صورة"}
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          {photo.photoName || "بدون رقم صورة"} ·{" "}
                          {photo.personName || "بدون اسم شخص"}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          {photo.width} × {photo.height} سم · {photo.qty} عدد
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <strong className="text-lg">
                        {money(photo.price * (photo.qty ?? 0))}
                      </strong>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => openPhotoEdit(photo)}
                        className="text-sm font-bold text-white/70 hover:text-white"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleDelete(photo.id)}
                        className="text-sm font-bold text-red-200 hover:text-white"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-col items-end gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm text-white/65">الإجمالي النهائي</span>
              <strong className="mr-3 text-3xl">{money(totalPrice)}</strong>
            </div>
            <button
              type="button"
              disabled={isBusy || draftPhotos.length === 0}
              onClick={() => void handleFinalize()}
              className="h-14 w-full rounded-xl bg-white px-8 font-bold text-primary hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              تأكيد الطلب
            </button>
          </div>
        </section>

        {status && (
          <p
            role="status"
            className="rounded-xl bg-accent/5 px-4 py-3 text-sm font-bold text-accent md:col-span-12"
          >
            {status}
          </p>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeModal()
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
                  {modal === "template" ? "قالب جديد" : selectedTemplate?.name}
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {modal === "template"
                    ? editingTemplateId === null
                      ? "إضافة قالب جديد"
                      : "تعديل القالب"
                    : editingPhotoId === null
                      ? "إضافة إلى checkout"
                      : "تعديل العنصر"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
              >
                ×
              </button>
            </div>
            {modal === "template" ? (
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <label className="block text-sm font-bold">
                  اسم القالب
                  <input
                    required
                    value={templateForm.name}
                    onChange={(event) =>
                      setTemplateForm({
                        ...templateForm,
                        name: event.target.value,
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-bold">
                    العرض
                    <input
                      required
                      min="1"
                      type="number"
                      value={templateForm.width}
                      onChange={(event) =>
                        setTemplateForm({
                          ...templateForm,
                          width: event.target.value,
                        })
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                  <label className="text-sm font-bold">
                    الارتفاع
                    <input
                      required
                      min="1"
                      type="number"
                      value={templateForm.height}
                      onChange={(event) =>
                        setTemplateForm({
                          ...templateForm,
                          height: event.target.value,
                        })
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                </div>
                <label className="block text-sm font-bold">
                  السعر للعميل
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={templateForm.price}
                    onChange={(event) =>
                      setTemplateForm({
                        ...templateForm,
                        price: event.target.value,
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <label className="block text-sm font-bold">
                  التكلفة
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={templateForm.cost}
                    onChange={(event) =>
                      setTemplateForm({
                        ...templateForm,
                        cost: event.target.value,
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <button
                  disabled={isBusy}
                  className="h-14 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
                >
                  {editingTemplateId === null ? "حفظ القالب" : "حفظ التعديل"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div className="rounded-2xl bg-background p-4 text-sm">
                  <span className="text-slate-500">السعر</span>
                  <strong className="float-left text-lg text-primary">
                    {selectedTemplate ? money(selectedTemplate.price) : "-"}
                  </strong>
                </div>
                <label className="block text-sm font-bold">
                  رقم الصورة{" "}
                  <span className="font-normal text-slate-400">(اختياري)</span>
                  <input
                    value={itemForm.photoName}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        photoName: event.target.value,
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <label className="block text-sm font-bold">
                  اسم الشخص{" "}
                  <span className="font-normal text-slate-400">(اختياري)</span>
                  <input
                    value={itemForm.personName}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        personName: event.target.value,
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <label className="block text-sm font-bold">
                  العدد
                  <input
                    required
                    min="1"
                    type="number"
                    value={itemForm.qty}
                    onChange={(event) =>
                      setItemForm({ ...itemForm, qty: event.target.value })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                <button
                  disabled={isBusy || !selectedTemplate}
                  className="h-14 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
                >
                  {editingPhotoId === null
                    ? "إضافة إلى checkout"
                    : "حفظ التعديل"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
