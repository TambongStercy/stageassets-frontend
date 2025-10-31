import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from './ui';
import type { CreateAssetRequirementData } from '../types/asset-requirements.types';

interface CustomRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (requirement: CreateAssetRequirementData) => void;
}

export function CustomRequirementModal({ isOpen, onClose, onAdd }: CustomRequirementModalProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState<'headshot' | 'bio' | 'presentation' | 'logo' | 'other'>('other');
  const [isRequired, setIsRequired] = useState(true);
  const [acceptedTypes, setAcceptedTypes] = useState('');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(10);
  const [minImageWidth, setMinImageWidth] = useState('');
  const [minImageHeight, setMinImageHeight] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requirement: CreateAssetRequirementData = {
      label: label.trim(),
      description: description.trim() || undefined,
      assetType,
      isRequired,
      acceptedFileTypes: acceptedTypes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      maxFileSizeMb,
      minImageWidth: minImageWidth ? parseInt(minImageWidth) : undefined,
      minImageHeight: minImageHeight ? parseInt(minImageHeight) : undefined,
    };

    onAdd(requirement);
    handleClose();
  };

  const handleClose = () => {
    setLabel('');
    setDescription('');
    setAssetType('other');
    setIsRequired(true);
    setAcceptedTypes('');
    setMaxFileSizeMb(10);
    setMinImageWidth('');
    setMinImageHeight('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Custom Requirement</h3>
              <p className="text-sm text-gray-600">Define a custom asset requirement</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Basic Information
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Headshot, Bio, Presentation Slides"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Additional instructions for speakers..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="headshot">Headshot</option>
                  <option value="bio">Bio</option>
                  <option value="presentation">Presentation</option>
                  <option value="logo">Logo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* File Requirements */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              File Requirements
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accepted File Types
              </label>
              <input
                type="text"
                value={acceptedTypes}
                onChange={(e) => setAcceptedTypes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder=".jpg, .png, .pdf (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to allow all file types</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={maxFileSizeMb}
                onChange={(e) => setMaxFileSizeMb(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="1"
                max="100"
              />
            </div>

            {(assetType === 'headshot' || assetType === 'logo') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Width (px)
                  </label>
                  <input
                    type="number"
                    value={minImageWidth}
                    onChange={(e) => setMinImageWidth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Height (px)
                  </label>
                  <input
                    type="number"
                    value={minImageHeight}
                    onChange={(e) => setMinImageHeight(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
