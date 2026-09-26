import { StockLink } from "./Inventory";

export type PhotoTemplate = {
  id?: number;
  name: string;
  width: number;
  height: number;
  unit: string;
  price: number;
  cost: number;
};

// What the create/edit modal submits: the template's own fields plus
// the stock choice made in that same modal - a specific stock item and
// how much of it one unit of this template consumes, or null if the
// template is outsourced and should never touch inventory.
export type PhotoTemplateInput = Omit<PhotoTemplate, "id"> & {
  stockLink: StockLink;
};

// What getPhotoTemplates / createPhotoTemplate / editTemplate return:
// the template row plus its current stock link (or null), so the edit
// modal can pre-fill "linked to X, qty Y" vs. "outsourced" correctly.
export type PhotoTemplateWithStock = PhotoTemplate & {
  stockLink: StockLink;
};
