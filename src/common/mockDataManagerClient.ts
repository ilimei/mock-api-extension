import { Client } from './request';

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
  responseBodyType: 'json' | 'javascript';
  code?: string;
  enabled: boolean;
  createdAt: number;
}

export interface IMockDataManager {
  // Projects methods
  getProjects(): Promise<IProject[]>;
  getProject(id: string): Promise<IProject | null>;
  addProject(project: Omit<IProject, 'id' | 'createdAt'>): Promise<IProject>;
  updateProject(opt: { id: string, projectData: Partial<IProject> }): Promise<IProject | null>;
  deleteProject(id: string): Promise<boolean>;
  toggleProjectEnabled(id: string): Promise<IProject | null>;

  // Mock APIs methods
  getMockApis(projectId: string): Promise<MockApi[]>;
  getMockApi(opt: { projectId: string, apiId: string }): Promise<MockApi | null>;
  addMockApi(opt: { projectId: string, apiData: Omit<MockApi, 'id' | 'projectId' | 'createdAt'> }): Promise<MockApi>;
  updateMockApi(opt: { projectId: string, apiId: string, apiData: Partial<MockApi> }): Promise<MockApi | null>;
  deleteMockApi(opt: { projectId: string, apiId: string }): Promise<boolean>;
  toggleApiEnabled(opt: { projectId: string, apiId: string }): Promise<MockApi | null>;
}

class MockDataManagerClient extends Client implements IMockDataManager {
  constructor() {
    super(data => {
      chrome.runtime.sendMessage({
        source: 'manager-script',
        data,
      }, response => {
        if (response?.source === 'manager-background-script') {
          console.info('--->', response.data);
          this.handleData(response.data);
        }
      });
    });
  }

  getProjects(): Promise<IProject[]> {
    return this.call('getProjects', {}) as Promise<any>;
  }

  getProject(id: string): Promise<IProject | null> {
    return this.call('getProject', id) as Promise<any>;
  }

  addProject(project: Omit<IProject, 'id' | 'createdAt'>): Promise<IProject> {
    return this.call('addProject', project) as Promise<any>;
  }

  updateProject(opt: { id: string, projectData: Partial<IProject> }): Promise<IProject | null> {
    return this.call('updateProject', opt) as Promise<any>;
  }

  deleteProject(id: string): Promise<boolean> {
    return this.call('deleteProject', id) as Promise<any>;
  }

  toggleProjectEnabled(id: string): Promise<IProject | null> {
    return this.call('toggleProjectEnabled', id) as Promise<any>;
  }

  getMockApis(projectId: string): Promise<MockApi[]> {
    return this.call('getMockApis', projectId) as Promise<any>;
  }

  getMockApi(opt: { projectId: string, apiId: string }): Promise<MockApi | null> {
    return this.call('getMockApi', opt) as Promise<any>;
  }

  addMockApi(opt: { projectId: string, apiData: Omit<MockApi, 'id' | 'projectId' | 'createdAt'> }): Promise<MockApi> {
    return this.call('addMockApi', opt) as Promise<any>;
  }

  updateMockApi(opt: { projectId: string, apiId: string, apiData: Partial<MockApi> }): Promise<MockApi | null> {
    return this.call('updateMockApi', opt) as Promise<any>;
  }

  deleteMockApi(opt: { projectId: string, apiId: string }): Promise<boolean> {
    return this.call('deleteMockApi', opt) as Promise<any>;
  }

  toggleApiEnabled(opt: { projectId: string, apiId: string }): Promise<MockApi | null> {
    return this.call('toggleApiEnabled', opt) as Promise<any>;
  }
}

export default new MockDataManagerClient();