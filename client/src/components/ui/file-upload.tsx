import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesChange: (files: File[]) => void;
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
  className?: string;
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 5, // 5MB default
  onFilesChange,
  existingUrls = [],
  onRemoveExisting,
  className = '',
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);

    const newFiles = Array.from(files);
    const totalFiles = selectedFiles.length + newFiles.length;

    // Check if total files exceed max limit
    if (totalFiles + existingUrls.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files total.`);
      return;
    }

    // Check file sizes
    const invalidFiles = newFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed the ${maxSize}MB limit.`);
      return;
    }

    // Check file types (only images)
    const nonImageFiles = newFiles.filter(file => !file.type.startsWith('image/'));
    if (nonImageFiles.length > 0) {
      setError('Only image files are allowed.');
      return;
    }

    // Generate previews for valid files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Update state with new files and previews
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setPreview(prevPreviews => [...prevPreviews, ...newPreviews]);
    
    // Notify parent component
    onFilesChange([...selectedFiles, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(preview[index]);
    
    // Remove file and preview
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = preview.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreview(newPreviews);
    
    // Notify parent component
    onFilesChange(newFiles);
  };

  const handleRemoveExisting = (url: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={maxFiles > 1}
        className="hidden"
      />
      
      {/* Upload button and area */}
      <div 
        className="border-2 border-dashed border-muted rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-base font-medium">
            Click to upload images
          </div>
          <div className="text-xs text-muted-foreground">
            {maxFiles > 1 
              ? `Upload up to ${maxFiles} images (${maxSize}MB each)`
              : `Upload an image (max ${maxSize}MB)`
            }
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Image previews */}
      {(preview.length > 0 || existingUrls.length > 0) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Existing images */}
          {existingUrls.map((url, index) => (
            <div key={`existing-${index}`} className="relative group rounded-md overflow-hidden aspect-square border border-border">
              <img src={url} alt={`Existing upload ${index + 1}`} className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExisting(url);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {/* New images */}
          {preview.map((src, index) => (
            <div key={`preview-${index}`} className="relative group rounded-md overflow-hidden aspect-square border border-border">
              <img src={src} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
