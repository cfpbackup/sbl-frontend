import { request } from 'api/axiosService';
import type { SblAuthProperties } from 'api/useSblAuth';

const uploadCsvAxios = async (
  auth: SblAuthProperties,
  file: File,
  lei: string,
  period_code: string,
  // eslint-disable-next-line @typescript-eslint/max-params
): Promise<null> => {
  const formData = new FormData();
  formData.append('file', file);

  return request<null>({
    url: `/v1/filing/institutions/${lei}/filings/${period_code}/submissions`,
    method: 'post',
    body: formData,
    headers: {
      Authorization: `Bearer ${auth.user?.access_token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default uploadCsvAxios;
