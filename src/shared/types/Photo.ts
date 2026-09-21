export type Photo = {
  createdAt: string;
  templateId: number;
  price: number;
  width: number;
  height: number;
  id?: number | undefined;
  qty?: number | undefined;
  personName?: string | null | undefined;
  photoName?: string | null | undefined;
  orderId?: number | null | undefined;
};
