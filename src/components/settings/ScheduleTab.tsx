import { Minus, Plus, CalendarDays } from 'lucide-react';
import type { Activity } from '../../types/activity';
import { WINDOW_MIN, WINDOW_MAX, WINDOW_DEFAULT } from '../../types/board';
import { Button } from '../ui/button';
import { ActivityManager } from '../ActivityManager';

interface ScheduleTabProps {
  windowSize?: number;
  onSetWindowSize?: (size: number) => void;
  activities?: Activity[];
  categories: string[];
  onUpdateActivity?: (id: string, changes: Partial<Omit<Activity, 'id'>>) => void;
  onDeleteActivity?: (id: string) => void | Promise<void>;
  energyMax?: number;
  editActivityId?: string;
}

export function ScheduleTab({
  windowSize,
  onSetWindowSize,
  activities,
  categories,
  onUpdateActivity,
  onDeleteActivity,
  energyMax,
  editActivityId,
}: ScheduleTabProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Schedule window */}
      <section>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-ohm-muted" />
          <span className="font-display text-ohm-muted text-xs tracking-widest uppercase">
            Schedule
          </span>
        </div>
        <p className="font-body text-ohm-muted/80 mt-1.5 text-xs">
          Recurring activities with a rolling schedule window.
        </p>

        {onSetWindowSize && (
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-ohm-muted w-20 shrink-0 text-xs tracking-widest uppercase">
              Window
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onSetWindowSize(Math.max(WINDOW_MIN, (windowSize ?? WINDOW_DEFAULT) - 1))
              }
              disabled={(windowSize ?? WINDOW_DEFAULT) <= WINDOW_MIN}
              className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
              aria-label="Decrease window size"
            >
              <Minus size={14} />
            </Button>
            <span className="font-display text-ohm-text min-w-[2ch] text-center text-lg font-bold">
              {windowSize ?? WINDOW_DEFAULT}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onSetWindowSize(Math.min(WINDOW_MAX, (windowSize ?? WINDOW_DEFAULT) + 1))
              }
              disabled={(windowSize ?? WINDOW_DEFAULT) >= WINDOW_MAX}
              className="border-ohm-border text-ohm-muted hover:text-ohm-text h-8 w-8"
              aria-label="Increase window size"
            >
              <Plus size={14} />
            </Button>
            <span className="font-body text-ohm-muted/60 text-xs">days</span>
          </div>
        )}
      </section>

      {/* Activities */}
      {activities && onUpdateActivity && onDeleteActivity && (
        <section>
          <ActivityManager
            activities={activities}
            categories={categories}
            onUpdate={onUpdateActivity}
            onDelete={onDeleteActivity}
            energyMax={energyMax}
            initialEditId={editActivityId}
          />
        </section>
      )}
    </div>
  );
}
