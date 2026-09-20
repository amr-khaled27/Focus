import { getAdminInitialized } from "@main/db/index";

export async function checkAdminInitialized(): Promise<boolean> {
  console.log("checking admin");
  const isAdminInitialized: boolean = await getAdminInitialized();

  return isAdminInitialized;
}
