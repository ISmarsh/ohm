import { useState, useRef, useEffect } from 'react';

interface QuickCaptureProps {
  onAdd: (title: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCapture({ onAdd, isOpen, onClose }: QuickCaptureProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation start
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      onAdd(trimmed);
      setTitle('');
      // Keep open for rapid-fire capture during a burst
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
      setTitle('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          onClose();
          setTitle('');
        }}
      />

      {/* Input panel */}
      <div className="relative w-full sm:max-w-md mx-4 mb-4 sm:mb-0 animate-slide-up">
        <div className="bg-ohm-surface border border-ohm-border rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-ohm-spark text-lg">⚡</span>
            <span className="font-display text-xs uppercase tracking-widest text-ohm-spark">
              Quick Spark
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's the idea?"
            className="
              w-full bg-ohm-bg border border-ohm-border rounded-lg
              px-4 py-3 text-ohm-text font-body text-sm
              placeholder:text-ohm-muted/50
              focus:outline-none focus:border-ohm-spark/50 focus:ring-1 focus:ring-ohm-spark/20
              transition-colors
            "
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-ohm-muted font-body">
              Enter to add · Esc to close
            </span>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="
                font-display text-xs uppercase tracking-wider
                px-4 py-1.5 rounded-lg
                bg-ohm-spark/20 text-ohm-spark
                hover:bg-ohm-spark/30 active:bg-ohm-spark/40
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Spark it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
