import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { compilerService } from "./compilerService";
import { useEditorStore } from "@/editor/editorStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { useTestcaseStore } from "@/testcase/testcaseStore";

export function useCompileRun() {
  const { t } = useTranslation();
  const run = useCallback(async () => {
    const { filePath, saveFile } = useEditorStore.getState();
    const { compilerPath, compilerFound } = useSettingsStore.getState();
    const { input } = useTestcaseStore.getState();
    const consoleStore = useConsoleStore.getState();

    if (!filePath) return;

    if (!compilerFound) {
      consoleStore.setBuildOutput(t("compiler.notFound"));
      consoleStore.setActiveTab("build");
      consoleStore.setRunning(false);
      return;
    }

    consoleStore.setRunning(true);
    consoleStore.setActiveTab("build");
    consoleStore.setBuildOutput(t("console.running"));
    consoleStore.setRunOutput("");

    try {
      await saveFile();
      await compilerService.compileAndRun(
        filePath,
        input,
        compilerPath || undefined,
      ).then((result) => {
        consoleStore.setBuildOutput(
          result.compileOutput || (result.success ? "" : t("console.compileFailed")),
        );

        if (result.compileOutput && !result.success && !result.runOutput) {
          consoleStore.setActiveTab("build");
        } else {
          const runText = [
            result.runOutput,
            result.runError ? `[stderr]\n${result.runError}` : "",
            t("console.executionTime", { ms: result.executionTimeMs }),
          ]
            .filter(Boolean)
            .join("\n\n");
          consoleStore.setRunOutput(runText);
          consoleStore.setActiveTab("run");
        }
      });
    } catch (err) {
      consoleStore.setBuildOutput(String(err));
      consoleStore.setActiveTab("build");
    } finally {
      consoleStore.setRunning(false);
    }
  }, [t]);

  return { run };
}
