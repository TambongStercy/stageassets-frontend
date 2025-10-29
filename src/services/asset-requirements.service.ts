import apiClient from '../lib/axios';
import type {
  AssetRequirement,
  CreateAssetRequirementData,
  UpdateAssetRequirementData,
} from '../types/asset-requirements.types';

export const assetRequirementsService = {
  /**
   * Create a new asset requirement for an event
   */
  async createAssetRequirement(
    eventId: number,
    data: CreateAssetRequirementData
  ): Promise<AssetRequirement> {
    const response = await apiClient.post<AssetRequirement>(
      `/events/${eventId}/asset-requirements`,
      data
    );
    return response.data;
  },

  /**
   * Get all asset requirements for an event
   */
  async getAssetRequirements(eventId: number): Promise<AssetRequirement[]> {
    const response = await apiClient.get<AssetRequirement[]>(
      `/events/${eventId}/asset-requirements`
    );
    return response.data;
  },

  /**
   * Get a single asset requirement
   */
  async getAssetRequirement(eventId: number, requirementId: number): Promise<AssetRequirement> {
    const response = await apiClient.get<AssetRequirement>(
      `/events/${eventId}/asset-requirements/${requirementId}`
    );
    return response.data;
  },

  /**
   * Update an asset requirement
   */
  async updateAssetRequirement(
    eventId: number,
    requirementId: number,
    data: UpdateAssetRequirementData
  ): Promise<AssetRequirement> {
    const response = await apiClient.put<AssetRequirement>(
      `/events/${eventId}/asset-requirements/${requirementId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an asset requirement
   */
  async deleteAssetRequirement(eventId: number, requirementId: number): Promise<void> {
    await apiClient.delete(`/events/${eventId}/asset-requirements/${requirementId}`);
  },

  /**
   * Get asset requirements for an event (public - for speakers)
   */
  async getPublicAssetRequirements(eventId: number): Promise<AssetRequirement[]> {
    const response = await apiClient.get<AssetRequirement[]>(
      `/portal/events/${eventId}/asset-requirements`
    );
    return response.data;
  },
};
