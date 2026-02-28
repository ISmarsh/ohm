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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          onClose();
          setTitle('');
        }}
      />

      {/* Input panel */}
      <div className="animate-slide-up relative mx-4 mb-4 w-full sm:mb-0 sm:max-w-md">
        <div className="rounded-xl border border-ohm-border bg-ohm-surface p-4 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg text-ohm-spark">⚡</span>
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
            className="w-full rounded-lg border border-ohm-border bg-ohm-bg px-4 py-3 font-body text-sm text-ohm-text transition-colors placeholder:text-ohm-muted/50 focus:border-ohm-spark/50 focus:outline-none focus:ring-1 focus:ring-ohm-spark/20"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-body text-[10px] text-ohm-muted">
              Enter to add · Esc to close
            </span>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="rounded-lg bg-ohm-spark/20 px-4 py-1.5 font-display text-xs uppercase tracking-wider text-ohm-spark transition-colors hover:bg-ohm-spark/30 active:bg-ohm-spark/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Spark it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
