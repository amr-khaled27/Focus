export type TemplateFormValues = {
  name: string;
  type: string;
  width: string;
  height: string;
  price: string;
  cost: string;
  // Stock link chosen in the modal.
  // "" means outsourced - the template never draws from inventory.
  stockId: string;
  stockQuantityUsed: string;
};

export type TemplateModalState = {
  open: boolean;
  editingId: number | null;
  type: "photo" | "paper";
};
