import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileText,
  Image as ImageIcon,
  File,
  ExternalLink,
  Filter,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui';
import { submissionsService } from '../services/submissions.service';
import { speakersService } from '../services/speakers.service';
import { assetRequirementsService } from '../services/asset-requirements.service';
import { getFileUrl } from '../lib/file-url';
import type { Submission } from '../types/speaker.types';
import type { Speaker } from '../types/speaker.types';
import type { AssetRequirement } from '../types/asset-requirements.types';

interface SubmissionsGalleryProps {
  eventId: number;
}

interface GroupedSubmission extends Submission {
  speaker?: Speaker;
  requirement?: AssetRequirement;
}

export function SubmissionsGallery({ eventId }: SubmissionsGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'image' | 'document'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<GroupedSubmission | null>(null);
  const [collapsedSpeakers, setCollapsedSpeakers] = useState<Set<number>>(new Set());

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

  // Fetch speakers
  const { data: speakers } = useQuery({
    queryKey: ['speakers', eventId],
    queryFn: () => speakersService.getSpeakers(eventId),
  });

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
    }
    return <File className="w-5 h-5" />;
  };

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
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Compact Preview */}
                      {submission.mimeType?.startsWith('image/') ? (
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          <img
                            src={getFileUrl(submission.fileUrl)!}
                            alt={submission.fileName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
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
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedSubmission.mimeType?.startsWith('image/') ? (
                    <ImageIcon className="w-6 h-6 text-white" />
                  ) : (
                    <FileText className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedSubmission.assetRequirement?.label || 'Asset'}</h3>
                  {selectedSubmission.speaker && (
                    <p className="text-sm text-emerald-100">
                      {selectedSubmission.speaker.firstName} {selectedSubmission.speaker.lastName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Image Preview */}
              {selectedSubmission.mimeType?.startsWith('image/') ? (
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center max-h-96">
                  <img
                    src={getFileUrl(selectedSubmission.fileUrl)!}
                    alt={selectedSubmission.fileName}
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="mb-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    {getFileIcon(selectedSubmission.mimeType)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {selectedSubmission.mimeType?.includes('pdf') ? 'PDF Document' : 'Document'}
                  </p>
                </div>
              )}

              {/* Asset Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">File Name:</span>
                  <span className="text-sm text-gray-900">{selectedSubmission.fileName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">File Size:</span>
                  <span className="text-sm text-gray-900">{formatFileSize(selectedSubmission.fileSize)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900">{selectedSubmission.mimeType}</span>
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
