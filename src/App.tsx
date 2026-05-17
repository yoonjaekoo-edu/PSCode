import { AppLayout } from "@/ui/layout/AppLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { NewProblemModal } from "@/components/NewProblemModal";
import { SettingsModal } from "@/settings/SettingsModal";
import { useAppInit } from "@/hooks/useAppInit";

export default function App() {
  const { ready } = useAppInit();

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
        PSCode
      </div>
    );
  }

  return (
    <>
      <AppLayout />
      <CommandPalette />
      <NewProblemModal />
      <SettingsModal />
    </>
  );
}
