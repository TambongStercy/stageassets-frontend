export type AssetType = 'headshot' | 'bio' | 'presentation' | 'logo' | 'other';

export interface AssetRequirement {
  id: number;
  eventId: number;
  assetType: AssetType;
  label: string;
  description?: string;
  isRequired: boolean;
  acceptedFileTypes?: string[];
  maxFileSizeMb?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetRequirementData {
  assetType: AssetType;
  label: string;
  description?: string;
  isRequired: boolean;
  acceptedFileTypes?: string[];
  maxFileSizeMb?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  sortOrder?: number;
}

export interface UpdateAssetRequirementData extends Partial<CreateAssetRequirementData> {}
