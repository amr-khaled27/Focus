import { Input } from "@renderer/components/shared/Input";
import usePhotosStore from "@renderer/store/photos";
import usePaperStore from "@renderer/store/paper";
import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { ShoppingBagIcon, Image, FileText } from "lucide-react";

type CheckoutFormValues = {
  customerPaid: string;
};

type CheckoutProps = {
  isBusy: boolean;
  onEditItem: (id: number, type: "photo" | "paper") => void;
};

const money = (value: number) => `${value.toFixed(2)} ج.م`;

export const Checkout = memo(function Checkout({
  isBusy,
  onEditItem,
}: CheckoutProps) {
  // Photos Store
  const draftPhotos = usePhotosStore((state) => state.draftPhotos);
  const photoTemplates = usePhotosStore((state) => state.templates);
  const deleteDraftPhoto = usePhotosStore((state) => state.deleteDraftPhoto);
  const finalizeOrder = usePhotosStore((state) => state.finalizeOrder);
  const loadDraftPhotos = usePhotosStore((state) => state.loadDraftPhotos);

  // Paper Store
  const draftPaperItems = usePaperStore((state) => state.draftPaperItems);
  const paperTemplates = usePaperStore((state) => state.paperTemplates);
  const deleteDraftPaperItem = usePaperStore(
    (state) => state.deleteDraftPaperItem,
  );
  const loadDraftPaperItems = usePaperStore(
    (state) => state.loadDraftPaperItems,
  );

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutForm = useForm<CheckoutFormValues>({
    defaultValues: { customerPaid: "0" },
  });

  // Combined totals calculation
  const totalPhotosQty = draftPhotos.reduce(
    (sum, photo) => sum + (photo.qty ?? 0),
    0,
  );
  const totalPaperQty = draftPaperItems.reduce(
    (sum, paper) => sum + (paper.qty ?? 0),
    0,
  );
  const totalItems = totalPhotosQty + totalPaperQty;

  const totalPhotosPrice = draftPhotos.reduce(
    (sum, photo) => sum + (photo.price || 0) * (photo.qty ?? 0),
    0,
  );
  const totalPaperPrice = draftPaperItems.reduce((sum, paper) => {
    const tmpl = paperTemplates.find((t) => t.id === paper.paperTemplateId);
    const itemPrice = paper.price ?? tmpl?.price ?? 0;
    return sum + itemPrice * (paper.qty ?? 0);
  }, 0);
  const totalPrice = totalPhotosPrice + totalPaperPrice;

  // Handlers
  const handleDeletePhoto = useCallback(
    async (photoId: number | undefined) => {
      if (photoId === undefined) return;
      const result = await deleteDraftPhoto(photoId);
      setStatus(
        result.success ? "تم حذف الصورة." : result.error || "خطأ في الحذف",
      );
    },
    [deleteDraftPhoto],
  );

  const handleDeletePaper = useCallback(
    async (paperId: number | undefined) => {
      if (paperId === undefined) return;
      const result = await deleteDraftPaperItem(paperId);
      setStatus(
        result.success ? "تم حذف عنصر الورق." : result.error || "خطأ في الحذف",
      );
    },
    [deleteDraftPaperItem],
  );

  const onFinalizeOrder = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    setStatus("");

    try {
      const parsedPaid = parseFloat(values.customerPaid) || 0;
      const sanitizedPaid = Math.min(Math.max(parsedPaid, 0), totalPrice);

      const result = await finalizeOrder({
        customerPaid: sanitizedPaid,
      });

      if (result?.success) {
        setStatus("تم تأكيد الطلب بنجاح!");
        checkoutForm.reset({ customerPaid: "0" });
        // Refresh stores after finalizing
        await Promise.all([loadDraftPhotos(), loadDraftPaperItems()]);
      } else {
        setStatus(result?.error || "حدث خطأ أثناء تأكيد الطلب.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setStatus("خطأ في الاتصال بالخدمة.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = draftPhotos.length === 0 && draftPaperItems.length === 0;

  return (
    <section className="self-start w-full rounded-tr-3xl rounded-br-3xl bg-primary p-6 text-white shadow-xl shadow-primary/15 sm:p-8 md:col-span-5 md:sticky md:top-6">
      <form onSubmit={checkoutForm.handleSubmit(onFinalizeOrder)}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-white opacity-60">
              سلة المنتجات
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

        {isEmpty ? (
          <div className="py-16 text-center text-white opacity-60">
            <div className="mb-3 flex justify-center">
              <ShoppingBagIcon className="w-12 h-12" />
            </div>
            <p className="font-bold text-white opacity-80">
              قائمة المنتجات فارغة
            </p>
            <p className="mt-1 text-sm">
              اختر قالبًا من الأعلى لإضافة أول منتج.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Photos Section */}
            {draftPhotos.map((photo) => {
              const template = photoTemplates.find(
                (item) => item.id === photo.templateId,
              );
              return (
                <div
                  key={`photo-${photo.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-white/10 p-4"
                >
                  <div className="min-w-0 flex items-center gap-4">
                    <p className="mt-1 text-sm text-white/65">
                      {photo.photoName || "بدون رقم صورة"} ·{" "}
                      {photo.personName || "بدون اسم شخص"}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {photo.width} × {photo.height} سم · {photo.qty} عدد
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/70 text-xl font-bold">
                        <Image className="h-8 w-8" />
                      </div>

                      <p className="truncate font-bold">
                        {template?.name || "صورة"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <strong className="text-lg">
                        {money((photo.price || 0) * (photo.qty ?? 0))}
                      </strong>
                      <button
                        type="button"
                        disabled={isBusy || isSubmitting}
                        onClick={() =>
                          photo.id !== undefined &&
                          onEditItem(photo.id, "photo")
                        }
                        className="text-sm font-bold text-white opacity-70 hover:text-white"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || isSubmitting}
                        onClick={() => void handleDeletePhoto(photo.id)}
                        className="text-sm font-bold text-red-300 opacity-70 hover:text-red-500"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Paper Section */}
            {draftPaperItems.map((paper) => {
              const template = paperTemplates.find(
                (item) => item.id === paper.paperTemplateId,
              );
              const itemPrice = paper.price ?? template?.price ?? 0;
              const itemName = template?.name ?? "ورق";

              return (
                <div
                  key={`paper-${paper.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-white/10 p-4"
                >
                  <div className="min-w-0 flex items-center gap-4">
                    <p className="mt-1 text-xs text-white/50">
                      {template?.width && template?.height
                        ? `${template.width} × ${template.height} سم · `
                        : ""}
                      {paper.qty} عدد
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/70 text-xl font-bold">
                        <FileText className="h-8 w-8" />
                      </div>

                      <p className="truncate font-bold">{itemName}</p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <strong className="text-lg">
                        {money(itemPrice * (paper.qty ?? 0))}
                      </strong>
                      <button
                        type="button"
                        disabled={isBusy || isSubmitting}
                        onClick={() =>
                          paper.id !== undefined &&
                          onEditItem(paper.id, "paper")
                        }
                        className="text-sm font-bold text-white opacity-70 hover:text-white"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || isSubmitting}
                        onClick={() => void handleDeletePaper(paper.id)}
                        className="text-sm font-bold text-red-300 opacity-70 hover:text-red-500"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPrice > 0 && (
          <Input.Root>
            <Input.Label className="mt-4 text-sm font-bold text-slate-200">
              المبلغ المدفوع من العميل
            </Input.Label>
            <Input.Control
              type="number"
              min="0"
              max={totalPrice}
              step="any"
              registration={checkoutForm.register("customerPaid")}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 duration-100 outline-none hover:border-slate-200/50 focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-slate-900"
            />
          </Input.Root>
        )}

        {status && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/85"
          >
            {status}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-6">
          <div className="flex flex-col gap-3 text-sm text-white/85">
            <span className="text-sm text-white/65">الإجمالي النهائي</span>
            <strong className="mr-3 text-3xl">{money(totalPrice)}</strong>
          </div>

          <button
            type="submit"
            disabled={isBusy || isSubmitting || isEmpty}
            className="h-14 rounded-xl bg-white px-8 font-bold text-primary hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {isSubmitting ? "جاري التأكيد..." : "تأكيد الطلب"}
          </button>
        </div>
      </form>
    </section>
  );
});
