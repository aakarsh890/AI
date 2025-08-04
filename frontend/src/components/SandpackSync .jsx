import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect } from "react";

function SandpackSync({ activeTab }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (activeTab === "preview") {
      sandpack.runSandpack();
    }
  }, [activeTab]);

  return null;
}

export default SandpackSync;
