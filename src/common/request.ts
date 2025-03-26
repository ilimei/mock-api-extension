let id = 0;
const genRequestId = () => {
  if (id > Number.MAX_VALUE - 1) {
    id = 0;
  }
  return ++id;
}

export type IPromise<T> = {
  promise: Promise<T>;
  resolve: (data: T) => void;
  reject: (err: any) => void;
};

const genPromise = <T>() => {
  const ret = {} as IPromise<T>;
  ret.promise = new Promise<T>((resolve, reject) => {
    ret.resolve = resolve;
    ret.reject = reject;
  });
  return ret;
}

export class Server {
  methods: Record<string, (data: any, ...args: any[]) => Promise<any>> = {};

  constructor(registrReciver: (cb: (data: { id: number; data: any; method: string }, send: (data: any) => void, ...args: any[]) => void) => void) {
    registrReciver(async (data, send, ...args: any[]) => {
      const { id, data: req, method } = data;
      if (!this.methods[method]) {
        send({
          id,
          success: false,
          error: `not method ${method} found`,
        });
      } else {
        try {
          const ret = await this.methods[method](req, ...args);
          send({
            id,
            success: true,
            data: ret,
          });
        } catch (e: any) {
          send({
            id,
            success: false,
            data: e.message || 'invoke error',
          });
        }
      }
    });
  }

  register(method: string, func: (data: any) => Promise<any>) {
    this.methods[method] = func;
  }
}

export class Client {
  protected reqMap: Record<number, IPromise<any>> = {};
  constructor(private send: (data: any) => void, registrReciver: (cb: (data: { id: number; data: any; success: boolean }) => void) => void = () => {}) {
    registrReciver(data => {
      this.handleData(data);
    });
  }

  protected handleData = (data: { id: number; data: any; success: boolean; }) => {
    const { id, data: ret, success } = data;
    if (!this.reqMap[id]) {
      return;
    }
    if (success) {
      this.reqMap[id].resolve(ret);
    } else {
      this.reqMap[id].reject(new Error(ret));
    }
  };

  protected async call(method: string, req: any) {
    const id = genRequestId();
    const pro = genPromise();
    this.reqMap[id] = pro;
    this.send({
      id,
      method,
      data: req,
    });
    return await pro.promise;
  }
}
