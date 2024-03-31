import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import axios from 'axios';
import type { UploadResponse } from 'types/filingTypes';

const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define a function to check if the response needs to be retried
type AxiosResponseUploadStateType = AxiosResponse<
  Partial<Pick<UploadResponse, 'state'>>
>;

function shouldRetry(response: AxiosResponseUploadStateType): boolean {
  // Check if the response has a 'state' property equal to '"VALIDATION_IN_PROGRESS"'
  return response.data.state === 'VALIDATION_IN_PROGRESS';
}

const interceptor = apiClient.interceptors.response.use(
  async (response: AxiosResponseUploadStateType) => {
    // If the response doesn't need to be retried, resolve immediately
    console.log('interceptor response', response);
    if (!shouldRetry(response)) {
      return response;
    } // Otherwise, retry the request
    console.log('Validation STILL in-progress - RETRYING', response);
    return apiClient(response.config);
  },
  async (error: AxiosError) => {
    // If an error occurs, reject immediately
    throw error;
  },
);

type Methods = 'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put';

export interface RequestType extends AxiosRequestConfig {
  axiosInstance?: AxiosInstance;
  url: string;
  method: Methods;
  body?: AxiosRequestConfig['data'];
  headers?: AxiosRequestConfig['headers'];
  options?: Partial<AxiosRequestConfig>;
}

export const request = async <T>({
  axiosInstance = apiClient,
  url = '',
  method = 'get',
  body,
  headers,
  options,
}: RequestType): Promise<T> => {
  const argumentList: RequestType[keyof RequestType][] = [url];
  if (body) argumentList.push(body);
  if (headers)
    argumentList.push({
      headers,
      ...options,
    });

  try {
    // @ts-expect-error: A spread argument must either have a tuple type or be passed to a rest parameter.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await axiosInstance[method]<T>(...argumentList);
    return response.data;
  } finally {
    // Remove the interceptor when done with it to prevent memory leaks
    apiClient.interceptors.response.eject(interceptor);
  }
};
