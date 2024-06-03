import { zodResolver } from '@hookform/resolvers/zod';
import submitUpdateFinancialProfile, {
  collectChangedData,
} from 'api/requests/submitUpdateFinancialProfile';
import useSblAuth from 'api/useSblAuth';
import Button from 'components/Button';
import CrumbTrail from 'components/CrumbTrail';
import FormButtonGroup from 'components/FormButtonGroup';
import FormErrorHeader from 'components/FormErrorHeader';
import type { IdFormHeaderErrorsType } from 'components/FormErrorHeader.data';
import { IdFormHeaderErrors } from 'components/FormErrorHeader.data';
import FormHeaderWrapper from 'components/FormHeaderWrapper';
import FormWrapper from 'components/FormWrapper';
import { Link, Paragraph, TextIntroduction } from 'design-system-react';
import type { JSXElement } from 'design-system-react/dist/types/jsxElement';
import type { UpdateInstitutionType } from 'pages/Filing/UpdateFinancialProfile/types';
import { UpdateInstitutionSchema } from 'pages/Filing/UpdateFinancialProfile/types';
import { scrollToElement } from 'pages/ProfileForm/ProfileFormUtils';
import { scenarios } from 'pages/Summary/Summary.data';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import type { InstitutionDetailsApiType } from 'types/formTypes';
import { Five } from 'utils/constants';
import { updateFinancialProfileKeyLogic } from 'utils/getFormErrorKeyLogic';
import getIsRoutingEnabled from 'utils/getIsRoutingEnabled';
import FinancialInstitutionDetailsForm from './FinancialInstitutionDetailsForm';
import UpdateAffiliateInformation from './UpdateAffiliateInformation';
import UpdateIdentifyingInformation from './UpdateIdentifyingInformation';
import buildProfileFormDefaults from './buildProfileFormDefaults';
import { formErrorsOrder } from './formErrorsOrder';

export default function UFPForm({
  data,
}: {
  data: InstitutionDetailsApiType;
}): JSXElement {
  const { lei } = useParams();
  const auth = useSblAuth();
  const isRoutingEnabled = getIsRoutingEnabled();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo(() => buildProfileFormDefaults(data), [data]);

  const {
    trigger,
    register,
    reset,
    setValue,
    formState: { errors: formErrors, dirtyFields },
    watch,
  } = useForm<UpdateInstitutionType>({
    resolver: zodResolver(UpdateInstitutionSchema),
    defaultValues,
  });

  const changedData = collectChangedData(watch(), dirtyFields, data);

  // Used for error scrolling
  const formErrorHeaderId = 'UFPFormErrorHeader';

  // NOTE: This function is used for submitting the multipart/formData
  const onSubmitButtonAction = async (): Promise<void> => {
    const passesValidation = await trigger();

    if (passesValidation && changedData) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(
          'Data being submitted:',
          JSON.stringify(changedData, null, Five),
        );
      }
      try {
        setLoading(true);
        await submitUpdateFinancialProfile(auth, changedData);
        setLoading(false);
        if (isRoutingEnabled)
          navigate('/summary', {
            state: { scenario: scenarios.SuccessInstitutionProfileUpdate },
          });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error submitting UFP', error);
      }
    } else {
      scrollToElement(formErrorHeaderId);
    }
  };

  // Reset form data to the defaultValues
  const onClearform = (): void => reset();

  const orderedFormErrorsObject = useMemo(
    () =>
      formErrorsOrder(formErrors, [
        'rssd_id',
        'tax_id',
        'sbl_institution_types_other',
        'parent_lei',
        'parent_rssd_id',
        'top_holder_lei',
        'top_holder_rssd_id',
      ]),
    [formErrors],
  );

  return (
    <main id='main'>
      <CrumbTrail>
        <Link isRouterLink href='/landing' key='home'>
          Platform home
        </Link>
        {lei ? (
          <Link isRouterLink href={`/institution/${lei}`} key='view-instition'>
            View your financial institution profile
          </Link>
        ) : null}
      </CrumbTrail>
      <FormWrapper isMarginTop={false}>
        <FormHeaderWrapper>
          <TextIntroduction
            heading='Update your financial institution profile'
            subheading='This profile reflects the most current data available to the CFPB for your financial institution. We pull data from sources including GLEIF (Global Legal Entity Identifier Foundation), the National Information Center (NIC), and direct requests to our support staff. '
            description={
              <Paragraph>
                Only fill out the form fields you wish to update. Requested
                updates are processed by our support staff. Please allow 24-48
                hours for a response during normal business hours. If you need
                additional assistance with this form,{' '}
                <Link href='mailto:SBLHelp@cfpb.gov?subject=[BETA] Update your financial institution profile: completion process'>
                  email our support staff
                </Link>
                .
              </Paragraph>
            }
          />
        </FormHeaderWrapper>
        <FormErrorHeader<UpdateInstitutionType, IdFormHeaderErrorsType>
          alertHeading='There was a problem updating your financial institution profile'
          errors={orderedFormErrorsObject}
          id={formErrorHeaderId}
          formErrorHeaderObject={IdFormHeaderErrors}
          keyLogicFunc={updateFinancialProfileKeyLogic}
        />
        <FinancialInstitutionDetailsForm {...{ data }} />
        <UpdateIdentifyingInformation
          {...{ data, register, setValue, watch, formErrors }}
        />
        <UpdateAffiliateInformation
          {...{ register, formErrors, watch }}
          heading='Update your parent entity information'
        />
        <FormButtonGroup>
          <Button
            id='nav-submit'
            label='Submit'
            appearance='primary'
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={onSubmitButtonAction}
            iconRight={loading ? 'updating' : ''}
            disabled={!changedData}
            type='submit'
          />
          <Button
            id='nav-reset'
            label='Reset form'
            appearance='warning'
            onClick={onClearform}
            asLink
          />
        </FormButtonGroup>
      </FormWrapper>
    </main>
  );
}
