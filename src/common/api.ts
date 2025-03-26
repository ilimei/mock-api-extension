import { HTTP_STATUS_CODE } from '@/constants/httpStatusCodes';
import { Client } from '../common/request';

export type IMockResponse = {
  mock: true;
  data: any;
  headers: Record<string, string>;
  status: HTTP_STATUS_CODE;
} | {
  mock: false;
}

export interface IExtensionApi {
  // getMockNamespace(): Promise<IMockNamespace[]>;
  handleRequest(data: { input: RequestInfo, init?: RequestInit }): Promise<IMockResponse>;
  setDomainEnabled(data: { domain: string, enabled: boolean }): Promise<boolean>;
}

class BackgroundClient extends Client implements IExtensionApi {
  constructor() {
    super(data => {
      chrome.runtime.sendMessage({
        source: 'content-script',
        data,
      }, response => {
        if (response?.source === 'background-script') {
          this.handleData(response.data);
        }
      });
    });
  }

  async setDomainEnabled(data: { domain: string; enabled: boolean; }): Promise<boolean> {
    return this.call('setDomainEnabled', data) as Promise<any>;
  }

  async handleRequest(data: { input: RequestInfo, init?: RequestInit }) {
    return this.call('handleRequest', data) as Promise<any>;
  }
}

export default new BackgroundClient();
