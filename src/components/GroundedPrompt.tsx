import { useState, useRef, useEffect } from 'react';
import type { OhmCard } from '../types/board';

interface GroundedPromptProps {
  card: OhmCard;
  onConfirm: (cardId: string, whereILeftOff: string) => void;
  onCancel: () => void;
}

export function GroundedPrompt({ card, onConfirm, onCancel }: GroundedPromptProps) {
  const [text, setText] = useState(card.whereILeftOff);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = () => {
    onConfirm(card.id, text.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="animate-slide-up relative mx-4 mb-4 w-full sm:mb-0 sm:max-w-md">
        <div className="rounded-xl border border-ohm-grounded/30 bg-ohm-surface p-4 shadow-2xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg text-ohm-grounded">📍</span>
            <span className="font-display text-xs uppercase tracking-widest text-ohm-grounded">
              Grounding
            </span>
          </div>

          <p className="mb-1 font-body text-sm text-ohm-text">
            <span className="font-medium">{card.title}</span>
          </p>
          <p className="mb-3 font-body text-xs text-ohm-muted">
            Leave a note for future you — where did you stop? What should you do next?
          </p>

          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="I was in the middle of..."
            rows={3}
            className="w-full resize-none rounded-lg border border-ohm-border bg-ohm-bg px-4 py-3 font-body text-sm text-ohm-text transition-colors placeholder:text-ohm-muted/50 focus:border-ohm-grounded/50 focus:outline-none focus:ring-1 focus:ring-ohm-grounded/20"
          />

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => onConfirm(card.id, '')}
              className="font-body text-[10px] text-ohm-muted transition-colors hover:text-ohm-text"
            >
              Skip (ground without note)
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-ohm-grounded/20 px-4 py-1.5 font-display text-xs uppercase tracking-wider text-ohm-grounded transition-colors hover:bg-ohm-grounded/30 active:bg-ohm-grounded/40"
            >
              Ground it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
