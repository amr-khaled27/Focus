import { is } from "@electron-toolkit/utils";
import { WebFrameMain } from "electron";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

export function validateEventFrame(
  frame: WebFrameMain | null,
): asserts frame is WebFrameMain {
  if (!frame) {
    throw new Error("Missing frame target");
  }

  const frameUrl = new URL(frame.url);

  if (is.dev) {
    const isLocalDev =
      frameUrl.protocol === "http:" &&
      frameUrl.hostname === "localhost" &&
      frameUrl.port === "5173";

    if (isLocalDev) return;
  }

  const expectedFileUrl = pathToFileURL(
    join(__dirname, "../renderer/index.html"),
  );

  const isMatchingFile =
    frameUrl.protocol === "file:" &&
    frameUrl.pathname === expectedFileUrl.pathname;

  if (!isMatchingFile) {
    throw new Error(`Unauthorized frame origin: ${frame.url}`);
  }
}
