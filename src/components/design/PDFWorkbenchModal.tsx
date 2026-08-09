import React from 'react';
import { FileText, Wand2, Loader2 } from 'lucide-react';
import { SoftModal } from './SoftModal';
import { FileDropZone, FilePreviewCard } from './FileDropZone';
import { SegmentedControl } from './SegmentedControl';
import { Button } from '../ui/Button';

interface PDFWorkbenchModalProps {
  open: boolean;
  onClose: () => void;
  toolName: string;
  workbenchFile: File | null;
  dragOver: boolean;
  isProcessing: boolean;
  watermarkText: string;
  rotationDegrees: number;
  startPageNumber: number;
  onWatermarkChange: (v: string) => void;
  onRotationChange: (v: number) => void;
  onStartPageChange: (v: number) => void;
  onSelectFile: () => void;
  onRemoveFile: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onExecute: () => void;
}

export function PDFWorkbenchModal({
  open,
  onClose,
  toolName,
  workbenchFile,
  dragOver,
  isProcessing,
  watermarkText,
  rotationDegrees,
  startPageNumber,
  onWatermarkChange,
  onRotationChange,
  onStartPageChange,
  onSelectFile,
  onRemoveFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onExecute,
}: PDFWorkbenchModalProps) {
  return (
    <SoftModal
      open={open}
      onClose={onClose}
      title={toolName}
      subtitle="Secure document tools"
      icon={<FileText className="w-5 h-5" />}
    >
      {!workbenchFile ? (
        <FileDropZone
          dragOver={dragOver}
          onClick={onSelectFile}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          label="Drag & drop your PDF here"
          hint="or click to browse files"
          badge="PDF format"
        />
      ) : (
        <FilePreviewCard
          fileName={workbenchFile.name}
          fileSize={`${(workbenchFile.size / (1024 * 1024)).toFixed(2)} MB`}
          onRemove={onRemoveFile}
        />
      )}

      {workbenchFile && (
        <div className="mt-6 space-y-5 pt-6 border-t border-[#EDE6D6]">
          {toolName === 'Add Watermark' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Watermark text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => onWatermarkChange(e.target.value)}
                placeholder="CONFIDENTIAL"
                className="w-full rounded-xl border border-[#E8DFC8] bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
              />
              <p className="text-xs text-stone-500">Adds a subtle diagonal watermark across every page.</p>
            </div>
          )}

          {toolName === 'Rotate PDF' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Rotation</label>
              <SegmentedControl
                options={[
                  { value: 90, label: '90°' },
                  { value: 180, label: '180°' },
                  { value: 270, label: '270°' },
                ]}
                value={rotationDegrees}
                onChange={onRotationChange}
              />
            </div>
          )}

          {toolName === 'Add Page Numbers' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Start page number</label>
              <div className="flex items-center gap-4 rounded-xl border border-[#E8DFC8] bg-white p-4">
                <input
                  type="number"
                  min={1}
                  value={startPageNumber}
                  onChange={(e) => onStartPageChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 rounded-lg border border-[#EDE6D6] px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-[#D4AF37]"
                />
                <div className="flex-1 h-20 rounded-lg bg-[#FDFBF7] border border-[#EDE6D6] flex flex-col justify-end items-center pb-2 shadow-inner">
                  <div className="text-[9px] font-bold text-stone-500 border-t border-stone-200 pt-1 w-4/5 text-center">
                    Page {startPageNumber} of X
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            {isProcessing ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 rounded-xl bg-[#FBF6E8] border border-[#F0E4C0] text-[#A68B1F] font-bold text-sm flex items-center justify-center gap-2"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing document…
              </button>
            ) : (
              <Button variant="gold" className="w-full rounded-xl py-3.5 font-bold gap-2" onClick={onExecute}>
                <Wand2 className="w-4 h-4" />
                Apply {toolName}
              </Button>
            )}
          </div>
        </div>
      )}
    </SoftModal>
  );
}
