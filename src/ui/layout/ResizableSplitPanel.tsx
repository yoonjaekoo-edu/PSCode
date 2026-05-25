import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";

interface ResizableSplitPanelProps {
  ratio: number;
  minRatio?: number;
  maxRatio?: number;
  onResize: (ratio: number) => void;
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function ResizableSplitPanel({
  ratio,
  minRatio = 0.3,
  maxRatio = 0.85,
  onResize,
  left,
  right,
  className,
}: ResizableSplitPanelProps) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startRatio = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const delta = e.clientX - startX.current;
      const deltaRatio = delta / rect.width;
      const next = Math.max(minRatio, Math.min(maxRatio, startRatio.current + deltaRatio));
      onResize(next);
    },
    [maxRatio, minRatio, onResize],
  );

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-1 min-h-0 min-w-0", className)}
    >
      <div className="flex flex-col overflow-hidden min-w-0" style={{ width: `${ratio * 100}%` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        className="w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors shrink-0 bg-[var(--border)]"
        onMouseDown={(e: React.MouseEvent) => {
          dragging.current = true;
          startX.current = e.clientX;
          startRatio.current = ratio;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {right}
      </div>
    </div>
  );
}
