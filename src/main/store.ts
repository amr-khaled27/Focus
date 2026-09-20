import Store from "electron-store";

interface StoreSchema {
  theme: string;
}

export const store = new Store<StoreSchema>({
  schema: {
    theme: {
      type: "string",
      default: "light",
    },
  },
});
