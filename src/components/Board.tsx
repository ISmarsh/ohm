import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { OhmCard, ColumnStatus } from '../types/board';
import { COLUMNS } from '../types/board';
import { getColumnCards, isOverWipLimit } from '../utils/board-utils';
import { useBoard } from '../hooks/useBoard';
import { Button } from './ui/button';
import { Column } from './Column';
import { Card } from './Card';
import { QuickCapture } from './QuickCapture';
import { CardDetail } from './CardDetail';
import { GroundedPrompt } from './GroundedPrompt';

export function Board() {
  const { board, quickAdd, move, updateCard, deleteCard, addCategory, removeCategory } = useBoard();

  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<OhmCard | null>(null);
  const [groundingCard, setGroundingCard] = useState<OhmCard | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drag sensors — with distance threshold to allow taps
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const cardId = active.id as string;
      const card = board.cards.find((c) => c.id === cardId);
      if (!card) return;

      // Determine target column — over could be a card or a column droppable
      let targetStatus: ColumnStatus | null = null;

      // Check if dropped over a column
      if (COLUMNS.some((col) => col.status === over.id)) {
        targetStatus = over.id as ColumnStatus;
      } else {
        // Dropped over another card — find that card's column
        const targetCard = board.cards.find((c) => c.id === over.id);
        if (targetCard) {
          targetStatus = targetCard.status;
        }
      }

      if (!targetStatus || targetStatus === card.status) return;

      // If moving to Grounded, prompt for context
      if (targetStatus === 'grounded') {
        setGroundingCard({ ...card, status: targetStatus });
        return;
      }

      move(cardId, targetStatus);
    },
    [board.cards, move],
  );

  const handleGroundConfirm = useCallback(
    (cardId: string, whereILeftOff: string) => {
      move(cardId, 'grounded', whereILeftOff);
      setGroundingCard(null);
    },
    [move],
  );

  const activeCard = activeId ? (board.cards.find((c) => c.id === activeId) ?? null) : null;

  const wipWarning = isOverWipLimit(board);

  return (
    <div className="flex min-h-screen flex-col bg-ohm-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ohm-border bg-ohm-bg/90 backdrop-blur-md">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold tracking-tight text-ohm-text">Ω</span>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-ohm-text">
              Ohm
            </span>
          </div>
        </div>
      </header>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
          <div className="flex flex-col gap-3 p-4 md:min-h-[calc(100vh-56px)] md:flex-row md:gap-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                column={col}
                cards={getColumnCards(board, col.status)}
                onCardTap={setSelectedCard}
                wipWarning={col.status === 'live' && wipWarning}
                defaultExpanded={col.status === 'live'}
              />
            ))}
          </div>
        </main>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 scale-105">
              <Card card={activeCard} onTap={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Quick capture modal */}
      <QuickCapture
        isOpen={captureOpen}
        onAdd={(title) => quickAdd(title)}
        onClose={() => setCaptureOpen(false)}
      />

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          categories={board.categories}
          onUpdate={(updated) => {
            updateCard(updated);
            setSelectedCard(null);
          }}
          onDelete={(id) => {
            deleteCard(id);
            setSelectedCard(null);
          }}
          onClose={() => setSelectedCard(null)}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
        />
      )}

      {/* Grounded prompt modal */}
      {groundingCard && (
        <GroundedPrompt
          card={groundingCard}
          onConfirm={handleGroundConfirm}
          onCancel={() => setGroundingCard(null)}
        />
      )}

      {/* Mobile FAB (visible on small screens) */}
      <Button
        size="icon"
        onClick={() => setCaptureOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-ohm-spark text-2xl font-bold text-ohm-bg shadow-lg shadow-ohm-spark/30 transition-transform hover:bg-ohm-spark/90 active:scale-95"
        aria-label="Quick spark"
      >
        +
      </Button>
    </div>
  );
}
