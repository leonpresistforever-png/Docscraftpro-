import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FileDropZoneProps {
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  dragOver?: boolean;
  label?: string;
  hint?: string;
  badge?: string;
  className?: string;
}

export function FileDropZone({
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOver = false,
  label = 'Drag & drop your file here',
  hint = 'or click to browse',
  badge = 'PDF only',
  className,
}: FileDropZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'rounded-2xl border-2 border-dashed p-10 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer',
        dragOver
          ? 'border-[#D4AF37] bg-[#FBF6E8] scale-[0.99] shadow-inner'
          : 'border-[#E0D5BC] bg-[#FDFBF7] hover:border-[#D4AF37]/50 hover:bg-white hover:shadow-md',
        className,
      )}
    >
      <div className="p-4 rounded-2xl bg-white border border-[#EDE6D6] shadow-sm text-[#C5A017]">
        <Upload className="w-8 h-8" />
      </div>
      <div>
        <p className="font-semibold text-sm text-stone-700">{label}</p>
        <p className="text-xs text-stone-500 mt-1">{hint}</p>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider bg-white border border-[#EDE6D6] text-stone-500 px-3 py-1 rounded-full">
        {badge}
      </span>
    </div>
  );
}

interface FilePreviewCardProps {
  fileName: string;
  fileSize: string;
  onRemove: () => void;
  statusLabel?: string;
}

export function FilePreviewCard({ fileName, fileSize, onRemove, statusLabel = 'Ready to process' }: FilePreviewCardProps) {
  return (
    <div className="rounded-2xl border border-[#E8DFC8] bg-white p-5 flex flex-col gap-4 relative shadow-sm">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-4 right-4 text-xs font-semibold text-stone-400 hover:text-rose-500 transition-colors"
      >
        Remove
      </button>
      <div className="flex items-center gap-4 pr-16">
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 shrink-0">
          <FileText className="w-8 h-8" />
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm text-stone-800 truncate">{fileName}</h4>
          <p className="text-xs text-stone-500 mt-0.5">{fileSize}</p>
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {statusLabel}
      </div>
    </div>
  );
}
