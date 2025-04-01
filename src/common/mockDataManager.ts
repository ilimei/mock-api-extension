import { Server } from '@/common/request';
import type { IMockDataManager, IProject, MockApi } from './mockDataManagerClient';

class MockDataManager extends Server implements IMockDataManager {
  private projects: IProject[] = [];
  private apisByProject: Record<string, MockApi[]> = {};
  private initialized = false;

  constructor() {
    super(cb => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.source === 'manager-script') {
          cb(request.data, data => {
            sendResponse({
              source: 'manager-background-script',
              data,
            });
          });
          return true;
        }
      });
    });

    console.info('Binding methods to the class instance', MockDataManager.prototype);

    Object.keys(Object.getOwnPropertyDescriptors(MockDataManager.prototype)).forEach(key => {
      if (key === 'constructor') return;
      console.info('Binding:', key);
      // @ts-expect-error - Bind all methods to the class instance
      if (typeof this[key] === 'function') {
        // @ts-expect-error - Bind all methods to the class instance
        this[key] = this[key].bind(this);
        // @ts-expect-error - Bind all methods to the class instance
        this.register(key, this[key]);
      }
    });

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Load all projects
      const result = await chrome.storage.local.get(['projects']);
      this.projects = result.projects || [];

      // Load all APIs for each project
      for (const project of this.projects) {
        const key = `apis_${project.id}`;
        const apiResult = await chrome.storage.local.get([key]);
        this.apisByProject[project.id] = apiResult[key] || [];
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Projects methods
  async getProjects(): Promise<IProject[]> {
    await this.ensureInitialized();
    return [...this.projects]; // Return a copy to prevent external modification
  }

  async getProject(id: string): Promise<IProject | null> {
    await this.ensureInitialized();
    return this.projects.find(project => project.id === id) || null;
  }

  private async saveProjects(): Promise<void> {
    try {
      await chrome.storage.local.set({ projects: this.projects });
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }

  async addProject(project: Omit<IProject, 'id' | 'createdAt'>): Promise<IProject> {
    await this.ensureInitialized();

    const newProject: IProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: Date.now()
    };

    this.projects.push(newProject);
    this.apisByProject[newProject.id] = []; // Initialize empty APIs array
    await this.saveProjects();
    return newProject;
  }

  async updateProject({ id, projectData }: { id: string, projectData: Partial<IProject> }): Promise<IProject | null> {
    await this.ensureInitialized();

    const index = this.projects.findIndex(project => project.id === id);
    if (index === -1) return null;

    this.projects[index] = { ...this.projects[index], ...projectData };
    await this.saveProjects();
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.ensureInitialized();

    const initialLength = this.projects.length;
    this.projects = this.projects.filter(project => project.id !== id);

    // Delete associated APIs from storage
    if (this.apisByProject[id]) {
      const key = `apis_${id}`;
      delete this.apisByProject[id];
      await chrome.storage.local.remove(key);
    }

    await this.saveProjects();
    return initialLength > this.projects.length;
  }

  async toggleProjectEnabled(id: string): Promise<IProject | null> {
    await this.ensureInitialized();

    const project = this.projects.find(p => p.id === id);
    if (!project) return null;

    return this.updateProject({ id, projectData: { enabled: !project.enabled } });
  }

  // Mock APIs methods
  async getMockApis(projectId: string): Promise<MockApi[]> {
    await this.ensureInitialized();
    return [...(this.apisByProject[projectId] || [])]; // Return a copy
  }

  async getMockApi({ projectId, apiId }: { projectId: string, apiId: string }): Promise<MockApi | null> {
    await this.ensureInitialized();

    const apis = this.apisByProject[projectId] || [];
    return apis.find(api => api.id === apiId) || null;
  }

  private async saveMockApis(projectId: string): Promise<void> {
    try {
      const key = `apis_${projectId}`;
      await chrome.storage.local.set({ [key]: this.apisByProject[projectId] || [] });
    } catch (error) {
      console.error('Failed to save APIs:', error);
    }
  }

  async addMockApi({ projectId, apiData }: { projectId: string, apiData: Omit<MockApi, 'id' | 'projectId' | 'createdAt'> }): Promise<MockApi> {
    await this.ensureInitialized();

    const newApi: MockApi = {
      ...apiData,
      id: Date.now().toString(),
      projectId,
      createdAt: Date.now()
    };

    if (!this.apisByProject[projectId]) {
      this.apisByProject[projectId] = [];
    }

    this.apisByProject[projectId].push(newApi);
    await this.saveMockApis(projectId);
    return newApi;
  }

  async updateMockApi({ projectId, apiId, apiData }: { projectId: string, apiId: string, apiData: Partial<MockApi> }): Promise<MockApi | null> {
    await this.ensureInitialized();

    const apis = this.apisByProject[projectId] || [];
    const index = apis.findIndex(api => api.id === apiId);
    if (index === -1) return null;

    apis[index] = { ...apis[index], ...apiData };
    await this.saveMockApis(projectId);
    return apis[index];
  }

  async deleteMockApi({ projectId, apiId }: { projectId: string, apiId: string }): Promise<boolean> {
    await this.ensureInitialized();

    const apis = this.apisByProject[projectId] || [];
    const initialLength = apis.length;

    this.apisByProject[projectId] = apis.filter(api => api.id !== apiId);
    await this.saveMockApis(projectId);

    return initialLength > this.apisByProject[projectId].length;
  }

  async toggleApiEnabled({ projectId, apiId }: { projectId: string, apiId: string }): Promise<MockApi | null> {
    await this.ensureInitialized();

    const api = (this.apisByProject[projectId] || []).find(a => a.id === apiId);
    if (!api) return null;

    return this.updateMockApi({ projectId, apiId, apiData: { enabled: !api.enabled } });
  }
}

export default new MockDataManager();
