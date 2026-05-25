import { Sidebar } from "@/components/Sidebar";
import { MonacoEditor } from "@/editor/MonacoEditor";
import { MarkdownViewer } from "@/editor/MarkdownViewer";
import { TestcasePanel } from "@/testcase/TestcasePanel";
import { OutputConsole } from "@/components/OutputConsole";
import { StatusBar } from "@/components/StatusBar";
import { ResizablePanel } from "./ResizablePanel";
import { ResizableSplitPanel } from "./ResizableSplitPanel";
import { useConsoleStore } from "@/ui/stores/consoleStore";
import { useSettingsStore } from "@/settings/settingsStore";
import { useMarkdownStore } from "@/editor/markdownStore";
import { useEditorStore } from "@/editor/editorStore";

export function AppLayout() {
  const consoleVisible = useConsoleStore((s) => s.visible);
  const consoleHeight = useSettingsStore((s) => s.consoleHeight);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const persistSettings = useSettingsStore((s) => s.persistSettings);
  const mdFilePath = useMarkdownStore((s) => s.filePath);
  const mdSplitRatio = useMarkdownStore((s) => s.splitRatio);
  const setMdSplitRatio = useMarkdownStore((s) => s.setSplitRatio);
  const editorFilePath = useEditorStore((s) => s.filePath);

  const onConsoleResize = (height: number) => {
    updateSettings({ consoleHeight: height });
    void persistSettings();
  };

  const showSplit = mdFilePath && editorFilePath;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {showSplit ? (
            <ResizableSplitPanel
              ratio={mdSplitRatio}
              onResize={setMdSplitRatio}
              left={<MonacoEditor />}
              right={<MarkdownViewer />}
              className="min-h-0"
            />
          ) : (
            <div className="flex flex-1 min-h-0">
              <MonacoEditor />
            </div>
          )}
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
