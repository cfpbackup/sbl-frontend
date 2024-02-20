import { request } from 'api/axiosService';
import { emailSubjects } from 'api/common';
import type { SblAuthProperties } from 'api/useSblAuth';
import type { UFPSchema } from 'pages/Filing/UpdateFinancialProfile/types';
import qs from 'query-string';

// Used to remove 'checkboxes' property
function omit(key: string, object: UFPSchema): Record<string, string> {
  // @ts-expect-error intentional key omission
  const { [key]: omitted, ...rest } = object;
  return rest;
}

// Pulls 'checkboxes' property out to keep the object flat, and then reinserts every checkbox property at first depth
const formatFinancialProfileObject = (
  object: UFPSchema,
): Record<string, string> => {
  const solution = omit('checkboxes', object);
  for (const key of Object.keys(object.checkboxes)) {
    solution[key] = String(object.checkboxes[key]);
  }
  return solution;
};

const submitUpdateFinancialProfile = async (
  auth: SblAuthProperties,
  financialProfileObject: UFPSchema,
): Promise<null> => {
  return request<null>({
    // TODO: wait for backend team to set this path in the API design
    url: `/send`,
    method: 'post',
    // ex: 'userName=test%40gmail.com&password=Password%21&grant_type=password'
    body: qs.stringify(formatFinancialProfileObject(financialProfileObject)),
    headers: {
      Authorization: `Bearer ${auth.user?.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Mail-Subject': emailSubjects.UpdateFinancialProfile,
      'X-Mail-Sender-Address': auth.user?.profile.email,
      // TODO: Determine if the user's name is needed - 'X-Mail-Sender-Name'
    },
  });
};

export default submitUpdateFinancialProfile;
