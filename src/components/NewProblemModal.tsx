import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/ui/stores/uiStore";
import { workspaceService } from "@/workspace/workspaceService";
import { useWorkspaceStore } from "@/workspace/workspaceStore";
import { previewFilename } from "@/workspace/filenameUtils";

export function NewProblemModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.newProblemOpen);
  const setOpen = useUiStore((s) => s.setNewProblemOpen);
  const refreshToday = useWorkspaceStore((s) => s.refreshToday);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const path = await workspaceService.createProblem(name.trim());
      await workspaceService.openFile(path);
      await refreshToday();
      setName("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newProblem.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError("");
    setOpen(false);
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">{t("newProblem.title")}</h2>
        </div>
        <div className="p-4 space-y-3">
          <label className="block text-sm text-[var(--text-secondary)]">
            {t("newProblem.nameLabel")}
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
              placeholder={t("newProblem.namePlaceholder")}
              className="mt-1 w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          {name.trim() && (
            <p className="text-xs text-[var(--text-muted)] font-mono">
              → {previewFilename(name)}
            </p>
          )}
          {error && <p className="text-xs text-[var(--error)]">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
          <ModalButton variant="ghost" onClick={handleClose}>
            {t("newProblem.cancel")}
          </ModalButton>
          <ModalButton
            onClick={() => void handleCreate()}
            disabled={loading || !name.trim()}
          >
            {t("newProblem.create")}
          </ModalButton>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        variant === "primary"
          ? "px-4 py-1.5 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white rounded transition-colors"
          : "px-4 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      }
    >
      {children}
    </button>
  );
}
