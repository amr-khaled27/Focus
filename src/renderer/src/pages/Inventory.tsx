import { Input } from "@renderer/components/shared/Input";
import useStockStore from "@renderer/store/stock";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Minus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type StockFormValues = {
  name: string;
  unit: string;
  quantityOnHand: string;
  reorderLevel: string;
  costPerUnit: string;
};

const money = (value: number) => `${value.toFixed(2)} ج.م`;

const emptyValues: StockFormValues = {
  name: "",
  unit: "",
  quantityOnHand: "0",
  reorderLevel: "0",
  costPerUnit: "0",
};

type StockModalProps = {
  open: boolean;
  isBusy: boolean;
  initialValues?: StockFormValues;
  editingId: number | null;
  onClose: () => void;
  onSubmit: (values: StockFormValues, editingId: number | null) => void;
};

const StockModal = memo(function StockModal({
  open,
  isBusy,
  initialValues,
  editingId,
  onClose,
  onSubmit,
}: StockModalProps) {
  const form = useForm<StockFormValues>({
    defaultValues: initialValues ?? emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues ?? emptyValues);
    }
  }, [open, initialValues, form]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-text">
            {editingId ? "تعديل مادة" : "إضافة مادة جديدة"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => onSubmit(values, editingId))}
        >
          <Input.Root>
            <Input.Label className="text-sm font-bold text-slate-600">
              اسم المادة
            </Input.Label>
            <Input.Control
              type="text"
              registration={form.register("name", { required: true })}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1"
            />
          </Input.Root>

          <div className="grid grid-cols-2 gap-4">
            <Input.Root>
              <Input.Label className="text-sm font-bold text-slate-600">
                الوحدة
              </Input.Label>
              <Input.Control
                type="text"
                placeholder="لفة، لتر، فرخ..."
                registration={form.register("unit", { required: true })}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1"
              />
            </Input.Root>

            <Input.Root>
              <Input.Label className="text-sm font-bold text-slate-600">
                الكمية الحالية
              </Input.Label>
              <Input.Control
                type="number"
                min="0"
                step="any"
                registration={form.register("quantityOnHand")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Input.Root>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input.Root>
              <Input.Label className="text-sm font-bold text-slate-600">
                حد التنبيه الأدنى
              </Input.Label>
              <Input.Control
                type="number"
                min="0"
                step="any"
                registration={form.register("reorderLevel")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Input.Root>

            <Input.Root>
              <Input.Label className="text-sm font-bold text-slate-600">
                تكلفة الوحدة
              </Input.Label>
              <Input.Control
                type="number"
                min="0"
                step="any"
                registration={form.register("costPerUnit")}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none duration-100 hover:border-slate-300 focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Input.Root>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="h-12 rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="h-12 rounded-xl bg-primary px-8 font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default function Inventory() {
  const stocks = useStockStore((state) => state.stocks);
  const loadStocks = useStockStore((state) => state.loadStocks);
  const createStock = useStockStore((state) => state.createStock);
  const editStock = useStockStore((state) => state.editStock);
  const deleteStock = useStockStore((state) => state.deleteStock);
  const adjustStockQuantity = useStockStore(
    (state) => state.adjustStockQuantity,
  );

  const [search, setSearch] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialValues, setInitialValues] = useState<
    StockFormValues | undefined
  >(undefined);

  useEffect(() => {
    void loadStocks();
  }, [loadStocks]);

  const filteredStocks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stocks;
    return stocks.filter((item) => item.name.toLowerCase().includes(query));
  }, [stocks, search]);

  const lowStockCount = useMemo(
    () =>
      stocks.filter((item) => item.quantityOnHand <= (item.reorderLevel ?? 0))
        .length,
    [stocks],
  );

  const openCreate = useCallback(() => {
    setEditingId(null);
    setInitialValues(undefined);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback(
    (stockId: number) => {
      const stock = stocks.find((item) => item.id === stockId);
      if (!stock) return;
      setInitialValues({
        name: stock.name,
        unit: stock.unit,
        quantityOnHand: String(stock.quantityOnHand),
        reorderLevel: String(stock.reorderLevel ?? 0),
        costPerUnit: String(stock.costPerUnit),
      });
      setEditingId(stockId);
      setModalOpen(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [stocks],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setInitialValues(undefined);
  }, []);

  const handleSubmit = useCallback(
    async (values: StockFormValues, currentEditingId: number | null) => {
      setIsBusy(true);
      setStatus("");

      const payload = {
        name: values.name.trim(),
        unit: values.unit.trim(),
        quantityOnHand: parseFloat(values.quantityOnHand) || 0,
        reorderLevel: parseFloat(values.reorderLevel) || 0,
        costPerUnit: parseFloat(values.costPerUnit) || 0,
      };

      const result = currentEditingId
        ? await editStock(currentEditingId, payload)
        : await createStock(payload);

      setIsBusy(false);

      if (result.success) {
        setStatus(currentEditingId ? "تم تعديل المادة." : "تمت إضافة المادة.");
        setModalOpen(false);
        setEditingId(null);
        setInitialValues(undefined);
      } else {
        setStatus(result.error || "حدث خطأ أثناء الحفظ.");
      }
    },
    [createStock, editStock],
  );

  const handleDelete = useCallback(
    async (stockId: number) => {
      setIsBusy(true);
      const result = await deleteStock(stockId);
      setIsBusy(false);
      setStatus(
        result.success ? "تم حذف المادة." : result.error || "خطأ في الحذف",
      );
    },
    [deleteStock],
  );

  const handleAdjust = useCallback(
    async (stockId: number, delta: number) => {
      setIsBusy(true);
      const result = await adjustStockQuantity(stockId, delta);
      setIsBusy(false);
      if (!result.success) {
        setStatus(result.error || "تعذر تحديث الكمية.");
      }
    },
    [adjustStockQuantity],
  );

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-text">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-accent">المخزون</p>
            <h2 className="text-3xl font-bold">المواد الخام</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lowStockCount > 0 && (
              <span className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {lowStockCount} مادة منخفضة المخزون
              </span>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="بحث عن مادة..."
                className="h-11 w-52 rounded-xl border border-slate-200 bg-white pr-9 pl-4 text-sm outline-none duration-100 hover:border-slate-300 focus:ring-1"
              />
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              إضافة مادة
            </button>
          </div>
        </div>

        {status && (
          <p
            role="status"
            className="rounded-xl bg-accent/5 px-4 py-3 text-sm font-bold text-accent"
          >
            {status}
          </p>
        )}

        {filteredStocks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-slate-400">
            <div className="mb-3 flex justify-center">
              <Package className="h-12 w-12" />
            </div>
            <p className="font-bold text-slate-500">
              {stocks.length === 0
                ? "لا توجد مواد في المخزون بعد"
                : "لا توجد نتائج مطابقة للبحث"}
            </p>
            <p className="mt-1 text-sm">
              {stocks.length === 0 &&
                'اضغط على "إضافة مادة" لتسجيل أول مادة خام.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStocks.map((stock) => {
              const isLow = stock.quantityOnHand <= (stock.reorderLevel ?? 0);
              return (
                <div
                  key={stock.id}
                  className={`group relative flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
                    isLow
                      ? "border-red-200"
                      : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${
                          isLow ? "bg-red-500" : "bg-secondary/70"
                        }`}
                      >
                        <Package className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{stock.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          الوحدة: {stock.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          stock.id !== undefined && openEdit(stock.id)
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          stock.id !== undefined && void handleDelete(stock.id)
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <button
                      type="button"
                      disabled={isBusy || stock.quantityOnHand <= 0}
                      onClick={() =>
                        stock.id !== undefined &&
                        void handleAdjust(stock.id, -1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${
                          isLow ? "text-red-600" : "text-text"
                        }`}
                      >
                        {stock.quantityOnHand}
                      </p>
                      <p className="text-xs text-slate-400">
                        الحد الأدنى: {stock.reorderLevel ?? 0}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        stock.id !== undefined && void handleAdjust(stock.id, 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">تكلفة الوحدة</span>
                    <strong className="text-primary">
                      {money(stock.costPerUnit)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StockModal
        open={modalOpen}
        isBusy={isBusy}
        editingId={editingId}
        initialValues={initialValues}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
