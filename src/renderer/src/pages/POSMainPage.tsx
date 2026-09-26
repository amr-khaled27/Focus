import { Checkout } from "@renderer/components/POS/Checkout";
import { ItemModal } from "@renderer/components/POS/ItemModal";
import { TemplateGrid } from "@renderer/components/POS/TemplateGrid";
import { TemplateModal } from "@renderer/components/POS/TemplateModal";
import usePhotosStore from "@renderer/store/photos";
import usePaperStore from "@renderer/store/paper";
import useSettingsStore from "@renderer/store/settings";
import { useCallback, useEffect, useState } from "react";
import { TemplateFormValues, TemplateModalState } from "@renderer/types/types";
import useTemplateSubmit from "@renderer/hooks/useHandleTemplateSubmit";

export default function POSMainPage() {
  console.log("main page rerender");
  const user = useSettingsStore((state) => state.user);

  // Photo store hooks
  const loadTemplates = usePhotosStore((state) => state.loadTemplates);
  const loadDraftPhotos = usePhotosStore((state) => state.loadDraftPhotos);

  // Paper store hooks
  const loadPaperTemplates = usePaperStore((state) => state.loadPaperTemplates);
  const loadDraftPaperItems = usePaperStore(
    (state) => state.loadDraftPaperItems,
  );

  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    type: "photo" | "paper";
  } | null>(null);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [templateModal, setTemplateModal] = useState<TemplateModalState>({
    open: false,
    editingId: null,
    type: "photo",
  });
  const [templateInitialValues, setTemplateInitialValues] = useState<
    TemplateFormValues | undefined
  >(undefined);
  const [status, setStatus] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  // hooks
  const { handleTemplateSubmit } = useTemplateSubmit({
    setIsBusy,
    templateModal,
    setTemplateModal,
    setStatus,
  });

  useEffect(() => {
    void Promise.all([
      loadTemplates(),
      loadDraftPhotos(),
      loadPaperTemplates(),
      loadDraftPaperItems(),
    ]).then((results) => {
      const failed = results.find((result) => !result.success);
      if (failed && !failed.success) setStatus(failed.error);
    });
  }, [loadTemplates, loadDraftPhotos, loadPaperTemplates, loadDraftPaperItems]);

  const closeItemModal = useCallback(() => {
    setSelectedTemplate(null);
    setEditingItemId(null);
  }, []);

  const openItemModal = useCallback(
    (templateId: number, type: "photo" | "paper") => {
      setEditingItemId(null);
      setSelectedTemplate({ id: templateId, type });
    },
    [],
  );

  const openTemplateModal = useCallback(() => {
    setTemplateInitialValues(undefined);
    setTemplateModal({ open: true, editingId: null, type: "photo" });
  }, []);

  const openTemplateEdit = useCallback(
    (templateId: number, type: "photo" | "paper") => {
      if (type === "photo") {
        const template = usePhotosStore
          .getState()
          .templates.find((item) => item.id === templateId);
        if (!template) return;
        setTemplateInitialValues({
          name: template.name,
          type: "صورة",
          width: String(template.width),
          height: String(template.height),
          price: String(template.price),
          cost: String(template.cost),
        });
      } else {
        const template = usePaperStore
          .getState()
          .paperTemplates.find((item) => item.id === templateId);
        if (!template) return;
        setTemplateInitialValues({
          name: template.name,
          type: template.type || "عادي",
          width: String(template.width),
          height: String(template.height),
          price: String(template.price),
          cost: String(template.cost),
        });
      }
      setTemplateModal({ open: true, editingId: templateId, type });
    },
    [],
  );

  const openPhotoEdit = useCallback((photoId: number) => {
    const photo = usePhotosStore
      .getState()
      .draftPhotos.find((item) => item.id === photoId);
    if (!photo) return;
    setSelectedTemplate({ id: photo.templateId, type: "photo" });
    setEditingItemId(photoId);
  }, []);

  const openPaperEdit = useCallback((paperId: number) => {
    const paper = usePaperStore
      .getState()
      .draftPaperItems.find((item) => item.id === paperId);
    if (!paper) return;
    setSelectedTemplate({ id: paper.paperTemplateId, type: "paper" });
    setEditingItemId(paperId);
  }, []);

  const handleEditItem = useCallback(
    (id: number, type: "photo" | "paper") => {
      if (type === "photo") {
        openPhotoEdit(id);
      } else {
        openPaperEdit(id);
      }
    },
    [openPhotoEdit, openPaperEdit],
  );

  const closeTemplateModal = useCallback(() => {
    setTemplateModal({ open: false, editingId: null, type: "photo" });
    setTemplateInitialValues(undefined);
  }, []);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        لا يوجد مستخدم مسجل الدخول
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-text">
      <div className="grid min-h-0 flex-1 w-full gap-4 overflow-y-auto md:grid-cols-12 md:items-start lg:gap-8">
        <TemplateGrid
          selectedTemplateId={selectedTemplate?.id ?? null}
          selectedType={selectedTemplate?.type ?? null}
          onSelect={openItemModal}
          onCreate={openTemplateModal}
          onEdit={openTemplateEdit}
        />
        <Checkout isBusy={isBusy} onEditItem={handleEditItem} />
        {status && (
          <p
            role="status"
            className="rounded-xl bg-accent/5 px-4 py-3 text-sm font-bold text-accent md:col-span-12"
          >
            {status}
          </p>
        )}
      </div>

      {selectedTemplate && (
        <ItemModal
          templateId={selectedTemplate.id}
          type={selectedTemplate.type}
          editingItemId={editingItemId}
          onClose={closeItemModal}
        />
      )}

      <TemplateModal
        open={templateModal.open}
        editingId={templateModal.editingId}
        kind={templateModal.type}
        onKindChange={(type) => setTemplateModal((prev) => ({ ...prev, type }))}
        initialValues={templateInitialValues}
        isBusy={isBusy}
        onClose={closeTemplateModal}
        onSubmit={handleTemplateSubmit}
      />
    </main>
  );
}
