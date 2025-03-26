import { useState, useEffect } from 'react';
import mockDataManager, { IProject } from '../../common/mockDataManager';

export const useProject = (id: string) => {
  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const projectData = await mockDataManager.getProject(id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const toggleProjectEnabled = async () => {
    if (!project) return;
    
    try {
      const updatedProject = await mockDataManager.toggleProjectEnabled(id);
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (error) {
      console.error('Failed to toggle project status:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await mockDataManager.deleteProject(projectId);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  };

  const updateProject = async (projectData: Partial<IProject>) => {
    try {
      const updatedProject = await mockDataManager.updateProject(id, projectData);
      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }

  return { project, loading, toggleProjectEnabled, deleteProject, updateProject };
};
