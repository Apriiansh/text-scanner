'use client';

import { useRef, useState, useCallback } from 'react';
import { Image, Copy, CheckCircle2, RotateCcw, Edit2, Save, X } from 'lucide-react';
import { useOCRWorker } from '@/hooks/useOCRWorker';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const { recognize, isLoading, error, progress } = useOCRWorker();

  const handleImageSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      setRecognizedText(null);

      const text = await recognize(imageData);
      if (text) {
        setRecognizedText(text);
      }
    };
    reader.readAsDataURL(file);
  }, [recognize]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleCopyText = async () => {
    if (recognizedText) {
      await navigator.clipboard.writeText(recognizedText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleEditStart = () => {
    setEditedText(recognizedText);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editedText !== null) {
      setRecognizedText(editedText);
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditedText(null);
    setIsEditing(false);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setRecognizedText(null);
    setEditedText(null);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            OCR Document Scanner
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Extract text from images instantly
          </p>
        </div>

        {/* Upload Area */}
        {!selectedImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="space-y-3">
              <Image className="w-12 h-12 mx-auto text-slate-400" strokeWidth={1.5} />
              <div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">
                  Click to upload or drag and drop
                </p>
                <p className="text-slate-500 text-xs sm:text-sm">
                  PNG, JPG, GIF, WebP
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src={selectedImage}
                alt="Selected document"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-900 font-medium text-sm sm:text-base">
                      {progress.status || 'Processing...'}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress.progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                <p className="text-red-900 text-sm sm:text-base font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Results */}
            {recognizedText && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Recognized Text
                    </h2>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={handleEditStart}
                            className="px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={handleCopyText}
                            className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                              copyFeedback
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {copyFeedback ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditSave}
                            className="px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editedText || ''}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full h-40 sm:h-48 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700"
                    />
                  ) : (
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {recognizedText}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Upload Another
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Image className="w-4 h-4" />
                New Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
