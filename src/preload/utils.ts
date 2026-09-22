import { EventPayloadMapping } from "@shared/types/EventPayloadMapping";
import { ipcRenderer } from "electron/renderer";

export function invoke<K extends keyof EventPayloadMapping>(
  channel: K,
  ...args: unknown[]
): Promise<EventPayloadMapping[K]> {
  return ipcRenderer.invoke(channel, ...args);
}
