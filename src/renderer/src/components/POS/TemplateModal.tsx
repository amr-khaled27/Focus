import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@renderer/components/shared/Modal";
import { Input } from "@renderer/components/shared/Input";
import { TemplateFormValues } from "@renderer/types/types";
import useStockStore from "@renderer/store/stock";

const emptyTemplate: TemplateFormValues = {
  name: "",
  type: "عادي",
  width: "",
  height: "",
  price: "",
  cost: "",
  stockId: "",
  stockQuantityUsed: "1",
};

type TemplateKind = "photo" | "paper";

type TemplateModalProps = {
  open: boolean;
  /** null while creating, the template id while editing. */
  editingId: number | null;
  kind: TemplateKind;
  onKindChange: (kind: TemplateKind) => void;
  /** Values to prefill when editing; omit/undefined resets to a blank form. */
  initialValues?: TemplateFormValues;
  isBusy: boolean;
  onClose: () => void;
  onSubmit: (values: TemplateFormValues) => void;
};

/**
 * Template create/edit modal, built entirely from the Modal.* primitives.
 * Owns its own react-hook-form instance so the parent only ever deals with
 * plain values in and a submit callback out - same shape ItemModal can use.
 */
export function TemplateModal({
  open,
  editingId,
  kind,
  onKindChange,
  initialValues,
  isBusy,
  onClose,
  onSubmit,
}: TemplateModalProps) {
  const form = useForm<TemplateFormValues>({ defaultValues: emptyTemplate });
  const stocks = useStockStore((state) => state.stocks);
  const selectedStockId = form.watch("stockId");

  // Re-seed the form whenever the modal opens or the target template changes.
  useEffect(() => {
    if (open) form.reset(initialValues ?? emptyTemplate);
  }, [open, initialValues, form]);

  return (
    <Modal.Root open={open} onClose={onClose}>
      <Modal.Panel>
        <Modal.Header
          eyebrow={kind === "photo" ? "قالب صورة" : "قالب ورق"}
          title={editingId === null ? "إضافة قالب جديد" : "تعديل القالب"}
        />

        <Modal.Body>
          {editingId === null && (
            <Modal.Segmented
              value={kind}
              onChange={onKindChange}
              options={[
                { value: "photo", label: "صورة" },
                { value: "paper", label: "ورق" },
              ]}
            />
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input.Root>
              <Input.Label>اسم القالب</Input.Label>
              <Input.Control
                required
                registration={form.register("name", { required: true })}
              />
            </Input.Root>

            {kind === "paper" && (
              <Input.Root>
                <Input.Label>نوع الورق</Input.Label>
                <Input.Control
                  required
                  registration={form.register("type", { required: true })}
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
                  registration={form.register("width", { required: true })}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label>الارتفاع (سم)</Input.Label>
                <Input.Control
                  required
                  min="1"
                  type="number"
                  registration={form.register("height", { required: true })}
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
                registration={form.register("price", { required: true })}
              />
            </Input.Root>

            <Input.Root>
              <Input.Label>التكلفة</Input.Label>
              <Input.Control
                required
                min="0"
                step="0.01"
                type="number"
                registration={form.register("cost", { required: true })}
              />
            </Input.Root>

            <div className="border-t border-slate-100 pt-4">
              <Input.Root>
                <Input.Label>المصدر</Input.Label>
                <select
                  {...form.register("stockId")}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1"
                >
                  <option value="">تصنيع خارجي (لا يخصم من المخزون)</option>
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.name} ({stock.unit})
                    </option>
                  ))}
                </select>
              </Input.Root>

              {selectedStockId && (
                <div className="mt-4">
                  <Input.Root>
                    <Input.Label>الكمية المستهلكة لكل وحدة مباعة</Input.Label>
                    <Input.Control
                      required
                      min="0.01"
                      step="any"
                      type="number"
                      registration={form.register("stockQuantityUsed", {
                        required: true,
                      })}
                    />
                  </Input.Root>
                </div>
              )}
            </div>

            <button
              disabled={isBusy}
              className="h-14 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
            >
              {editingId === null ? "حفظ القالب" : "حفظ التعديل"}
            </button>
          </form>
        </Modal.Body>
      </Modal.Panel>
    </Modal.Root>
  );
}
