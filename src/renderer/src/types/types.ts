export type TemplateFormValues = {
  name: string;
  type: string;
  width: string;
  height: string;
  price: string;
  cost: string;
};

export type TemplateModalState = {
  open: boolean;
  editingId: number | null;
  type: "photo" | "paper";
};
