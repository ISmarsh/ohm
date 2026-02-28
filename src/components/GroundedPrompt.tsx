import { useState, useRef, useEffect } from 'react';
import type { OhmCard } from '../types/board';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

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
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="border-ohm-grounded/30 sm:max-w-md">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg text-ohm-grounded">📍</span>
          <DialogTitle className="font-display text-xs uppercase tracking-widest text-ohm-grounded">
            Grounding
          </DialogTitle>
        </div>

        <DialogDescription asChild>
          <div>
            <p className="mb-1 font-body text-sm text-ohm-text">
              <span className="font-medium">{card.title}</span>
            </p>
            <p className="mb-3 font-body text-xs text-ohm-muted">
              Leave a note for future you — where did you stop? What should you do next?
            </p>
          </div>
        </DialogDescription>

        <Textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="I was in the middle of..."
          rows={3}
          className="resize-none border-ohm-border bg-ohm-bg px-4 py-3 font-body text-sm text-ohm-text placeholder:text-ohm-muted/50 focus-visible:ring-ohm-grounded/20 focus-visible:ring-offset-0"
        />

        <div className="mt-1 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onConfirm(card.id, '')}
            className="h-auto p-0 font-body text-[10px] text-ohm-muted hover:bg-transparent hover:text-ohm-text"
          >
            Skip (ground without note)
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-ohm-grounded/20 font-display text-xs uppercase tracking-wider text-ohm-grounded hover:bg-ohm-grounded/30 active:bg-ohm-grounded/40"
          >
            Ground it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
