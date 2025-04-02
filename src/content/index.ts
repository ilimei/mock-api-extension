
import { Server } from '@/common/request';
import backgroundClient, { IExtensionApi } from '@/common/api';
import mockDataManagerClient from '@/common/mockDataManagerClient';
import { matchDomain } from '@/common/utils';

class ContentServer extends Server implements IExtensionApi {

  constructor() {
    super(cb => {
      window.addEventListener('message', e => {
        if (e.data.source !== 'interceptor-script') {
          return;
        }
        cb(e.data.data, data => {
          window.postMessage({
            source: 'content-script',
            data,
          });
        });
      });
    });

    this.register('handleRequest', this.handleRequest);
  }

  setDomainEnabled(data: { domain: string; enabled: boolean; }): Promise<boolean> {
    return backgroundClient.setDomainEnabled(data);
  }

  handleRequest = async (data: { input: RequestInfo, init?: RequestInit }) => {
    return backgroundClient.handleRequest(data);
  };
}

// 将拦截器代码注入到页面
function injectInterceptor() {
  new ContentServer();
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('dist/assets/interceptor.js');
  (document.head || document.documentElement).appendChild(script);
}

try {
  const domain = location.hostname;

  // Get stored enabled state for this domain
  chrome.storage.local.get([domain], (result) => {
    // If we have a stored value for this domain, use it
    // Otherwise default to true
    const domainEnabled = result[domain] !== undefined ? result[domain] : true;
    if (domainEnabled) {
      mockDataManagerClient.getProjects().then(projects => {
        if (projects.some(project => {
          if (matchDomain(project.domain, location.origin)) {
            return true;
          }
          return false;
        })) {
          injectInterceptor();
        }
      });
    }
  });
} catch (e) {
  console.error("Invalid URL:", e);
}
