import usePaperStore from "@renderer/store/paper";
import usePhotosStore from "@renderer/store/photos";
import { Dispatch, SetStateAction } from "react";
import { TemplateFormValues, TemplateModalState } from "@renderer/types/types";

type props = {
  setIsBusy: Dispatch<SetStateAction<boolean>>;
  templateModal: TemplateModalState;
  setTemplateModal: Dispatch<SetStateAction<TemplateModalState>>;
  setStatus: Dispatch<SetStateAction<string>>;
};

export default function useTemplateSubmit({
  setIsBusy,
  templateModal,
  setTemplateModal,
  setStatus,
}: props) {
  const createTemplate = usePhotosStore((state) => state.createTemplate);
  const editTemplate = usePhotosStore((state) => state.editTemplate);
  const createPaperTemplate = usePaperStore(
    (state) => state.createPaperTemplate,
  );
  const editPaperTemplate = usePaperStore((state) => state.editPaperTemplate);

  const handleTemplateSubmit = async (values: TemplateFormValues) => {
    setIsBusy(true);

    if (templateModal.type === "photo") {
      const input = {
        name: values.name.trim(),
        width: Number(values.width),
        height: Number(values.height),
        unit: "cm",
        price: Number(values.price),
        cost: Number(values.cost),
      };
      const result =
        templateModal.editingId === null
          ? await createTemplate(input)
          : await editTemplate(templateModal.editingId, input);

      setIsBusy(false);
      if (!result.success) {
        setStatus(result.error);
        return;
      }
    } else {
      const input = {
        name: values.name.trim(),
        type: values.type.trim() || "عادي",
        width: Number(values.width),
        height: Number(values.height),
        price: Number(values.price),
        cost: Number(values.cost),
      };
      const result =
        templateModal.editingId === null
          ? await createPaperTemplate(input)
          : await editPaperTemplate(templateModal.editingId, input);

      setIsBusy(false);
      if (!result.success) {
        setStatus(result.error);
        return;
      }
    }
    setTemplateModal({ editingId: null, open: false, type: "photo" });
  };

  return { handleTemplateSubmit };
}
