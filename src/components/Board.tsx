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
import { Column } from './Column';
import { Card } from './Card';
import { QuickCapture } from './QuickCapture';
import { CardDetail } from './CardDetail';
import { GroundedPrompt } from './GroundedPrompt';

export function Board() {
  const { board, quickAdd, move, updateCard, deleteCard } = useBoard();

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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold tracking-tight text-ohm-text">Ω</span>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-ohm-text">
              Ohm
            </span>
          </div>

          {/* Quick add FAB */}
          <button
            onClick={() => setCaptureOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-ohm-spark/20 px-3 py-1.5 font-display text-xs uppercase tracking-wider text-ohm-spark transition-colors hover:bg-ohm-spark/30 active:bg-ohm-spark/40"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Spark</span>
          </button>
        </div>
      </header>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex min-h-[calc(100vh-56px)] gap-3 p-4 md:gap-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                column={col}
                cards={getColumnCards(board, col.status)}
                onCardTap={setSelectedCard}
                wipWarning={col.status === 'live' && wipWarning}
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
      <button
        onClick={() => setCaptureOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ohm-spark text-2xl font-bold text-ohm-bg shadow-lg shadow-ohm-spark/30 transition-transform active:scale-95 sm:hidden"
        aria-label="Quick spark"
      >
        +
      </button>
    </div>
  );
}
