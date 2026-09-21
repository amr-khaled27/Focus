import { Photo } from "@shared/types/Photo";
import { PhotoTemplate } from "@shared/types/PhotoTemplate";

type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export default interface PhotosState {
  templates: PhotoTemplate[];
  draftPhotos: Photo[];
  loadTemplates: () => Promise<Result<PhotoTemplate[]>>;
  createTemplate: (
    template: Omit<PhotoTemplate, "id">,
  ) => Promise<Result<PhotoTemplate>>;
  editTemplate: (
    templateId: number,
    template: Omit<PhotoTemplate, "id">,
  ) => Promise<Result<PhotoTemplate>>;
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
  finalizeOrder: () => Promise<
    Result<{ id: number; itemCount: number; total: number }>
  >;
}
