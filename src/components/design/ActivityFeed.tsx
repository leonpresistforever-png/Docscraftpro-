import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export type ActivityStatus = 'pending' | 'active' | 'done' | 'info';

export interface ActivityItem {
  id?: string;
  message: string;
  status?: ActivityStatus;
  timestamp?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  emptyMessage?: string;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
}

const statusIcon: Record<ActivityStatus, React.ReactNode> = {
  pending: <Circle className="w-3.5 h-3.5 text-stone-300" />,
  active: <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
  done: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  info: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
};

function inferStatus(message: string, index: number, total: number): ActivityStatus {
  if (index === total - 1 && (message.includes('...') || message.toLowerCase().includes('processing'))) {
    return 'active';
  }
  if (message.startsWith('✔') || message.toLowerCase().includes('success') || message.toLowerCase().includes('ready')) {
    return 'done';
  }
  if (message.startsWith('●') || message.startsWith('⚙')) {
    return 'info';
  }
  return index < total - 1 ? 'done' : 'info';
}

export function ActivityFeed({
  items,
  title = 'Activity',
  emptyMessage = 'No activity yet.',
  onClear,
  className,
  compact = false,
}: ActivityFeedProps) {
  return (
    <div className={cn('rounded-2xl border border-[#E8DFC8] bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm', className)}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0E9DA] bg-[#FDFBF7]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</h3>
        {onClear && items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-semibold text-stone-400 hover:text-stone-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className={cn('overflow-y-auto', compact ? 'max-h-40 p-3' : 'max-h-52 p-4')}>
        {items.length === 0 ? (
          <p className="text-sm text-stone-400 italic text-center py-4">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {items.map((item, index) => {
                const status = item.status ?? inferStatus(item.message, index, items.length);
                return (
                  <motion.li
                    key={item.id ?? `${index}-${item.message.slice(0, 24)}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5 shrink-0">{statusIcon[status]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-700 leading-snug">{item.message.replace(/^[✔●⚙🚀⚡]+\s*/, '')}</p>
                      {item.timestamp && (
                        <p className="text-[10px] text-stone-400 mt-0.5">{item.timestamp}</p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
