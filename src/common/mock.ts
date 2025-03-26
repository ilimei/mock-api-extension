// namespace
// group
// mock

/**
 * 对接口的mock
 */
export interface IMock {
  url: string | RegExp;
  method: string;
  // 直接返回的数据
  data?: string;
  // 通过代码生成
  code?: string;
}

export interface IMockGroup {
  name: string;
  // mock的接口
  mocks: IMock[];
}

export interface IMockNamespace {
  name: string;
  match: string;
  groups: IMockGroup[];
}

function isURLMatch(url: string | RegExp, requestUrl: string): boolean {
  if (typeof url === "string") {
    return url === requestUrl;
  } else if (url instanceof RegExp) {
    return url.test(requestUrl);
  }
  return false;
}
