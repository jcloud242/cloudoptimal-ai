import { useState, useRef, useEffect } from "react";

export default function ResizableDivider({
  leftPanel,
  rightPanel,
  onResize,
  initialLeftWidth = 40,
  minLeftWidth = 25,
  maxLeftWidth = 60,
}) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;

      if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
        setLeftWidth(newLeftWidth);
        onResize?.(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onResize, minLeftWidth, maxLeftWidth]);

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${leftWidth}%` }} className="flex flex-col overflow-hidden">
        {leftPanel}
      </div>

      <div
        className={`w-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors cursor-col-resize ${
          isResizing ? "bg-blue-500 dark:bg-blue-500" : ""
        }`}
        onMouseDown={() => setIsResizing(true)}
      />

      <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
