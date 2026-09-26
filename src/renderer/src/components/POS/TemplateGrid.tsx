import usePhotosStore from "@renderer/store/photos";
import usePaperStore from "@renderer/store/paper";
import { memo } from "react";
import { Plus, Image, FileText } from "lucide-react";

const money = (value: number) => `${value.toFixed(2)} ج.م`;

type TemplateGridProps = {
  selectedTemplateId: number | null;
  selectedType: "photo" | "paper" | null;
  onSelect: (templateId: number, type: "photo" | "paper") => void;
  onCreate: () => void;
  onEdit: (templateId: number, type: "photo" | "paper") => void;
};

export const TemplateGrid = memo(function TemplateGrid({
  selectedTemplateId,
  selectedType,
  onSelect,
  onCreate,
  onEdit,
}: TemplateGridProps) {
  const photoTemplates = usePhotosStore((state) => state.templates);
  const paperTemplates = usePaperStore((state) => state.paperTemplates);

  return (
    <section className="min-w-0 pr-4 md:col-span-7 pt-4">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-accent">القوالب</p>
          <h2 className="text-3xl font-bold">اختر قالبًا</h2>
        </div>
        <span className="text-sm text-slate-500">اضغط على المنتج لإضافته</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {/* Photo Templates */}
        {photoTemplates.map((template) => {
          const isSelected =
            selectedTemplateId === template.id && selectedType === "photo";
          return (
            <div
              key={`photo-${template.id}`}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                isSelected
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-slate-200 hover:border-primary/40"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  template.id !== undefined && onSelect(template.id, "photo")
                }
                className="block w-full p-4 text-right"
              >
                <span className="mb-4 flex aspect-4/3 items-center justify-center rounded-xl bg-primary text-3xl font-bold text-white">
                  <Image className="h-12 w-12" />
                </span>
                <span className="block truncate font-bold">
                  {template.name}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {template.width} × {template.height} سم (صورة)
                </span>
                <span
                  className={`mt-1 block text-[11px] font-semibold ${
                    template.stockLink ? "text-primary/70" : "text-slate-400"
                  }`}
                >
                  {template.stockLink ? "من المخزون" : "تصنيع خارجي"}
                </span>
                <span className="mt-3 block text-sm font-bold text-primary">
                  {money(template.price)}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  template.id !== undefined && onEdit(template.id, "photo")
                }
                className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-accent opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                تعديل
              </button>
            </div>
          );
        })}

        {/* Paper Templates */}
        {paperTemplates.map((template) => {
          const isSelected =
            selectedTemplateId === template.id && selectedType === "paper";
          return (
            <div
              key={`paper-${template.id}`}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                isSelected
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-slate-200 hover:border-primary/40"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  template.id !== undefined && onSelect(template.id, "paper")
                }
                className="block w-full p-4 text-right"
              >
                <span className="mb-4 flex aspect-4/3 items-center justify-center rounded-xl bg-accent text-3xl font-bold text-white">
                  <FileText className="h-12 w-12" />
                </span>
                <span className="block truncate font-bold">
                  {template.name}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {template.width} × {template.height} سم (
                  {template.type || "ورق"})
                </span>
                <span
                  className={`mt-1 block text-[11px] font-semibold ${
                    template.stockLink ? "text-primary/70" : "text-slate-400"
                  }`}
                >
                  {template.stockLink ? "من المخزون" : "تصنيع خارجي"}
                </span>
                <span className="mt-3 block text-sm font-bold text-primary">
                  {money(template.price)}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  template.id !== undefined && onEdit(template.id, "paper")
                }
                className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-accent opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                تعديل
              </button>
            </div>
          );
        })}

        {/* Create Button */}
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-primary transition hover:border-primary hover:bg-primary/10"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
            <Plus />
          </span>
          <span className="font-bold">إضافة قالب جديد</span>
        </button>
      </div>
    </section>
  );
});
