import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import fetchFilingSubmissionLatest from 'api/requests/fetchFilingSubmissionLatest';
import useSblAuth from 'api/useSblAuth';
import type { AxiosResponse } from 'axios';
import type { FilingPeriodType, SubmissionResponse } from 'types/filingTypes';
import type { InstitutionDetailsApiType } from 'types/formTypes';

/* Used for checking for Validations */
const useGetSubmissionLatest = (
  lei: InstitutionDetailsApiType['lei'],
  filingPeriod: FilingPeriodType,
  onSettledCallback?: () => void,
  handleStartRetryCallback?: (
    response: AxiosResponse<SubmissionResponse>,
  ) => void,
  handleRetryEndCallback?: () => void,
  // eslint-disable-next-line @typescript-eslint/max-params
): UseQueryResult<SubmissionResponse> => {
  const auth = useSblAuth();

  return useQuery({
    queryKey: [`fetch-submission`, lei, filingPeriod],
    queryFn: async (): Promise<SubmissionResponse> =>
      fetchFilingSubmissionLatest(
        auth,
        lei,
        filingPeriod,
        handleStartRetryCallback,
        handleRetryEndCallback,
      ),
    retry: false,
    cacheTime: 0,
    onSettled: (): void => {
      if (onSettledCallback) onSettledCallback();
    },
  });
};

export default useGetSubmissionLatest;
