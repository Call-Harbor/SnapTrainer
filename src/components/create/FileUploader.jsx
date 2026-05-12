import React, { useCallback } from 'react';
import { Upload, FileText, Image, Mic, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fileTypeIcons = {
  pdf: FileText,
  text: FileText,
  image: Image,
  audio: Mic,
  other: FileText,
};

function getFileType(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'ogg', 'm4a', 'webm'].includes(ext)) return 'audio';
  if (['txt', 'md', 'csv', 'json', 'html'].includes(ext)) return 'text';
  return 'other';
}

export default function FileUploader({ files, onFilesChange, uploading }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    onFilesChange([...files, ...dropped.map(f => ({ file: f, type: getFileType(f) }))]);
  }, [files, onFilesChange]);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    onFilesChange([...files, ...selected.map(f => ({ file: f, type: getFileType(f) }))]);
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleSelect}
          accept=".pdf,.txt,.md,.csv,.json,.html,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.ogg,.m4a"
        />
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">Træk filer hertil eller klik for at vælge</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, tekst, billeder, lyd, noter og mere</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, index) => {
            const Icon = fileTypeIcons[item.type] || FileText;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}