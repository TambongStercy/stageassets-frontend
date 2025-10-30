import { User, FileText, Presentation, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from './ui';
import type { CreateAssetRequirementData, AssetType } from '../types/asset-requirements.types';

export interface AssetPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirements: Omit<CreateAssetRequirementData, 'sortOrder'>[];
}

export const ASSET_PRESETS: AssetPreset[] = [
  {
    id: 'headshot',
    name: 'Professional Headshot',
    description: 'High-quality profile photo',
    icon: <User className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
    requirements: [
      {
        assetType: 'headshot',
        label: 'Professional Headshot',
        description: 'High-resolution professional photo with clear face visibility',
        isRequired: true,
        acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
        maxFileSizeMb: 5,
        minImageWidth: 500,
        minImageHeight: 500,
      },
    ],
  },
  {
    id: 'bio',
    name: 'Biography',
    description: 'Speaker bio document',
    icon: <FileText className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-600',
    requirements: [
      {
        assetType: 'bio',
        label: 'Speaker Biography',
        description: 'Professional bio (150-300 words)',
        isRequired: true,
        acceptedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
        maxFileSizeMb: 2,
      },
    ],
  },
  {
    id: 'presentation',
    name: 'Presentation Slides',
    description: 'Slide deck or materials',
    icon: <Presentation className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-600',
    requirements: [
      {
        assetType: 'presentation',
        label: 'Presentation Slides',
        description: 'Slide deck in PDF or PowerPoint format',
        isRequired: true,
        acceptedFileTypes: ['.pdf', '.ppt', '.pptx'],
        maxFileSizeMb: 50,
      },
    ],
  },
  {
    id: 'logo',
    name: 'Company Logo',
    description: 'Organization branding',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-600',
    requirements: [
      {
        assetType: 'logo',
        label: 'Company Logo',
        description: 'High-resolution logo (transparent PNG preferred)',
        isRequired: false,
        acceptedFileTypes: ['.png', '.svg', '.jpg'],
        maxFileSizeMb: 5,
        minImageWidth: 500,
        minImageHeight: 500,
      },
    ],
  },
  {
    id: 'conference-package',
    name: 'Conference Speaker Package',
    description: 'Complete speaker asset bundle',
    icon: <Presentation className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-600',
    requirements: [
      {
        assetType: 'headshot',
        label: 'Professional Headshot',
        description: 'High-resolution professional photo',
        isRequired: true,
        acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
        maxFileSizeMb: 5,
        minImageWidth: 500,
        minImageHeight: 500,
      },
      {
        assetType: 'bio',
        label: 'Speaker Biography',
        description: 'Professional bio (150-300 words)',
        isRequired: true,
        acceptedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
        maxFileSizeMb: 2,
      },
      {
        assetType: 'presentation',
        label: 'Presentation Slides',
        description: 'Slide deck in PDF or PowerPoint format',
        isRequired: true,
        acceptedFileTypes: ['.pdf', '.ppt', '.pptx'],
        maxFileSizeMb: 50,
      },
    ],
  },
];

interface AssetRequirementPresetsProps {
  selectedPresets: string[];
  onTogglePreset: (presetId: string) => void;
  onAddCustom: () => void;
}

export function AssetRequirementPresets({
  selectedPresets,
  onTogglePreset,
  onAddCustom,
}: AssetRequirementPresetsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Add Templates</h3>
        <p className="text-sm text-gray-600">
          Select common asset types or create your own custom requirements
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSET_PRESETS.map((preset) => {
          const isSelected = selectedPresets.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onTogglePreset(preset.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${preset.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  <div className="text-white">{preset.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-gray-600">{preset.description}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {preset.requirements.length} requirement
                {preset.requirements.length > 1 ? 's' : ''}
              </div>
            </button>
          );
        })}

        {/* Custom Requirement Button */}
        <button
          type="button"
          onClick={onAddCustom}
          className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 text-left transition-all group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 group-hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
              <Plus className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                Custom Requirement
              </h4>
              <p className="text-xs text-gray-600">Define your own asset type</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Fully customizable</div>
        </button>
      </div>

      {selectedPresets.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                {selectedPresets.length} template{selectedPresets.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-blue-700">
                These requirements will be added to your event. You can modify them later from
                the event details page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
