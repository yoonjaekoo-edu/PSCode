import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";

interface ResizablePanelProps {
  height: number;
  minHeight?: number;
  maxHeight?: number;
  onResize: (height: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResizablePanel({
  height,
  minHeight = 80,
  maxHeight = 500,
  onResize,
  children,
  className,
}: ResizablePanelProps) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startY.current - e.clientY;
      const next = Math.min(
        maxHeight,
        Math.max(minHeight, startHeight.current + delta),
      );
      onResize(next);
    },
    [maxHeight, minHeight, onResize],
  );

  const onMouseUp = useCallback(() => {
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
      className={cn(
        "flex flex-col border-t border-[var(--border)] shrink-0",
        className,
      )}
      style={{ height }}
    >
      <div
        role="separator"
        aria-orientation="horizontal"
        className="h-1 cursor-row-resize hover:bg-[var(--accent)] transition-colors shrink-0"
        onMouseDown={(e: React.MouseEvent) => {
          dragging.current = true;
          startY.current = e.clientY;
          startHeight.current = height;
          document.body.style.cursor = "row-resize";
          document.body.style.userSelect = "none";
        }}
      />
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
