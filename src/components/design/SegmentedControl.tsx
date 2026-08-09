import React from 'react';
import { cn } from '@/src/lib/utils';

interface SegmentedControlProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex gap-2 p-1 rounded-xl bg-[#F5F0E6] border border-[#EDE6D6]', className)}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all duration-200',
              selected
                ? 'bg-white text-stone-800 shadow-sm border border-[#E8DFC8]'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/50',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
