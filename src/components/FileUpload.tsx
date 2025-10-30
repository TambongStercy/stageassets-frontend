import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle, AlertCircle, FileWarning } from 'lucide-react';
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
  accept?: string;
  maxSizeMB?: number;
  minImageWidth?: number;
  minImageHeight?: number;
}

interface FileValidationError {
  type: 'size' | 'format' | 'network' | 'unknown';
  message: string;
  suggestion: string;
}

export function FileUpload({
  onUploadComplete,
  accept = 'image/*,.pdf',
  maxSizeMB = 10,
  minImageWidth,
  minImageHeight,
}: FileUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<FileValidationError | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: submissionsService.uploadFile,
    onMutate: () => {
      setUploadProgress(0);
      setError(null);
    },
    onSuccess: (data) => {
      onUploadComplete(data);
      setError(null);
      setUploadProgress(100);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message;

      // Categorize error
      let validationError: FileValidationError;

      if (errorMessage?.toLowerCase().includes('network') || errorMessage?.toLowerCase().includes('timeout')) {
        validationError = {
          type: 'network',
          message: 'Network connection failed',
          suggestion: 'Please check your internet connection and try again.'
        };
      } else if (errorMessage?.toLowerCase().includes('size') || errorMessage?.toLowerCase().includes('large')) {
        validationError = {
          type: 'size',
          message: 'File upload failed due to size',
          suggestion: `Maximum file size is ${maxSizeMB}MB. Please compress your file or choose a smaller one.`
        };
      } else if (errorMessage?.toLowerCase().includes('format') || errorMessage?.toLowerCase().includes('type')) {
        validationError = {
          type: 'format',
          message: 'File type not supported',
          suggestion: `Accepted formats: ${accept}. Please convert your file to a supported format.`
        };
      } else {
        validationError = {
          type: 'unknown',
          message: errorMessage || 'Upload failed',
          suggestion: 'Please try again. If the problem persists, contact support.'
        };
      }

      setError(validationError);
      setUploadProgress(0);
    },
  });

  // Simulate upload progress (real implementation would use axios onUploadProgress)
  useEffect(() => {
    if (uploadMutation.isPending && uploadProgress < 90) {
      const timer = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      return () => clearInterval(timer);
    }
  }, [uploadMutation.isPending, uploadProgress]);

  const validateFile = (file: File): FileValidationError | null => {
    // Check size
    if (file.size > maxSize) {
      return {
        type: 'size',
        message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        suggestion: `Maximum file size is ${maxSizeMB}MB. Please compress your file or choose a smaller one.`
      };
    }

    // Check format
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();

    // Check if it's a wildcard match (e.g., image/*)
    const isImageWildcard = acceptedExtensions.some(ext => ext === 'image/*');
    const isPdfAccepted = acceptedExtensions.some(ext => ext === '.pdf' || ext === 'application/pdf');

    const isValidFormat =
      acceptedExtensions.includes(fileExtension) ||
      (isImageWildcard && file.type.startsWith('image/')) ||
      (isPdfAccepted && file.type === 'application/pdf');

    if (!isValidFormat) {
      return {
        type: 'format',
        message: `File type not supported (${fileExtension})`,
        suggestion: `Accepted formats: ${accept}. Please choose a different file.`
      };
    }

    return null;
  };

  const validateImageDimensions = (width: number, height: number): FileValidationError | null => {
    if (minImageWidth && width < minImageWidth) {
      return {
        type: 'format',
        message: `Image width too small (${width}px)`,
        suggestion: `Minimum image width is ${minImageWidth}px. Current image is ${width}x${height}px. Please use a larger image.`
      };
    }

    if (minImageHeight && height < minImageHeight) {
      return {
        type: 'format',
        message: `Image height too small (${height}px)`,
        suggestion: `Minimum image height is ${minImageHeight}px. Current image is ${width}x${height}px. Please use a larger image.`
      };
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      const file = rejection.file;

      if (rejection.errors[0]?.code === 'file-too-large') {
        setError({
          type: 'size',
          message: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
          suggestion: `Maximum file size is ${maxSizeMB}MB. Please compress your file or choose a smaller one.`
        });
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError({
          type: 'format',
          message: `File type not supported`,
          suggestion: `Accepted formats: ${accept}. Please choose a different file.`
        });
      }
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview and validate dimensions for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Validate image dimensions
          const dimensionError = validateImageDimensions(img.width, img.height);
          if (dimensionError) {
            setError(dimensionError);
            setUploadedFile(null);
            setPreview(null);
            setImageDimensions(null);
            return;
          }

          // Image is valid
          setImageDimensions({ width: img.width, height: img.height });
          setPreview(e.target?.result as string);
          setUploadedFile(file);
          setError(null);
        };
        img.onerror = () => {
          setError({
            type: 'format',
            message: 'Failed to load image',
            suggestion: 'The file may be corrupted or not a valid image. Please try a different file.'
          });
          setUploadedFile(null);
          setPreview(null);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // Non-image files don't need dimension validation
      setUploadedFile(file);
      setError(null);
      setPreview(null);
      setImageDimensions(null);
    }
  }, [accept, maxSize, maxSizeMB, minImageWidth, minImageHeight, validateImageDimensions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      const trimmed = type.trim();
      if (trimmed.startsWith('.')) {
        acc['application/octet-stream'] = [trimmed];
      } else if (trimmed.includes('/*')) {
        acc[trimmed] = [];
      } else {
        acc[trimmed] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
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
    setUploadProgress(0);
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'size':
        return <FileWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
      case 'format':
        return <FileIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
    }
  };

  if (uploadMutation.isSuccess) {
    return (
      <div className="border-2 border-emerald-200 rounded-lg p-8 bg-emerald-50 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <p className="text-emerald-900 font-medium">File uploaded successfully!</p>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div>
      {!uploadedFile ? (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
            role="button"
            aria-label={isMobile ? 'Tap to select file' : 'Upload file: drag and drop or click to browse'}
            tabIndex={0}
          >
            <input {...getInputProps()} aria-label="File upload input" />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-emerald-700 font-medium">Drop the file here</p>
            ) : (
              <>
                <p className="text-gray-700 font-medium mb-1">
                  {isMobile ? 'Tap to select file' : 'Drag and drop a file here, or click to browse'}
                </p>
                <p className="text-sm text-gray-500">Max file size: {maxSizeMB}MB</p>
              </>
            )}
          </div>

          {/* Pre-upload validation error */}
          {error && !uploadedFile && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md" role="alert">
              <div className="flex items-start gap-3">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    {error.message}
                  </h4>
                  <p className="text-sm text-red-700">
                    {error.suggestion}
                  </p>
                </div>
              </div>
            </div>
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
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {imageDimensions && (
                    <p className="text-sm text-emerald-600 font-medium">
                      {imageDimensions.width} x {imageDimensions.height}px
                      {minImageWidth && minImageHeight && (
                        <span className="text-gray-500 ml-1">
                          (min: {minImageWidth} x {minImageHeight}px)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  disabled={uploadMutation.isPending}
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md" role="alert">
              <div className="flex items-start gap-3">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    {error.message}
                  </h4>
                  <p className="text-sm text-red-700">
                    {error.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-emerald-700 hover:bg-emerald-800 text-white min-h-[44px]"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRemove}
              disabled={uploadMutation.isPending}
              className="min-h-[44px]"
            >
              Choose Different File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
