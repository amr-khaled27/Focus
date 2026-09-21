import usePhotosStore from "@renderer/store/photos";
import { memo } from "react";

const money = (value: number) => `${value.toFixed(2)} ج.م`;

type TemplateGridProps = {
  selectedTemplateId: number | null;
  onSelect: (templateId: number | undefined) => void;
  onCreate: () => void;
  onEdit: (templateId: number) => void;
};

export const TemplateGrid = memo(function TemplateGrid({
  selectedTemplateId,
  onSelect,
  onCreate,
  onEdit,
}: TemplateGridProps) {
  const templates = usePhotosStore((state) => state.templates);

  return (
    <section className="min-w-0 md:col-span-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-accent">القوالب</p>
          <h2 className="text-3xl font-bold">اختر قالبًا</h2>
        </div>
        <span className="text-sm text-slate-500">اضغط على المنتج لإضافته</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${selectedTemplateId === template.id ? "border-primary ring-4 ring-primary/10" : "border-slate-200 hover:border-primary/40"}`}
          >
            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className="block w-full p-4 text-right"
            >
              <span className="mb-4 flex aspect-4/3 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent text-3xl font-bold text-white">
                صورة
              </span>
              <span className="block truncate font-bold">{template.name}</span>
              <span className="mt-1 block text-xs text-slate-500">
                {template.width} × {template.height} سم
              </span>
              <span className="mt-3 block text-sm font-bold text-primary">
                {money(template.price)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => template.id !== undefined && onEdit(template.id)}
              className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-accent opacity-0 shadow-sm transition group-hover:opacity-100"
            >
              تعديل
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-primary transition hover:border-primary hover:bg-primary/10"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
            +
          </span>
          <span className="font-bold">إضافة قالب جديد</span>
        </button>
      </div>
    </section>
  );
});
