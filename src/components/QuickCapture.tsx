import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTitle('');
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg text-ohm-spark">⚡</span>
          <DialogTitle className="font-display text-xs uppercase tracking-widest text-ohm-spark">
            Quick Spark
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          Quickly capture a new idea or task
        </DialogDescription>
        <Input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's the idea?"
          className="border-ohm-border bg-ohm-bg px-4 py-3 font-body text-sm text-ohm-text placeholder:text-ohm-muted/50 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="font-body text-[10px] text-ohm-muted">Enter to add · Esc to close</span>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-ohm-spark/20 font-display text-xs uppercase tracking-wider text-ohm-spark hover:bg-ohm-spark/30 active:bg-ohm-spark/40"
          >
            Spark it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
