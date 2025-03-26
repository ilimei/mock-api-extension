import type { IExtensionApi, IMockResponse } from '@/common/api';
import type { IProject } from '@/common/mockDataManager';
import { Server } from '@/common/request';
import mockDataManager from '@/common/mockDataManager';

class BackgroundServer extends Server implements IExtensionApi {
  ctx = {
    url: '',
  };

  constructor() {
    super(cb => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.source === 'content-script') {
          this.ctx.url = sender.url || '';
          cb(request.data, data => {
            sendResponse({
              source: 'background-script',
              data,
            });
          });
          return true;
        }
      });
    });

    this.register('handleRequest', this.handleRequest.bind(this));
    this.register('setDomainEnabled', this.setDomainEnabled.bind(this));

    // Set up web page loading event listeners
    this.setupNavigationListeners();
  }

  private setupNavigationListeners() {
    // Listen for when a navigation is committed
    chrome.webNavigation.onCommitted.addListener((details) => {
      // Filter for main frame navigations (not iframes)
      if (details.frameId === 0) {
        console.log('Page navigation started:', details.url);
        this.handlePageNavigation(details.tabId, details.url);
      }
    });

    // Listen for when a page is completely loaded
    chrome.webNavigation.onCompleted.addListener((details) => {
      // Filter for main frame navigations (not iframes)
      if (details.frameId === 0) {
        console.log('Page fully loaded:', details.url);
        this.handlePageLoaded(details.tabId, details.url);
      }
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // Check if the tab has completed loading
      if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated and loaded:', tab.url);
        this.handleTabUpdate(tabId, tab.url);
      }
    });

    // Listen for tab activation (when user switches tabs)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
          console.log('Tab activated:', tab.url);
          this.handleTabActivated(tab.id as number, tab.url);
        }
      });
    });
  }

  private async handlePageNavigation(tabId: number, url: string) {
    // This is called at the start of navigation
    // You can clear the badge here or set it to a loading state
    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#aaaaaa' });
  }

  private async handlePageLoaded(tabId: number, url: string) {
    // This is called when the page is fully loaded
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Check if this domain is enabled
      chrome.storage.local.get(['domainEnabled'], (result) => {
        const domainEnabled = result.domainEnabled || {};
        const isDomainEnabled = domainEnabled[domain] !== false; // Default to true if not set

        if (!isDomainEnabled) {
          chrome.action.setBadgeText({ text: '' });
          return;
        }

        // Get and count your projects for this domain
        // Update your badge accordingly
        this.updateBadgeForDomain(domain, url);
      });
    } catch (e) {
      console.error("Error handling page load:", e);
      chrome.action.setBadgeText({ text: '' });
    }
  }

  private handleTabUpdate(tabId: number, url: string) {
    // Similar to handlePageLoaded, but for tab updates
    this.handlePageLoaded(tabId, url);
  }

  private handleTabActivated(tabId: number, url: string) {
    // When a user switches to a tab, update the badge to reflect that tab's state
    this.handlePageLoaded(tabId, url);
  }

  private async updateBadgeForDomain(domain: string, url: string) {
    // Implement your logic to count enabled projects for this domain
    // Similar to what you have in popup/app.tsx

    // Example:
    // Get projects from storage
    chrome.storage.local.get(['projects'], (result) => {
      const projects = (result.projects || []) as IProject[];
      const relevantProjects = projects.filter(p =>
        url.startsWith(p.domain) && p.enabled
      );

      const count = relevantProjects.length;
      if (count > 0) {
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#1890ff' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }

  async setDomainEnabled(data: { domain: string; enabled: boolean; }): Promise<boolean> {
    chrome.storage.local.get('domainEnabled', (result) => {
      const domainEnabled = result.domainEnabled || {};
      domainEnabled[data.domain] = data.enabled;
      chrome.storage.local.set({ domainEnabled });
    });
    return true;
  }

  async handleRequest(data: { input: RequestInfo, init?: RequestInit }) {
    const { url } = this.ctx;
    const projects = await mockDataManager.getProjects().then(projects => {
      return projects.filter(p =>
        url.startsWith(p.domain) && p.enabled
      );
    });
    const apis = (await Promise.all(projects.map(p => mockDataManager.getMockApis(p.id)))).flatMap(a => a);
    const requestUrl = new URL(data.input as string, url);
    const method = data.init?.method || 'GET';
    const api = apis.find(a => requestUrl.pathname === a.path && a.method === method);

    if (api) {
      return {
        mock: true,
        data: JSON.parse(api.responseBody),
        status: api.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      } as IMockResponse;
    }
    return {
      mock: false,
    } as IMockResponse;
  }
}

new BackgroundServer();
