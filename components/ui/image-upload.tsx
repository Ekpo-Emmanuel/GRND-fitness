"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ImageUpload({ 
  currentImage, 
  onImageUpload, 
  onImageRemove, 
  className,
  size = 'md' 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const displayImage = preview || currentImage;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          sizeClasses[size],
          isDragOver && "ring-2 ring-blue-500 ring-offset-2",
          !displayImage && "border-dashed border-2 border-gray-300"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-0 h-full">
          {displayImage ? (
            <div className="relative w-full h-full group">
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 text-gray-800 hover:bg-white"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  {onImageRemove && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemove}
                      className="bg-red-500/90 text-white hover:bg-red-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <User className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                {isDragOver ? 'Drop image here' : 'No image'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!displayImage && (
        <div className="mt-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Drag & drop or click to upload
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
} 