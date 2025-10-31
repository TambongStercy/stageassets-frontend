import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileText,
  Image as ImageIcon,
  File,
  ExternalLink,
  Search,
  Users,
  Package,
  ChevronDown,
  ChevronRight,
  X,
  History,
  AlertCircle,
  Presentation,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui';
import { submissionsService } from '../services/submissions.service';
import { assetRequirementsService } from '../services/asset-requirements.service';
import { getFileUrl } from '../lib/file-url';
import type { Submission } from '../types/speaker.types';
import { PDFFirstPagePreview } from './PDFFirstPagePreview';

interface SubmissionsGalleryProps {
  eventId: number;
}

// Use Submission type directly as it already includes speaker and assetRequirement
type GroupedSubmission = Submission;

export function SubmissionsGallery({ eventId }: SubmissionsGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'image' | 'document'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<GroupedSubmission | null>(null);
  const [collapsedSpeakers, setCollapsedSpeakers] = useState<Set<number>>(new Set());
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [textFileContent, setTextFileContent] = useState<string | null>(null);
  const [textFileLoading, setTextFileLoading] = useState(false);
  const [textFileError, setTextFileError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Fetch version history when modal is open
  const { data: versionHistory, isLoading: versionHistoryLoading } = useQuery({
    queryKey: ['version-history', selectedSubmission?.speakerId, selectedSubmission?.assetRequirementId],
    queryFn: () => {
      if (!selectedSubmission?.speakerId || !selectedSubmission?.assetRequirementId) {
        return Promise.resolve([]);
      }
      return submissionsService.getVersionHistory(
        selectedSubmission.speakerId,
        selectedSubmission.assetRequirementId
      );
    },
    enabled: showVersionHistory && !!selectedSubmission?.speakerId && !!selectedSubmission?.assetRequirementId,
  });

  // Check if submission is recent (uploaded within last 7 days)
  const isRecentSubmission = (submission: Submission) => {
    if (!submission.uploadedAt && !submission.createdAt) return false;
    const uploadDate = new Date(submission.uploadedAt || submission.createdAt);
    const daysSinceUpload = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpload <= 7;
  };

  const toggleSpeaker = (speakerId: number) => {
    setCollapsedSpeakers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(speakerId)) {
        newSet.delete(speakerId);
      } else {
        newSet.add(speakerId);
      }
      return newSet;
    });
  };

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', eventId],
    queryFn: () => submissionsService.getEventSubmissions(eventId),
  });

  // Note: speakers query removed as speaker data comes embedded in submissions

  // Fetch asset requirements
  const { data: requirements } = useQuery({
    queryKey: ['asset-requirements', eventId],
    queryFn: () => assetRequirementsService.getAssetRequirements(eventId),
  });

  // Submissions already come with speaker and assetRequirement data from backend
  const groupedSubmissions = useMemo((): GroupedSubmission[] => {
    if (!submissions) return [];
    return submissions as GroupedSubmission[];
  }, [submissions]);

  // Group submissions by speaker
  const submissionsBySpeaker = useMemo(() => {
    const grouped = new Map<number, GroupedSubmission[]>();

    groupedSubmissions.forEach((submission) => {
      const speakerId = submission.speaker?.id || 0;
      if (!grouped.has(speakerId)) {
        grouped.set(speakerId, []);
      }
      grouped.get(speakerId)!.push(submission);
    });

    return grouped;
  }, [groupedSubmissions]);

  // Initialize all speakers as collapsed by default
  useEffect(() => {
    const allSpeakerIds = new Set(Array.from(submissionsBySpeaker.keys()));
    setCollapsedSpeakers(allSpeakerIds);
  }, [submissionsBySpeaker]);

  // Filter speakers and their submissions
  const filteredSpeakerSubmissions = useMemo(() => {
    const filtered = new Map<number, GroupedSubmission[]>();

    submissionsBySpeaker.forEach((submissions, speakerId) => {
      // Filter submissions for this speaker
      const filteredSubs = submissions.filter((submission) => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          submission.fileName.toLowerCase().includes(searchLower) ||
          submission.speaker?.firstName?.toLowerCase().includes(searchLower) ||
          submission.speaker?.lastName?.toLowerCase().includes(searchLower) ||
          submission.speaker?.email?.toLowerCase().includes(searchLower) ||
          submission.assetRequirement?.label?.toLowerCase().includes(searchLower);

        // Type filter
        const matchesType =
          filterStatus === 'all' ||
          (filterStatus === 'image' && submission.mimeType?.startsWith('image/')) ||
          (filterStatus === 'document' && submission.mimeType?.startsWith('application/'));

        return matchesSearch && matchesType;
      });

      if (filteredSubs.length > 0) {
        filtered.set(speakerId, filteredSubs);
      }
    });

    return filtered;
  }, [submissionsBySpeaker, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = groupedSubmissions.length;
    const images = groupedSubmissions.filter((s) => s.mimeType?.startsWith('image/')).length;
    const documents = groupedSubmissions.filter((s) => s.mimeType?.startsWith('application/')).length;
    const uniqueSpeakers = new Set(groupedSubmissions.map((s) => s.speakerId)).size;

    return { total, images, documents, uniqueSpeakers };
  }, [groupedSubmissions]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('.ppt')) {
      return <Presentation className="w-5 h-5" />;
    } else if (mimeType.includes('text/')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  // Determine if file is a text file
  const isTextFile = (mimeType: string) => {
    return mimeType.startsWith('text/') || mimeType.includes('text/plain');
  };

  // Determine if file is a PDF
  const isPdfFile = (mimeType: string) => {
    return mimeType.includes('pdf');
  };

  // Determine if file is a PowerPoint file
  const isPowerPointFile = (mimeType: string) => {
    return (
      mimeType.includes('presentation') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('.ppt') ||
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
  };

  // Fetch text file content when modal opens with a text file
  useEffect(() => {
    const fetchTextContent = async () => {
      // Reset preview error when submission changes
      setPreviewError(null);

      if (!selectedSubmission || !isTextFile(selectedSubmission.mimeType)) {
        setTextFileContent(null);
        setTextFileError(null);
        return;
      }

      const fileUrl = getFileUrl(selectedSubmission.fileUrl);
      if (!fileUrl) {
        setTextFileError('File URL not available');
        return;
      }

      setTextFileLoading(true);
      setTextFileError(null);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch file content');
        }
        const text = await response.text();
        setTextFileContent(text);
      } catch (error) {
        console.error('Error fetching text file:', error);
        setTextFileError('Unable to load file content. Please download to view.');
        setTextFileContent(null);
      } finally {
        setTextFileLoading(false);
      }
    };

    fetchTextContent();
  }, [selectedSubmission]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (submission: Submission) => {
    const url = getFileUrl(submission.fileUrl);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBulkDownload = () => {
    const allFilteredSubmissions = Array.from(filteredSpeakerSubmissions.values()).flat();
    allFilteredSubmissions.forEach((submission, index) => {
      setTimeout(() => {
        handleDownload(submission);
      }, index * 300); // Stagger downloads to avoid browser blocking
    });
  };

  if (submissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">No submissions yet</p>
        <p className="text-sm text-gray-500">
          Assets will appear here once speakers start uploading
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Speakers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpeakers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by speaker, file name, or asset type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('image')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'image'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterStatus('document')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'document'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Download All */}
        <Button
          onClick={handleBulkDownload}
          disabled={Array.from(filteredSpeakerSubmissions.values()).flat().length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
        >
          <Download className="w-4 h-4 mr-2" />
          Download All ({Array.from(filteredSpeakerSubmissions.values()).flat().length})
        </Button>
      </div>

      {/* Submissions Grouped by Speaker */}
      <div className="space-y-3">
        {Array.from(filteredSpeakerSubmissions.entries()).map(([speakerId, submissions]) => {
          // Get speaker data from the first submission (all submissions from same speaker)
          const speaker = submissions[0]?.speaker;
          const speakerName =
            speaker?.firstName && speaker?.lastName
              ? `${speaker.firstName} ${speaker.lastName}`
              : speaker?.email || 'Unknown Speaker';

          const isCollapsed = collapsedSpeakers.has(speakerId);
          const totalRequirements = requirements?.length || 0;
          const receivedCount = submissions.length;

          return (
            <div key={speakerId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Speaker Header - Clickable */}
              <button
                onClick={() => toggleSpeaker(speakerId)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base font-semibold text-gray-900">{speakerName}</h3>
                  {speaker?.email && (
                    <p className="text-sm text-gray-600">{speaker.email}</p>
                  )}
                </div>
                <div className="text-sm flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full font-medium text-xs ${
                    receivedCount === totalRequirements
                      ? 'bg-emerald-100 text-emerald-700'
                      : receivedCount > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {receivedCount}/{totalRequirements} {totalRequirements === 1 ? 'asset' : 'assets'}
                  </span>
                </div>
              </button>

              {/* Speaker's Submissions - Collapsible */}
              {!isCollapsed && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group relative"
                    >
                      {/* Version & NEW Badge */}
                      <div className="absolute top-2 right-2 z-10 flex gap-1">
                        {isRecentSubmission(submission) && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            NEW
                          </span>
                        )}
                        {submission.version > 1 && (
                          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full shadow-lg">
                            v{submission.version}
                          </span>
                        )}
                      </div>

                      {/* Compact Preview */}
                      {submission.mimeType?.startsWith('image/') ? (
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          <img
                            src={getFileUrl(submission.fileUrl)!}
                            alt={submission.fileName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : isPdfFile(submission.mimeType) ? (
                        <div className="aspect-square bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center">
                          <div className="text-red-600 mb-2">
                            <FileText className="w-12 h-12" />
                          </div>
                          <p className="text-xs font-medium text-red-700">PDF</p>
                        </div>
                      ) : isPowerPointFile(submission.mimeType) ? (
                        <div className="aspect-square bg-gradient-to-br from-orange-50 to-amber-100 flex flex-col items-center justify-center">
                          <div className="text-orange-600 mb-2">
                            <Presentation className="w-12 h-12" />
                          </div>
                          <p className="text-xs font-medium text-orange-700">PPT</p>
                        </div>
                      ) : isTextFile(submission.mimeType) ? (
                        <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center">
                          <div className="text-blue-600 mb-2">
                            <FileText className="w-12 h-12" />
                          </div>
                          <p className="text-xs font-medium text-blue-700">TXT</p>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <div className="text-gray-400">
                            {getFileIcon(submission.mimeType)}
                          </div>
                        </div>
                      )}

                      {/* Compact Details */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 truncate" title={submission.assetRequirement?.label}>
                          {submission.assetRequirement?.label || 'Asset'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatFileSize(submission.fileSize)}
                        </p>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSpeakerSubmissions.size === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No submissions match your search</p>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedSubmission(null);
            setShowVersionHistory(false);
          }}
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedSubmission.mimeType?.startsWith('image/') ? (
                    <ImageIcon className="w-6 h-6 text-white" />
                  ) : isPowerPointFile(selectedSubmission.mimeType) ? (
                    <Presentation className="w-6 h-6 text-white" />
                  ) : (
                    <FileText className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white truncate">{selectedSubmission.assetRequirement?.label || 'Asset'}</h3>
                  {selectedSubmission.speaker && (
                    <p className="text-sm text-emerald-100 truncate">
                      {selectedSubmission.speaker.firstName} {selectedSubmission.speaker.lastName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setShowVersionHistory(false);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* File Preview */}
              {selectedSubmission.mimeType?.startsWith('image/') ? (
                // Image Preview
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center max-h-96">
                  <img
                    src={getFileUrl(selectedSubmission.fileUrl)!}
                    alt={selectedSubmission.fileName}
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              ) : isPdfFile(selectedSubmission.mimeType) ? (
                // PDF Preview - First Page Only using PDF.js
                <PDFFirstPagePreview
                  fileUrl={getFileUrl(selectedSubmission.fileUrl)!}
                  fileName={selectedSubmission.fileName}
                />
              ) : isTextFile(selectedSubmission.mimeType) ? (
                // Text File Preview
                <div className="mb-6">
                  {textFileLoading ? (
                    <div className="rounded-lg bg-gray-100 border-2 border-gray-300 p-12 flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                        <p className="text-gray-600">Loading file content...</p>
                      </div>
                    </div>
                  ) : textFileError ? (
                    <div className="rounded-lg bg-amber-50 border-2 border-amber-200 p-8 flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-amber-600 mb-3" />
                      <p className="text-amber-800 font-medium mb-2">Unable to Preview</p>
                      <p className="text-sm text-amber-700">{textFileError}</p>
                    </div>
                  ) : textFileContent ? (
                    <>
                      <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-600">Text File Preview</p>
                          <span className="text-xs text-gray-500">
                            {textFileContent.split('\n').length} lines
                          </span>
                        </div>
                        <div className="bg-white p-4 max-h-[400px] overflow-auto">
                          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono break-words">
                            {textFileContent.split('\n').slice(0, 50).join('\n')}
                            {textFileContent.split('\n').length > 50 && '\n\n... (content truncated)'}
                          </pre>
                        </div>
                      </div>
                      {textFileContent.split('\n').length > 50 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                          <p className="text-xs text-blue-700">
                            Showing first 50 lines. Download to view the complete file.
                          </p>
                          <Button
                            onClick={() => handleDownload(selectedSubmission)}
                            variant="secondary"
                            className="text-xs py-1 px-3"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download Full File
                          </Button>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              ) : isPowerPointFile(selectedSubmission.mimeType) ? (
                // PowerPoint Preview - Show placeholder with file info
                <div className="mb-6">
                  <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-12 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                      <Presentation className="w-12 h-12 text-orange-600" />
                    </div>
                    <p className="text-orange-900 font-semibold text-lg mb-2">PowerPoint Presentation</p>
                    <p className="text-orange-700 text-sm text-center mb-1 truncate max-w-md mx-auto" title={selectedSubmission.fileName}>
                      {selectedSubmission.fileName}
                    </p>
                    <p className="text-orange-600 text-xs mb-4">
                      {formatFileSize(selectedSubmission.fileSize)}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleDownload(selectedSubmission)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download to View
                      </Button>
                      <Button
                        onClick={() => {
                          const url = getFileUrl(selectedSubmission.fileUrl);
                          if (url) window.open(url, '_blank');
                        }}
                        variant="secondary"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      PowerPoint files cannot be previewed in the browser. Download the file to view all slides in PowerPoint, Keynote, or Google Slides.
                    </p>
                  </div>
                </div>
              ) : (
                // Other document types - show icon placeholder
                <div className="mb-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    {getFileIcon(selectedSubmission.mimeType)}
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1 truncate max-w-md mx-auto" title={selectedSubmission.fileName}>
                    {selectedSubmission.fileName}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Preview not available for this file type
                  </p>
                </div>
              )}

              {/* Asset Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600 flex-shrink-0">File Name:</span>
                  <span className="text-sm text-gray-900 truncate ml-4" title={selectedSubmission.fileName}>{selectedSubmission.fileName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">File Size:</span>
                  <span className="text-sm text-gray-900">{formatFileSize(selectedSubmission.fileSize)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900">{selectedSubmission.mimeType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Version:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">v{selectedSubmission.version}</span>
                    {selectedSubmission.isLatest && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Latest
                      </span>
                    )}
                    {isRecentSubmission(selectedSubmission) && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
                {(selectedSubmission.uploadedAt || selectedSubmission.createdAt) && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Uploaded:</span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(selectedSubmission.uploadedAt || selectedSubmission.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
              </div>

              {/* Version History Button - Show if there are multiple versions */}
              {selectedSubmission.version > 1 && (
                <div className="mt-6">
                  <Button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    variant="secondary"
                    className="w-full"
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showVersionHistory ? 'Hide Version History' : 'View Version History'}
                  </Button>
                </div>
              )}

              {/* Version History List */}
              {showVersionHistory && (
                <div className="mt-4">
                  {versionHistoryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : versionHistory && versionHistory.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900">Version History</h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {versionHistory.length} {versionHistory.length === 1 ? 'version' : 'versions'} available
                        </p>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {versionHistory.map((version) => (
                          <div
                            key={version.id}
                            className={`px-4 py-3 hover:bg-gray-100 transition-colors ${
                              version.id === selectedSubmission.id ? 'bg-emerald-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
                                  v{version.version}
                                </span>
                                {version.isLatest && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                    Latest
                                  </span>
                                )}
                                {version.id === selectedSubmission.id && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    Viewing
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(version.fileSize)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-600 min-w-0 flex-1">
                                <p className="font-medium text-gray-900 mb-1 truncate" title={version.fileName}>{version.fileName}</p>
                                <p>
                                  Uploaded:{' '}
                                  {version.uploadedAt || version.createdAt
                                    ? format(
                                        new Date(version.uploadedAt || version.createdAt),
                                        'MMM d, yyyy h:mm a'
                                      )
                                    : 'Unknown'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {version.id !== selectedSubmission.id && (
                                  <button
                                    onClick={() => {
                                      setSelectedSubmission({
                                        ...version,
                                        speaker: selectedSubmission.speaker,
                                        assetRequirement: selectedSubmission.assetRequirement,
                                      } as GroupedSubmission);
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
                                  >
                                    View
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownload(version)}
                                  className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white font-medium"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-8 text-center">
                      <p className="text-sm text-gray-600">No version history available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button
                onClick={() => {
                  const url = getFileUrl(selectedSubmission.fileUrl);
                  if (url) window.open(url, '_blank');
                }}
                variant="secondary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                onClick={() => handleDownload(selectedSubmission)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
