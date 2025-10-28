import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { submissionsService } from '../services/submissions.service';
import { Button } from './ui';

interface FileUploadProps {
  onUploadComplete: (fileData: {
    fileName: string;
    fileUrl: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  }) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10485760, // 10MB
}: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: submissionsService.uploadFile,
    onSuccess: (data) => {
      onUploadComplete(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to upload file');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const handleUpload = () => {
    if (uploadedFile) {
      uploadMutation.mutate(uploadedFile);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreview(null);
    setError(null);
  };

  if (uploadMutation.isSuccess) {
    return (
      <div className="border-2 border-emerald-200 rounded-lg p-8 bg-emerald-50 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <p className="text-emerald-900 font-medium">File uploaded successfully!</p>
      </div>
    );
  }

  return (
    <div>
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-emerald-700 font-medium">Drop the file here</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop a file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">Max file size: 10MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-6">
          {/* Preview */}
          <div className="flex items-start gap-4 mb-4">
            {preview ? (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded" />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
                <FileIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-red-600"
                  disabled={uploadMutation.isPending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
            </Button>
            <Button variant="secondary" onClick={handleRemove} disabled={uploadMutation.isPending}>
              Choose Different File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
