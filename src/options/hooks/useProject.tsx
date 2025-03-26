import { useState, useEffect } from 'react';
import mockDataManager, { IProject } from '../../common/mockDataManagerClient';

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const foundProject = await mockDataManager.getProject(projectId);
      if (foundProject) {
        setProject(foundProject);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectEnabled = async (checked: boolean) => {
    if (!project) return;

    try {
      const updatedProject = { ...project, enabled: checked };
      mockDataManager.updateProject({ id: projectId, projectData: updatedProject });

      // Update local state
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const deleteProject = (projectId: string) => {
    try {
      const success = mockDataManager.deleteProject(projectId);
      return success;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  };

  return {
    project,
    loading,
    toggleProjectEnabled,
    deleteProject
  };
};
