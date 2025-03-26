export interface IProject {
  id: string;
  name: string;
  description: string;
  domain: string;
  createdAt: number;
  enabled: boolean;
}

export interface MockApi {
  id: string;
  projectId: string;
  path: string;
  method: string;
  statusCode: number;
  delay: number;
  responseBody: string;
  enabled: boolean;
  createdAt: number;
}

class MockDataManager {
  // Projects methods
  async getProjects(): Promise<IProject[]> {
    try {
      const result = await chrome.storage.local.get(['projects']);
      return result.projects || [];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<IProject | null> {
    try {
      const projects = await this.getProjects();
      return projects.find(project => project.id === id) || null;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  async saveProjects(projects: IProject[]): Promise<void> {
    try {
      await chrome.storage.local.set({ projects });
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }

  async addProject(project: Omit<IProject, 'id' | 'createdAt'>): Promise<IProject> {
    const newProject: IProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    const projects = await this.getProjects();
    await this.saveProjects([...projects, newProject]);
    return newProject;
  }

  async updateProject(id: string, projectData: Partial<IProject>): Promise<IProject | null> {
    const projects = await this.getProjects();
    const updatedProjects = projects.map(project =>
      project.id === id ? { ...project, ...projectData } : project
    );
    
    await this.saveProjects(updatedProjects);
    return updatedProjects.find(project => project.id === id) || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const projects = await this.getProjects();
    const updatedProjects = projects.filter(project => project.id !== id);
    
    // Also delete all associated APIs
    const apis = await this.getMockApis(id);
    const apiIds = apis.map(api => api.id);
    for (const apiId of apiIds) {
      await this.deleteMockApi(id, apiId);
    }
    
    await this.saveProjects(updatedProjects);
    return true;
  }

  async toggleProjectEnabled(id: string): Promise<IProject | null> {
    const project = await this.getProject(id);
    if (!project) return null;
    
    return this.updateProject(id, { enabled: !project.enabled });
  }

  // Mock APIs methods
  async getMockApis(projectId: string): Promise<MockApi[]> {
    try {
      const key = `apis_${projectId}`;
      const result = await chrome.storage.local.get([key]);
      return result[key] || [];
    } catch (error) {
      console.error('Failed to load APIs:', error);
      return [];
    }
  }

  async getMockApi(projectId: string, apiId: string): Promise<MockApi | null> {
    const apis = await this.getMockApis(projectId);
    return apis.find(api => api.id === apiId) || null;
  }

  async saveMockApis(projectId: string, apis: MockApi[]): Promise<void> {
    try {
      const key = `apis_${projectId}`;
      await chrome.storage.local.set({ [key]: apis });
    } catch (error) {
      console.error('Failed to save APIs:', error);
    }
  }

  async addMockApi(projectId: string, apiData: Omit<MockApi, 'id' | 'projectId' | 'createdAt'>): Promise<MockApi> {
    const newApi: MockApi = {
      ...apiData,
      id: Date.now().toString(),
      projectId,
      createdAt: Date.now()
    };
    
    const apis = await this.getMockApis(projectId);
    await this.saveMockApis(projectId, [...apis, newApi]);
    return newApi;
  }

  async updateMockApi(projectId: string, apiId: string, apiData: Partial<MockApi>): Promise<MockApi | null> {
    const apis = await this.getMockApis(projectId);
    const updatedApis = apis.map(api =>
      api.id === apiId ? { ...api, ...apiData } : api
    );
    
    await this.saveMockApis(projectId, updatedApis);
    return updatedApis.find(api => api.id === apiId) || null;
  }

  async deleteMockApi(projectId: string, apiId: string): Promise<boolean> {
    const apis = await this.getMockApis(projectId);
    const updatedApis = apis.filter(api => api.id !== apiId);
    
    await this.saveMockApis(projectId, updatedApis);
    return true;
  }

  async toggleApiEnabled(projectId: string, apiId: string): Promise<MockApi | null> {
    const api = await this.getMockApi(projectId, apiId);
    if (!api) return null;
    
    return this.updateMockApi(projectId, apiId, { enabled: !api.enabled });
  }
}

export default new MockDataManager();
