import { getAxiosInstance, request } from 'api/axiosService';
import type { SblAuthProperties } from 'api/useSblAuth';
import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import { fileSubmissionState } from 'pages/Filing/FilingApp/FileSubmission.data';
import type {
  FilingPeriodType,
  SubmissionResponse,
  UploadResponse,
} from 'types/filingTypes';
import type { InstitutionDetailsApiType } from 'types/formTypes';
import type { AxiosInstanceExtended } from 'types/requestsTypes';
import { Five, One, Thousand, Zero } from 'utils/constants';

const MAX_RETRIES = Five;
const RETRY_DELAY = Thousand; // ms

const apiClient: AxiosInstanceExtended = getAxiosInstance();

function getMaxRetriesAxiosError(response: AxiosResponse): AxiosError {
  // Order of parameters: 'message', 'code', 'config', 'request', 'response'
  return new AxiosError(
    'You have reached the maximum amount of retries',
    '429',
    response.config,
    response.request,
    {
      data: response.data as AxiosResponse<UploadResponse>,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      status: 429,
      statusText: 'Too Many Requests',
      headers: response.headers,
      config: response.config,
    },
  );
}

async function retryRequestWithDelay(
  axiosInstance: AxiosInstanceExtended,
  response: AxiosResponse,
): Promise<AxiosResponse> {
  if (!axiosInstance.defaults.retryCount) {
    // eslint-disable-next-line no-param-reassign
    axiosInstance.defaults.retryCount = Zero;
  }

  if (axiosInstance.defaults.retryCount >= MAX_RETRIES) {
    throw getMaxRetriesAxiosError(response);
  }

  // eslint-disable-next-line no-param-reassign
  axiosInstance.defaults.retryCount += One;

  console.log(
    'Validation STILL in-progress - Long Polling - RETRYING',
    response,
  );

  return new Promise(resolve => {
    setTimeout(() => resolve(axiosInstance(response.config)), RETRY_DELAY);
  });
}

/** Used in `useGetSubmissionLatest` to long poll for validation after an upload * */
function shouldRetry(response: AxiosResponse<UploadResponse>): boolean {
  // Check if the response has a 'state' property equal to "VALIDATION_IN_PROGRESS"
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unused-expressions, prettier/prettier
  return (response.data?.state && response.data.state) === fileSubmissionState.VALIDATION_IN_PROGRESS;
}

const interceptor = apiClient.interceptors.response.use(
  async (response: AxiosResponse<UploadResponse>) => {
    // Retry if validation still in-progress
    if (shouldRetry(response)) {
      if (apiClient.defaults.beforeRetryCallback) {
        console.log('run beforeRetryCallback');
        apiClient.defaults.beforeRetryCallback();
      }
      return retryRequestWithDelay(apiClient, response);
    }
    apiClient.defaults.retryCount = Zero;
    return response;
  },
  async (error: AxiosError) => {
    apiClient.defaults.retryCount = Zero;
    // If an error occurs, reject immediately
    throw error;
  },
);

export const fetchFilingSubmissionLatest = async (
  auth: SblAuthProperties,
  lei: InstitutionDetailsApiType['lei'],
  filingPeriod: FilingPeriodType,
  beforeRetryCallback: (() => void) | undefined,
  // eslint-disable-next-line @typescript-eslint/max-params
): Promise<SubmissionResponse> => {
  if (beforeRetryCallback) {
    apiClient.defaults.beforeRetryCallback = beforeRetryCallback;
  }
  return request<SubmissionResponse>({
    axiosInstance: apiClient,
    url: `/v1/filing/institutions/${lei}/filings/${filingPeriod}/submissions/latest`,
    method: 'get',
    headers: { Authorization: `Bearer ${auth.user?.access_token}` },
  });
};

export default fetchFilingSubmissionLatest;
