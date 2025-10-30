import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AlertCircle } from 'lucide-react';

// Configure PDF.js worker - use unpkg CDN which works better with ES modules
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFFirstPagePreviewProps {
  fileUrl: string;
  fileName: string;
}

export function PDFFirstPagePreview({ fileUrl, fileName }: PDFFirstPagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let renderTask: any = null;

    const renderFirstPage = async () => {
      if (!canvasRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        setPageCount(pdf.numPages);

        // Get the first page
        const page = await pdf.getPage(1);

        if (!isMounted) return;

        // Prepare canvas
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Calculate scale to fit width while maintaining aspect ratio
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth * 0.95) / viewport.width; // 95% of container width
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        // Ignore cancellation errors
        if (err?.name === 'RenderingCancelledException') {
          return;
        }
        console.error('Error rendering PDF:', err);
        if (isMounted) {
          setError('Unable to preview PDF. Please download to view.');
          setLoading(false);
        }
      }
    };

    renderFirstPage();

    // Cleanup function
    return () => {
      isMounted = false;
      // Cancel any ongoing render task
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (err) {
          // Ignore cancellation errors
        }
      }
    };
  }, [fileUrl]);

  return (
    <div className="mb-6">
      <div className="rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600">Loading PDF preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="w-12 h-12 text-amber-600 mb-3" />
            <p className="text-amber-800 font-medium mb-2">Preview Unavailable</p>
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`w-full ${loading || error ? 'hidden' : 'block'}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {!loading && !error && pageCount > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            Showing first page of {pageCount} {pageCount === 1 ? 'page' : 'pages'}. Download to view the full document.
          </p>
        </div>
      )}
    </div>
  );
}
