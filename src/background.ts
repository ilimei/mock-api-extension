import { IExtensionApi } from "./common/api";
import { IMockNamespace } from "./common/mock";

function loadMockData(): IMockNamespace[] {
  const mockData = localStorage.getItem("mockData");
  if (mockData) {
    return JSON.parse(mockData);
  }
  return [];
}

function saveMockData(mockData: IMockNamespace[]) {
  localStorage.setItem("mockData", JSON.stringify(mockData));
}

class ExtenstionApi implements IExtensionApi {
  private mockData: IMockNamespace[] = [];

  constructor() {
    // 在编辑页面中读取数据
    chrome.storage.local.get('mockData', (result) => {
      this.mockData = result.mockData || [];
    });
  }

  getMockNamespace(): Promise<IMockNamespace[]> {
    return Promise.resolve(this.mockData);
  }

  setMockNamespace(mockData: IMockNamespace[]) {
    chrome.storage.local.set({ mockData }, () => {
      console.log('数据已保存');
    });
  }
}
