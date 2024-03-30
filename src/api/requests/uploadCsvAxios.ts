import { request } from 'api/axiosService';
import type { SblAuthProperties } from 'api/useSblAuth';
import type { FilingPeriodType, UploadResponse } from 'types/filingTypes';
import type { InstitutionDetailsApiType } from 'types/formTypes';
import { Hundred } from 'utils/constants';

const uploadCsvAxios = async (
  auth: SblAuthProperties,
  file: File,
  lei: InstitutionDetailsApiType['lei'],
  period_code: FilingPeriodType,
  // eslint-disable-next-line @typescript-eslint/max-params
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return request<UploadResponse>({
    url: `/v1/filing/institutions/${lei}/filings/${period_code}/submissions`,
    method: 'post',
    body: formData,
    headers: {
      Authorization: `Bearer ${auth.user?.access_token}`,
      'Content-Type': 'multipart/form-data',
    },
    options: {
      onUploadProgress: progressEvent => {
        if (
          typeof progressEvent.total === 'number' &&
          typeof progressEvent.loaded === 'number'
        ) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * Hundred) / progressEvent.total,
          );
          console.log('Upload progressEvent:', progressEvent);
          console.log('Upload percent:', percentCompleted);
        }
      },
    },
  });
};

export default uploadCsvAxios;
