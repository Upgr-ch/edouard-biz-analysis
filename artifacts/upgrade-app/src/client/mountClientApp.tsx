import { createRoot } from "react-dom/client";
import { assertBrowserRuntime } from "../runtime/environment";
import ClientApp from "./ClientApp";
import "../index.css";

export function mountClientApp(): void {
  assertBrowserRuntime("mount Édouard client application");

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Unable to mount Édouard: missing element "#root"');
  }

  createRoot(rootElement).render(<ClientApp />);
}