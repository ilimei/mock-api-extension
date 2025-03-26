import { useState, useEffect } from 'react';
import mockDataManager, { MockApi } from '../../common/mockDataManagerClient';

export const useMockApis = (projectId: string) => {
  const [mockApis, setMockApis] = useState<MockApi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadApis = async () => {
      setLoading(true);
      try {
        const apis = await mockDataManager.getMockApis(projectId);
        setMockApis(apis);
      } catch (error) {
        console.error('Failed to load APIs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadApis();
    }
  }, [projectId]);

  const addMockApi = async (apiData: Omit<MockApi, 'id' | 'projectId' | 'createdAt'>) => {
    try {
      const newApi = await mockDataManager.addMockApi({ projectId, apiData });
      setMockApis(prevApis => [...prevApis, newApi]);
      return newApi;
    } catch (error) {
      console.error('Failed to add API:', error);
      return null;
    }
  };

  const updateMockApi = async (apiId: string, apiData: Partial<MockApi>) => {
    try {
      const updatedApi = await mockDataManager.updateMockApi({ projectId, apiId, apiData });
      if (updatedApi) {
        setMockApis(prevApis =>
          prevApis.map(api => api.id === apiId ? updatedApi : api)
        );
      }
      return updatedApi;
    } catch (error) {
      console.error('Failed to update API:', error);
      return null;
    }
  };

  const deleteMockApi = async (apiId: string) => {
    try {
      const success = await mockDataManager.deleteMockApi({ projectId, apiId });
      if (success) {
        setMockApis(prevApis => prevApis.filter(api => api.id !== apiId));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete API:', error);
      return false;
    }
  };

  const toggleApiEnabled = async (apiId: string) => {
    try {
      const updatedApi = await mockDataManager.toggleApiEnabled({ projectId, apiId });
      if (updatedApi) {
        setMockApis(prevApis =>
          prevApis.map(api => api.id === apiId ? updatedApi : api)
        );
      }
      return updatedApi;
    } catch (error) {
      console.error('Failed to toggle API status:', error);
      return null;
    }
  };

  return {
    mockApis,
    loading,
    addMockApi,
    updateMockApi,
    deleteMockApi,
    toggleApiEnabled
  };
};
