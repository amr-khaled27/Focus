import { Photo } from "@shared/types/Photo";
import {
  PhotoTemplateInput,
  PhotoTemplateWithStock,
} from "@shared/types/PhotoTemplate";

type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export default interface PhotosState {
  templates: PhotoTemplateWithStock[];
  draftPhotos: Photo[];
  loadTemplates: () => Promise<Result<PhotoTemplateWithStock[]>>;
  createTemplate: (
    template: PhotoTemplateInput,
  ) => Promise<Result<PhotoTemplateWithStock>>;
  editTemplate: (
    templateId: number,
    template: PhotoTemplateInput,
  ) => Promise<Result<PhotoTemplateWithStock>>;
  addDraftPhoto: (input: {
    templateId: number;
    personName?: string;
    photoName?: string;
    qty: number;
  }) => Promise<Result<Photo>>;
  deleteDraftPhoto: (photoId: number) => Promise<Result<void>>;
  editDraftPhoto: (
    photoId: number,
    input: {
      templateId: number;
      personName?: string;
      photoName?: string;
      qty: number;
    },
  ) => Promise<Result<Photo>>;
  loadDraftPhotos: () => Promise<Result<Photo[]>>;
  finalizeOrder: ({
    customerPaid,
  }: {
    customerPaid: number;
  }) => Promise<Result<{ itemCount: number; total: number }>>;
}
