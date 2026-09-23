import { PaperTemplate } from "@shared/types/PaperTemplate";
import { PaperItem } from "@shared/types/PaperItem";

export type ApiResponse<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export interface PaperState {
  // State
  paperTemplates: PaperTemplate[];
  draftPaperItems: PaperItem[];

  // Actions
  loadPaperTemplates: () => Promise<ApiResponse<PaperTemplate[]>>;
  createPaperTemplate: (
    template: Omit<PaperTemplate, "id">,
  ) => Promise<ApiResponse<PaperTemplate>>;
  editPaperTemplate: (
    templateId: number,
    template: Omit<PaperTemplate, "id">,
  ) => Promise<ApiResponse<PaperTemplate>>;
  deletePaperTemplate: (templateId: number) => Promise<ApiResponse<void>>;

  addDraftPaperItem: (input: {
    paperTemplateId: number;
    qty: number;
  }) => Promise<ApiResponse<PaperItem>>;
  editDraftPaperItem: (
    paperItemId: number,
    input: {
      paperTemplateId: number;
      qty: number;
    },
  ) => Promise<ApiResponse<PaperItem>>;
  deleteDraftPaperItem: (paperItemId: number) => Promise<ApiResponse<void>>;
  loadDraftPaperItems: () => Promise<ApiResponse<PaperItem[]>>;

  finalizeOrder: (payload: {
    customerPaid: number;
  }) => Promise<ApiResponse<{ itemCount: number; total: number }>>;
}

export default PaperState;
