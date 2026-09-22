import { Input } from "@renderer/components/Input";
import usePhotosStore from "@renderer/store/photos";
import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { ShoppingBagIcon } from "lucide-react";

type CheckoutFormValues = {
  customerPaid: string;
};

type CheckoutProps = {
  isBusy: boolean;
  onEditPhoto: (photoId: number) => void;
};

const money = (value: number) => `${value.toFixed(2)} ج.م`;

export const Checkout = memo(function Checkout({
  isBusy,
  onEditPhoto,
}: CheckoutProps) {
  const draftPhotos = usePhotosStore((state) => state.draftPhotos);
  const templates = usePhotosStore((state) => state.templates);
  const deleteDraftPhoto = usePhotosStore((state) => state.deleteDraftPhoto);
  const finalizeOrder = usePhotosStore((state) => state.finalizeOrder);
  const checkoutForm = useForm<CheckoutFormValues>({
    defaultValues: { customerPaid: "0" },
  });
  const [status, setStatus] = useState("");

  const totalItems = draftPhotos.reduce(
    (sum, photo) => sum + (photo.qty ?? 0),
    0,
  );
  const totalPrice = draftPhotos.reduce(
    (sum, photo) => sum + photo.price * (photo.qty ?? 0),
    0,
  );

  const handleDelete = useCallback(
    async (photoId: number | undefined) => {
      if (photoId === undefined) return;
      const result = await deleteDraftPhoto(photoId);
      setStatus(result.success ? "تم حذف العنصر." : result.error);
    },
    [deleteDraftPhoto],
  );

  const handleFinalize = checkoutForm.handleSubmit(async (values) => {
    const result = await finalizeOrder({
      customerPaid: Math.min(
        Math.max(Number(values.customerPaid) || 0, 0),
        totalPrice,
      ),
    });
    setStatus(
      result.success ? `تم حفظ الطلب رقم ${result.value.id}.` : result.error,
    );
  });

  return (
    <section className="self-start w-full  rounded-tr-3xl rounded-br-3xl bg-primary p-6 text-white shadow-xl shadow-primary/15 sm:p-8 md:col-span-5 md:sticky md:top-6">
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

      {draftPhotos.length === 0 ? (
        <div className="py-16 text-center text-white opacity-60">
          <div className="mb-3 flex justify-center ">
            <ShoppingBagIcon className="w-12 h-12" />
          </div>
          <p className="font-bold text-white/80">قائمة المنتجات فارغة</p>
          <p className="mt-1 text-sm">اختر قالبًا من الأعلى لإضافة أول منتج.</p>
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
                className="flex flex-col gap-2 rounded-2xl bg-white/10 p-4"
              >
                <div className="min-w-0 flex items-center gap-4">
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

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/70 text-xl font-bold">
                      ص
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <strong className="text-lg">
                      {money(photo.price * (photo.qty ?? 0))}
                    </strong>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        photo.id !== undefined && onEditPhoto(photo.id)
                      }
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
              </div>
            );
          })}
        </div>
      )}

      {totalPrice > 0 && (
        <Input.Root>
          <Input.Label className="mt-4 text-sm text-slate-200 font-bold">
            المبلغ المدفوع من العميل
          </Input.Label>
          <Input.Control
            type="number"
            min="0"
            max={totalPrice}
            registration={checkoutForm.register("customerPaid")}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mt-2 h-12 w-full rounded-xl border duration-100 border-slate-200 px-4 outline-none focus:ring-1 hover:border-slate-200/50"
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
          type="button"
          disabled={isBusy || draftPhotos.length === 0}
          onClick={() => void handleFinalize()}
          className="h-14 rounded-xl bg-white px-8 font-bold text-primary hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          تأكيد الطلب
        </button>
      </div>
    </section>
  );
});
