import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from './ui';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { assetRequirementsService } from '../services/asset-requirements.service';
import type {
  AssetType,
  AssetRequirement,
  CreateAssetRequirementData,
  UpdateAssetRequirementData,
} from '../types/asset-requirements.types';

interface AssetRequirementsManagerProps {
  eventId: number;
}

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'headshot', label: 'Headshot' },
  { value: 'bio', label: 'Biography' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'logo', label: 'Logo' },
  { value: 'other', label: 'Other' },
];

export function AssetRequirementsManager({ eventId }: AssetRequirementsManagerProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<{ id: number; label: string } | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<AssetRequirement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [assetType, setAssetType] = useState<AssetType>('headshot');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [acceptedFileTypes, setAcceptedFileTypes] = useState('.jpg,.png');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(5);
  const [minImageWidth, setMinImageWidth] = useState<number | undefined>(undefined);
  const [minImageHeight, setMinImageHeight] = useState<number | undefined>(undefined);

  // Get asset requirements
  const { data: requirements, isLoading } = useQuery({
    queryKey: ['asset-requirements', eventId],
    queryFn: () => assetRequirementsService.getAssetRequirements(eventId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAssetRequirementData) =>
      assetRequirementsService.createAssetRequirement(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requirements', eventId] });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create asset requirement');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ requirementId, data }: { requirementId: number; data: UpdateAssetRequirementData }) =>
      assetRequirementsService.updateAssetRequirement(eventId, requirementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requirements', eventId] });
      resetForm();
      setIsModalOpen(false);
      setEditingRequirement(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update asset requirement');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (requirementId: number) =>
      assetRequirementsService.deleteAssetRequirement(eventId, requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requirements', eventId] });
    },
  });

  const resetForm = () => {
    setAssetType('headshot');
    setLabel('');
    setDescription('');
    setIsRequired(true);
    setAcceptedFileTypes('.jpg,.png');
    setMaxFileSizeMb(5);
    setMinImageWidth(undefined);
    setMinImageHeight(undefined);
    setError(null);
    setEditingRequirement(null);
  };

  const loadFormData = (requirement: AssetRequirement) => {
    setAssetType(requirement.assetType);
    setLabel(requirement.label);
    setDescription(requirement.description || '');
    setIsRequired(requirement.isRequired);
    setAcceptedFileTypes(requirement.acceptedFileTypes?.join(',') || '.jpg,.png');
    setMaxFileSizeMb(requirement.maxFileSizeMb || 5);
    setMinImageWidth(requirement.minImageWidth || undefined);
    setMinImageHeight(requirement.minImageHeight || undefined);
    setError(null);
  };

  const handleEditClick = (requirement: AssetRequirement) => {
    setEditingRequirement(requirement);
    loadFormData(requirement);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = {
      assetType,
      label,
      description: description || undefined,
      isRequired,
      acceptedFileTypes: acceptedFileTypes.split(',').map((t) => t.trim()),
      maxFileSizeMb,
      minImageWidth,
      minImageHeight,
      sortOrder: editingRequirement?.sortOrder || (requirements?.length || 0) + 1,
    };

    if (editingRequirement) {
      // Update existing requirement
      updateMutation.mutate({
        requirementId: editingRequirement.id,
        data,
      });
    } else {
      // Create new requirement
      createMutation.mutate(data);
    }
  };

  const handleDeleteClick = (requirementId: number, requirementLabel: string) => {
    setRequirementToDelete({ id: requirementId, label: requirementLabel });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (requirementToDelete) {
      deleteMutation.mutate(requirementToDelete.id);
      setIsDeleteModalOpen(false);
      setRequirementToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Asset Requirements</h3>
          <p className="text-sm text-gray-600">
            Define what assets speakers need to submit
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : requirements && requirements.length > 0 ? (
        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:border-emerald-300 transition-colors"
            >
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium text-gray-900 truncate">{req.label}</h4>
                    {req.isRequired && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded flex-shrink-0">
                        Required
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded flex-shrink-0">
                      {req.assetType}
                    </span>
                  </div>
                  {req.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{req.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {req.acceptedFileTypes && (
                      <span className="truncate max-w-xs">Files: {req.acceptedFileTypes.join(', ')}</span>
                    )}
                    {req.maxFileSizeMb && <span className="flex-shrink-0">Max: {req.maxFileSizeMb}MB</span>}
                    {req.minImageWidth && req.minImageHeight && (
                      <span className="flex-shrink-0">
                        Min Size: {req.minImageWidth}x{req.minImageHeight}px
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEditClick(req)}
                  className="text-gray-400 hover:text-emerald-600 transition-colors p-2"
                  aria-label="Edit requirement"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(req.id, req.label)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  aria-label="Delete requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No asset requirements defined yet</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="secondary"
            className="mx-auto"
          >
            Add First Requirement
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingRequirement ? 'Edit Asset Requirement' : 'Add Asset Requirement'}
        size="lg"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
              Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type *
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as AssetType)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  required
                >
                  {assetTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Label *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., Speaker Headshot"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                placeholder="Provide instructions or guidelines for speakers..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will help speakers understand what you're looking for
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
              <input
                type="checkbox"
                id="isRequired"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <label htmlFor="isRequired" className="text-sm font-medium text-gray-900 cursor-pointer block">
                  Mark this asset as required
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  Speakers must submit this asset before completing their submission
                </p>
              </div>
            </div>
          </div>

          {/* File Requirements Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
              File Requirements
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted File Types
                </label>
                <input
                  type="text"
                  value={acceptedFileTypes}
                  onChange={(e) => setAcceptedFileTypes(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., .jpg,.png,.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated file extensions
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={maxFileSizeMb}
                  onChange={(e) => setMaxFileSizeMb(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed file size
                </p>
              </div>
            </div>
          </div>

          {/* Image Dimensions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
              Image Dimensions (Optional)
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Width (px)
                </label>
                <input
                  type="number"
                  value={minImageWidth || ''}
                  onChange={(e) =>
                    setMinImageWidth(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., 800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Height (px)
                </label>
                <input
                  type="number"
                  value={minImageHeight || ''}
                  onChange={(e) =>
                    setMinImageHeight(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., 600"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Leave blank if you don't want to enforce minimum dimensions
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  {editingRequirement ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingRequirement ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Requirement
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Requirement
                    </>
                  )}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleModalClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRequirementToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Asset Requirement?"
        message={`Are you sure you want to delete "${requirementToDelete?.label}"? This will permanently remove this requirement and speakers won't be able to submit files for it.`}
        confirmText="Delete Requirement"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
