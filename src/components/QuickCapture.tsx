import { useState, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import type { OhmCard, EnergyTag } from '../types/board';
import { ENERGY_CONFIG } from '../types/board';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface QuickCaptureProps {
  onAdd: (
    title: string,
    overrides?: Partial<Pick<OhmCard, 'description' | 'energy' | 'category' | 'nextStep'>>,
  ) => void;
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

export function QuickCapture({ onAdd, isOpen, onClose, categories }: QuickCaptureProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [energy, setEnergy] = useState<EnergyTag>('medium');
  const [category, setCategory] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setNextStep('');
    setEnergy('medium');
    setCategory('');
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      const desc = description.trim();
      const step = nextStep.trim();
      onAdd(trimmed, {
        ...(desc && { description: desc }),
        ...(step && { nextStep: step }),
        energy,
        ...(category && { category }),
      });
      resetForm();
      // Keep open for rapid-fire capture during a burst
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={18} className="text-ohm-spark" />
          <DialogTitle className="font-display text-xs uppercase tracking-widest text-ohm-spark">
            Quick Spark
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          Quickly capture a new idea or task
        </DialogDescription>

        {/* Title */}
        <Input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's the idea?"
          aria-label="New spark title"
          autoComplete="off"
          className="border-ohm-border bg-ohm-bg px-4 py-3 font-body text-sm text-ohm-text placeholder:text-ohm-muted/50 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
        />

        {/* Optional fields */}
        <div className="mt-2 space-y-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Notes or context (optional)"
            aria-label="Description"
            autoComplete="off"
            rows={1}
            className="resize-none border-ohm-border bg-ohm-bg px-3 py-2 font-body text-xs text-ohm-text placeholder:text-ohm-muted/30 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
          />
          <Input
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Next step (optional)"
            aria-label="Next step"
            autoComplete="off"
            className="border-ohm-border bg-ohm-bg px-3 py-2 font-body text-xs text-ohm-text placeholder:text-ohm-muted/30 focus-visible:ring-ohm-spark/20 focus-visible:ring-offset-0"
          />

          {/* Energy tags */}
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.entries(ENERGY_CONFIG) as [EnergyTag, { label: string; icon: LucideIcon }][]
            ).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setEnergy(key)}
                  className={`h-6 gap-1 px-2 font-body text-[10px] ${
                    energy === key
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  }`}
                >
                  <Icon size={10} />
                  <span>{config.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Category tags */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`h-6 px-2 font-body text-[10px] ${
                    category === cat
                      ? 'border-ohm-text/30 bg-ohm-text/10 text-ohm-text'
                      : 'border-ohm-border bg-ohm-bg text-ohm-muted hover:text-ohm-text'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>

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
