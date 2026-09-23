import { Input } from "@renderer/components/shared/Input";
import usePhotosStore from "@renderer/store/photos";
import usePaperStore from "@renderer/store/paper";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ItemFormValues = {
  personName: string;
  photoName: string;
  qty: string;
};

type ItemModalProps = {
  templateId: number | null;
  type?: "photo" | "paper" | null;
  editingItemId?: number | null;
  photoId?: number | null; // Kept for backward compatibility
  isBusy?: boolean;
  onClose: () => void;
};

const emptyItem: ItemFormValues = { personName: "", photoName: "", qty: "1" };
const money = (value: number) => `${value.toFixed(2)} ج.م`;

export function ItemModal({
  templateId,
  photoId,
  type = "photo",
  editingItemId,
  isBusy = false,
  onClose,
}: ItemModalProps) {
  const activeItemId = editingItemId ?? photoId ?? null;
  const activeType = type ?? "photo";

  // Stores
  const photoTemplates = usePhotosStore((state) => state.templates);
  const draftPhotos = usePhotosStore((state) => state.draftPhotos);
  const addDraftPhoto = usePhotosStore((state) => state.addDraftPhoto);
  const editDraftPhoto = usePhotosStore((state) => state.editDraftPhoto);

  const paperTemplates = usePaperStore((state) => state.paperTemplates);
  const draftPaperItems = usePaperStore((state) => state.draftPaperItems);
  const addDraftPaperItem = usePaperStore((state) => state.addDraftPaperItem);
  const editDraftPaperItem = usePaperStore((state) => state.editDraftPaperItem);

  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<ItemFormValues>({ defaultValues: emptyItem });

  // Selected Template
  const selectedTemplate =
    activeType === "paper"
      ? paperTemplates.find((item) => item.id === templateId)
      : photoTemplates.find((item) => item.id === templateId);

  // Editing Draft Item
  const editingPhoto =
    activeType === "photo"
      ? draftPhotos.find((item) => item.id === activeItemId)
      : null;

  const editingPaperItem =
    activeType === "paper"
      ? draftPaperItems.find((item) => item.id === activeItemId)
      : null;

  useEffect(() => {
    if (activeType === "photo" && editingPhoto) {
      form.reset({
        personName: editingPhoto.personName || "",
        photoName: editingPhoto.photoName || "",
        qty: String(editingPhoto.qty ?? 1),
      });
    } else if (activeType === "paper" && editingPaperItem) {
      form.reset({
        personName: "",
        photoName: "",
        qty: String(editingPaperItem.qty ?? 1),
      });
    } else {
      form.reset(emptyItem);
    }
  }, [activeType, editingPhoto, editingPaperItem, form]);

  if (templateId === null) return null;

  const handleSubmit = async (values: ItemFormValues) => {
    if (!templateId) return;
    setIsSaving(true);

    if (activeType === "paper") {
      const input = {
        paperTemplateId: templateId,
        qty: Number(values.qty),
      };
      const result =
        activeItemId === null
          ? await addDraftPaperItem(input)
          : await editDraftPaperItem(activeItemId, input);

      setIsSaving(false);
      if (result.success) onClose();
    } else {
      const input = {
        templateId,
        personName: values.personName.trim() || undefined,
        photoName: values.photoName.trim() || undefined,
        qty: Number(values.qty),
      };
      const result =
        activeItemId === null
          ? await addDraftPhoto(input)
          : await editDraftPhoto(activeItemId, input);

      setIsSaving(false);
      if (result.success) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">
              {selectedTemplate?.name ||
                (activeType === "paper" ? "بيانات الورق" : "بيانات الصورة")}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {activeItemId === null ? "إضافة إلى checkout" : "تعديل العنصر"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
          >
            ×
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="rounded-2xl bg-background p-4 text-sm">
            <span className="text-slate-500">السعر</span>
            <strong className="float-left text-lg text-primary">
              {selectedTemplate ? money(selectedTemplate.price) : "-"}
            </strong>
          </div>

          {/* Render extra details only for Photo items */}
          {activeType === "photo" && (
            <>
              <Input.Root>
                <Input.Label>
                  رقم الصورة{" "}
                  <span className="font-normal text-slate-400">(اختياري)</span>
                </Input.Label>
                <Input.Control registration={form.register("photoName")} />
              </Input.Root>
              <Input.Root>
                <Input.Label>
                  اسم الشخص{" "}
                  <span className="font-normal text-slate-400">(اختياري)</span>
                </Input.Label>
                <Input.Control registration={form.register("personName")} />
              </Input.Root>
            </>
          )}

          <Input.Root>
            <Input.Label>العدد</Input.Label>
            <Input.Control
              required
              min="1"
              type="number"
              registration={form.register("qty", { required: true, min: "1" })}
            />
          </Input.Root>

          <button
            type="submit"
            disabled={isBusy || isSaving || !selectedTemplate}
            className="h-14 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
          >
            {activeItemId === null ? "إضافة إلى checkout" : "حفظ التعديل"}
          </button>
        </form>
      </div>
    </div>
  );
}
