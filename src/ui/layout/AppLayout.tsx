import { Sidebar } from "@/components/Sidebar";
import { MonacoEditor } from "@/editor/MonacoEditor";
import { TestcasePanel } from "@/testcase/TestcasePanel";
import { OutputConsole } from "@/components/OutputConsole";
import { StatusBar } from "@/components/StatusBar";
import { ResizablePanel } from "./ResizablePanel";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { useSettingsStore } from "@/settings/settingsStore";

export function AppLayout() {
  const consoleVisible = useConsoleStore((s) => s.visible);
  const consoleHeight = useSettingsStore((s) => s.consoleHeight);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const persistSettings = useSettingsStore((s) => s.persistSettings);

  const onConsoleResize = (height: number) => {
    updateSettings({ consoleHeight: height });
    void persistSettings();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <div className="flex flex-1 min-h-0">
            <MonacoEditor />
          </div>
          <TestcasePanel />
          {consoleVisible && (
            <ResizablePanel
              height={consoleHeight}
              onResize={onConsoleResize}
              minHeight={100}
              maxHeight={450}
            >
              <OutputConsole />
            </ResizablePanel>
          )}
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
