export const HTTP_STATUS_CODES = [
  { value: 200, label: '200 - OK', text: 'OK' },
  { value: 201, label: '201 - Created', text: 'Created' },
  { value: 204, label: '204 - No Content', text: 'No Content' },
  { value: 400, label: '400 - Bad Request', text: 'Bad Request' },
  { value: 401, label: '401 - Unauthorized', text: 'Unauthorized' },
  { value: 403, label: '403 - Forbidden', text: 'Forbidden' },
  { value: 404, label: '404 - Not Found', text: 'Not Found' },
  { value: 500, label: '500 - Server Error', text: 'Server Error' },
];

export const HTTP_STATUS_CODES_MAP = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Server Error',
};

export type HTTP_STATUS_CODE = keyof typeof HTTP_STATUS_CODES_MAP;
