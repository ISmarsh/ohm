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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full sm:max-w-md mx-4 mb-4 sm:mb-0 animate-slide-up">
        <div className="bg-ohm-surface border border-ohm-grounded/30 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-ohm-grounded text-lg">📍</span>
            <span className="font-display text-xs uppercase tracking-widest text-ohm-grounded">
              Grounding
            </span>
          </div>

          <p className="text-sm text-ohm-text font-body mb-1">
            <span className="font-medium">{card.title}</span>
          </p>
          <p className="text-xs text-ohm-muted font-body mb-3">
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
            className="
              w-full bg-ohm-bg border border-ohm-border rounded-lg
              px-4 py-3 text-sm text-ohm-text font-body resize-none
              placeholder:text-ohm-muted/50
              focus:outline-none focus:border-ohm-grounded/50 focus:ring-1 focus:ring-ohm-grounded/20
              transition-colors
            "
          />

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => onConfirm(card.id, '')}
              className="text-[10px] text-ohm-muted font-body hover:text-ohm-text transition-colors"
            >
              Skip (ground without note)
            </button>
            <button
              onClick={handleSubmit}
              className="
                font-display text-xs uppercase tracking-wider
                px-4 py-1.5 rounded-lg
                bg-ohm-grounded/20 text-ohm-grounded
                hover:bg-ohm-grounded/30 active:bg-ohm-grounded/40
                transition-colors
              "
            >
              Ground it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
