/**
 * Fetch 拦截器
 * 此模块提供了对原生 fetch API 的拦截功能
 */

import type { IExtensionApi, IMockResponse } from '@/common/api';
import { Client } from '../common/request';
import { HTTP_STATUS_CODES_MAP } from '@/constants/httpStatusCodes';

// 保存原始的 fetch 函数
const originalFetch = window.fetch;
// 保存原始的 XMLHttpRequest
const OriginalXMLHttpRequest = window.XMLHttpRequest;

// ContentAPI 调用
class ContentApi extends Client implements IExtensionApi {
  constructor() {
    super(data => {
      window.postMessage({
        source: 'interceptor-script',
        data,
      });
    }, cb => {
      window.addEventListener('message', e => {
        if (e.data.source === 'content-script') {
          cb(e.data.data);
        }
      });
    })
  }

  async setDomainEnabled(data: { domain: string; enabled: boolean; }): Promise<boolean> {
    return this.call('setDomainEnabled', data) as Promise<any>;
  }

  async handleRequest(data: { input: RequestInfo, init?: RequestInit }) {
    return this.call('handleRequest', data) as Promise<IMockResponse>;
  }
}

const contentApi = new ContentApi();

// 覆盖原生的 fetch 函数
// @ts-expect-error not error
window.fetch = async function (input: RequestInfo, init?: RequestInit): Promise<Response> {
  const ret = await contentApi.handleRequest({ input, init });
  if (ret.mock) {
    return Response.json(ret.data, {
      headers: ret.headers,
      status: ret.status,
      statusText: HTTP_STATUS_CODES_MAP[ret.status],
    });
  }
  // 没有匹配的规则，使用原始 fetch
  return originalFetch.call(window, input, init);
};

// 覆盖原生的 XMLHttpRequest
window.XMLHttpRequest = function () {
  const xhr = new OriginalXMLHttpRequest();
  const originalOpen = xhr.open;
  const originalSend = xhr.send;

  let requestUrl = '';
  let requestMethod = '';
  let requestBody: any = null;
  let abort = false;

  // 覆盖 open 方法来捕获 URL 和方法
  xhr.open = function (method: string, url: string, ...args: any[]) {
    requestUrl = url;
    requestMethod = method;
    // @ts-expect-error not error
    return originalOpen.apply(xhr, [method, url, ...args]);
  };

  xhr.addEventListener('abort', () => {
    abort = true;
  });

  // 覆盖 send 方法来拦截请求
  xhr.send = function (body?: any) {
    requestBody = body;

    contentApi.handleRequest({
      input: requestUrl, init: {
        method: requestMethod,
        body,
      }
    }).then(ret => {
      if (abort) {
        return;
      }
      if (ret && ret.mock) {
        Object.defineProperty(xhr, 'status', { value: ret.status });
        Object.defineProperty(xhr, 'statusText', { value: HTTP_STATUS_CODES_MAP[ret.status] });

        Object.defineProperty(xhr, 'responseText', { value: JSON.stringify(ret.data) });
        Object.defineProperty(xhr, 'response', { value: JSON.stringify(ret.data) });

        Object.defineProperty(xhr, 'readyState', { value: 4 });

        // 触发 readyStateChange 事件
        ['readystatechange', 'load', 'loadend'].forEach(eventType => {
          const event = new Event(eventType);
          xhr.dispatchEvent(event);
          const handler = (xhr as any)[`on${eventType}`];
          if (typeof handler === 'function') {
            handler.call(xhr, event);
          }
        });
        return;
      }
      return originalSend.call(xhr, body);
    });
  };

  return xhr;
} as any;

// 保持原型链不变
window.XMLHttpRequest.prototype = OriginalXMLHttpRequest.prototype;

console.info('🚀🚀content script loaded - fetch and XMLHttpRequest interceptors initialized');
