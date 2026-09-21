import { Input } from "@renderer/components/Input";
import usePhotosStore from "@renderer/store/photos";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ItemFormValues = {
  personName: string;
  photoName: string;
  qty: string;
};

type ItemModalProps = {
  templateId: number | null;
  photoId: number | null;
  isBusy?: boolean;
  onClose: () => void;
};

const emptyItem: ItemFormValues = { personName: "", photoName: "", qty: "1" };
const money = (value: number) => `${value.toFixed(2)} ج.م`;

export function ItemModal({
  templateId,
  photoId,
  isBusy = false,
  onClose,
}: ItemModalProps) {
  const templates = usePhotosStore((state) => state.templates);
  const draftPhotos = usePhotosStore((state) => state.draftPhotos);
  const addDraftPhoto = usePhotosStore((state) => state.addDraftPhoto);
  const editDraftPhoto = usePhotosStore((state) => state.editDraftPhoto);
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<ItemFormValues>({ defaultValues: emptyItem });
  const selectedTemplate = templates.find((item) => item.id === templateId);
  const editingPhoto = draftPhotos.find((item) => item.id === photoId);

  useEffect(() => {
    form.reset(
      editingPhoto
        ? {
            personName: editingPhoto.personName || "",
            photoName: editingPhoto.photoName || "",
            qty: String(editingPhoto.qty ?? 1),
          }
        : emptyItem,
    );
  }, [editingPhoto, form]);

  if (templateId === null) return null;

  const handleSubmit = async (values: ItemFormValues) => {
    setIsSaving(true);
    const input = {
      templateId,
      personName: values.personName.trim() || undefined,
      photoName: values.photoName.trim() || undefined,
      qty: Number(values.qty),
    };
    const result =
      photoId === null
        ? await addDraftPhoto(input)
        : await editDraftPhoto(photoId, input);
    setIsSaving(false);
    if (result.success) onClose();
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
              {selectedTemplate?.name || "بيانات الصورة"}
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {photoId === null ? "إضافة إلى checkout" : "تعديل العنصر"}
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
            {photoId === null ? "إضافة إلى checkout" : "حفظ التعديل"}
          </button>
        </form>
      </div>
    </div>
  );
}
