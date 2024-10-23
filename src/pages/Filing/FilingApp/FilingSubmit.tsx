// Some weird TypeScript errors are happening here, so I'm going to disable the linter for this file for now
// Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { zodResolver } from '@hookform/resolvers/zod';
import WrapperPageContent from 'WrapperPageContent';
import Links from 'components/CommonLinks';
import FormButtonGroup from 'components/FormButtonGroup';
import FormSectionWrapper from 'components/FormSectionWrapper';
import InputErrorMessage from 'components/InputErrorMessage';
import { Link } from 'components/Link';
import { LoadingContent } from 'components/Loading';
import SectionIntro from 'components/SectionIntro';
import {
  Alert,
  Checkbox,
  Paragraph,
  TextIntroduction,
  WellContainer,
} from 'design-system-react';
import { DisplayField } from 'pages/Filing/ViewInstitutionProfile/DisplayField';

import FormHeaderWrapper from 'components/FormHeaderWrapper';
import FormWrapper from 'components/FormWrapper';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import type { SignSubmitSchema } from 'types/formTypes';
import { signSubmitSchema } from 'types/formTypes';
import { formatDateTimeShort } from 'utils/formatDateTime';
import { useFilingAndSubmissionInfo } from 'utils/useFilingAndSubmissionInfo';
import useInstitutionDetails from 'utils/useInstitutionDetails';
import { useSignAndCertify } from 'utils/useSignAndCertify';
import useUserProfile from 'utils/useUserProfile';
import { AffiliateInformation } from '../ViewInstitutionProfile/AffiliateInformation';
import { FinancialInstitutionDetails } from '../ViewInstitutionProfile/FinancialInstitutionDetails';
import { IdentifyingInformation } from '../ViewInstitutionProfile/IdentifyingInformation';
import { FilingNavButtons } from './FilingNavButtons';
import { FilingSteps } from './FilingSteps';
import {
  FileInformation,
  PointOfContactConfirm,
  getDescriptionForSignAndSubmitSection,
} from './FilingSubmit.helpers';
import InstitutionHeading from './InstitutionHeading';

export function FilingSubmit(): JSX.Element {
  const { lei, year } = useParams();
  const navigate = useNavigate();

  const {
    isError: userError,
    isLoading: userLoading,
    data: user,
  } = useUserProfile();

  const {
    data: institution,
    isLoading: institutionLoading,
    isError: institutionError,
    // @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717
  } = useInstitutionDetails(lei);

  const {
    filing,
    submission,
    isLoading: filingLoading,
    error,
  } = useFilingAndSubmissionInfo({
    lei,
    filingPeriod: year,
  });

  const { mutateAsync: mutateuseSignAndCertify } = useSignAndCertify({
    lei,
    filingPeriod: year,
  });

  // TODO: Defensive coding if the user restarted the validation process
  // This defensive coding is to guard against if the user navigates to /submit early
  // const isAllowedSignCertify = determineCanSubmit({
  //   filing,
  //   submission,
  // });

  //

  // Derived Variables
  const username = user.name.length > 0 ? user.name : user.email;

  console.log('filing:', filing);
  console.log('submission:', submission);

  const properSubmittedState = Boolean(filing.confirmation_id);

  /* React-Hook-Form */

  const initCheckboxesState = {
    institution: false,
    identifying: false,
    affiliate: false,
    poc: false,
    file: false,
    voluntary: false,
    certify: false,
  };

  const {
    control,
    // register,
    // handleSubmit,
    setValue,
    trigger,
    formState: { errors: formErrors },
  } = useForm<SignSubmitSchema>({
    defaultValues: { signSubmitCheckboxes: initCheckboxesState }, // Start with an empty array
    resolver: zodResolver(signSubmitSchema),
  });

  const onUncheckAllCheckboxes = (): void => {
    for (const category of Object.keys(initCheckboxesState))
      setValue(`signSubmitCheckboxes.${category}`, false);
  };

  const onSubmit = async (): Promise<void> => {
    const passesValidation = await trigger();
    console.log('passesValidation:', passesValidation);
    if (passesValidation) {
      await mutateuseSignAndCertify();
    }
  };
  const onPreviousClick = (): void =>
    navigate(`/filing/${year}/${lei}/contact`);

  /* FilingSubmit - Renders */

  if (filingLoading || institutionLoading || userLoading)
    return <LoadingContent />;

  if (error || userError || institutionError)
    return (
      <>
        <Alert status='error' message={userError} isVisible={!!userError} />
        <Alert
          status='error'
          message={institutionError}
          isVisible={!!institutionError}
        />
        {/* @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717 */}
        <Alert status='error' message={error} isVisible={!!error} />
      </>
    );

  return (
    <>
      <WrapperPageContent className='my-[1.875rem]'>
        <InstitutionHeading
          headingType='4'
          name={institution.name}
          filingPeriod={year}
        />
      </WrapperPageContent>
      <FilingSteps />
      <FormWrapper>
        <FormHeaderWrapper>
          <TextIntroduction
            heading='Sign and submit'
            subheading='Before you sign and submit, carefully review all the information provided in each of the following sections. For each section, check the box to confirm that the information is accurate and complete, or follow the instructions to make changes.'
            description={
              <p>
                An authorized representative of your financial institution with
                knowledge of the data must certify the accuracy and completeness
                of the data reported pursuant to{' '}
                <Links.RegulationB section='§ 1002.109(a)(1)(ii)' />.
              </p>
            }
          />
        </FormHeaderWrapper>

        {properSubmittedState ? (
          <Alert
            status='success'
            message={`Thank you for participating in the beta filing process ${year}`}
          >
            <div className='max-w-[41.875rem]'>
              <Paragraph>
                {`This filing was submitted by ${username} on ${formatDateTimeShort(
                  submission.submission_time,
                  'fff',
                )}. The confirmation number for this filing is
                    ${filing.confirmation_id}.`}
              </Paragraph>
              <Paragraph>
                The beta platform is for testing purposes only and any
                user-supplied data may be removed at any time. Take a moment to{' '}
                <Link href='mailto:SBLHelp@cfpb.gov?subject=[BETA] Sign and Submit: Form assistance'>
                  email our support staff
                </Link>{' '}
                with your feedback or{' '}
                <Link href={`/filing/${year}/${lei}/upload`}>
                  upload a new file
                </Link>{' '}
                to continue testing.
              </Paragraph>
            </div>
          </Alert>
        ) : null}

        <FinancialInstitutionDetails
          heading='Confirm your financial institution details'
          data={institution}
          isDomainsVisible={false}
          description={getDescriptionForSignAndSubmitSection()}
        />
        <div className='u-mt30'>
          {/* TODO: Make the ControllerCheckbox with optional errors component */}
          <Controller
            control={control}
            name='signSubmitCheckboxes.institution'
            render={({ field }) => (
              <Checkbox
                id='fi-details'
                label='The details for my financial institution are accurate and complete.'
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.institution?.message
                    ? 'error'
                    : ''
                }
              />
            )}
          />
        </div>

        {formErrors?.signSubmitCheckboxes?.institution?.message ? (
          <div>
            <InputErrorMessage>
              {formErrors?.signSubmitCheckboxes?.institution?.message}
            </InputErrorMessage>
          </div>
        ) : null}

        <IdentifyingInformation
          heading='Confirm your financial institution identifying information'
          data={institution}
          description={getDescriptionForSignAndSubmitSection()}
        />
        <div className='u-mt30'>
          <Controller
            control={control}
            name='signSubmitCheckboxes.identifying'
            render={({ field }) => (
              <Checkbox
                id='identifying-info'
                label='The identifying information for my financial institution is accurate and complete. '
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.identifying?.message
                    ? 'error'
                    : ''
                }
              />
            )}
          />
        </div>

        {formErrors?.signSubmitCheckboxes?.identifying?.message ? (
          <div>
            <InputErrorMessage>
              {formErrors?.signSubmitCheckboxes?.identifying?.message}
            </InputErrorMessage>
          </div>
        ) : null}

        <AffiliateInformation
          heading='Confirm your parent entity information (if applicable)'
          data={institution}
          description={getDescriptionForSignAndSubmitSection()}
        />
        <div className='u-mt30'>
          <Controller
            control={control}
            name='signSubmitCheckboxes.affiliate'
            render={({ field }) => (
              <Checkbox
                id='affiliate-info'
                label='The parent entity information for my financial institution is accurate and complete, or my financial institution does not have a parent entity so this section is not applicable.'
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.affiliate?.message
                    ? 'error'
                    : ''
                }
              />
            )}
          />
        </div>

        {formErrors?.signSubmitCheckboxes?.affiliate?.message ? (
          <div>
            <InputErrorMessage>
              {formErrors?.signSubmitCheckboxes?.affiliate?.message}
            </InputErrorMessage>
          </div>
        ) : null}

        {/* @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717 */}
        <PointOfContactConfirm data={filing} />
        <div className='u-mt30'>
          <Controller
            control={control}
            name='signSubmitCheckboxes.poc'
            render={({ field }) => (
              <Checkbox
                id='poc'
                label='The point of contact information for my financial institution is accurate and complete.'
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.poc?.message ? 'error' : ''
                }
              />
            )}
          />
        </div>

        {formErrors?.signSubmitCheckboxes?.poc?.message ? (
          <div>
            <InputErrorMessage>
              {formErrors?.signSubmitCheckboxes?.poc?.message}
            </InputErrorMessage>
          </div>
        ) : null}

        {/* @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717 */}
        <FileInformation data={submission} />
        {/* @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717 */}
        <div className='u-mt30'>
          <Controller
            control={control}
            name='signSubmitCheckboxes.file'
            render={({ field }) => (
              <Checkbox
                id='file-info'
                label='The register information for my financial institution is accurate and complete. '
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.file?.message ? 'error' : ''
                }
              />
            )}
          />
        </div>

        {formErrors?.signSubmitCheckboxes?.file?.message ? (
          <div>
            <InputErrorMessage>
              {formErrors?.signSubmitCheckboxes?.file?.message}
            </InputErrorMessage>
          </div>
        ) : null}

        <FormSectionWrapper className='u-mt45'>
          <SectionIntro heading='Confirm voluntary reporter status'>
            Check the box to confirm that the information is accurate and
            complete. If the information in this section is incorrect,{' '}
            <Link href={`/filing/${year}/${lei}/contact`}>
              update your filing details.
            </Link>
          </SectionIntro>

          <WellContainer className='u-mt30 mb-[1.875rem]'>
            <DisplayField
              label='Volunteer Reporter Status'
              value='Volunteer reporter'
            />
          </WellContainer>
          <Controller
            control={control}
            name='signSubmitCheckboxes.voluntary'
            render={({ field }) => (
              <Checkbox
                id='voluntary-reporting-status'
                label='The voluntary reporter status for my filing is accurate and complete.'
                {...field}
                checked={field.value}
                status={
                  formErrors?.signSubmitCheckboxes?.voluntary?.message
                    ? 'error'
                    : ''
                }
              />
            )}
          />
          {formErrors?.signSubmitCheckboxes?.voluntary?.message ? (
            <div>
              <InputErrorMessage>
                {formErrors?.signSubmitCheckboxes?.voluntary?.message}
              </InputErrorMessage>
            </div>
          ) : null}
        </FormSectionWrapper>

        {/* @ts-expect-error Part of code cleanup for post-mvp see: https://github.com/cfpb/sbl-frontend/issues/717 */}
        {/* <SignCertify
              name={user.name.length > 0 ? user.name : user.email}
              // onChange={onCheckboxUpdate('certify')}
              // value={checkboxValues.certify}
            /> */}

        <FormSectionWrapper>
          <SectionIntro heading='Sign and certify your filing'>
            <p>
              An authorized representative of your financial institution with
              knowledge of the data must certify the accuracy and completeness
              of the data reported pursuant to{' '}
              <Links.RegulationB section='§ 1002.109(a)(1)(ii)' />. To complete
              your official regulatory filing, check the box and submit your
              filing.
            </p>
          </SectionIntro>
          {properSubmittedState ? null : (
            <Alert status='warning'>
              <div className='max-w-[41.875rem]'>
                Submitting a filing does not preclude you from further beta
                participation. Filing data will be used for testing purposes
                only.
              </div>
            </Alert>
          )}
          <WellContainer className='u-mt30 mb-[1.875rem]'>
            <Controller
              control={control}
              name='signSubmitCheckboxes.certify'
              render={({ field }) => (
                <Checkbox
                  id='sign-and-certify'
                  label={`I, ${username}, am an authorized representative of my financial institution with knowledge of the data and certify the accuracy and completeness of the data reported.`}
                  {...field}
                  checked={field.value}
                  status={
                    formErrors?.signSubmitCheckboxes?.certify?.message
                      ? 'error'
                      : ''
                  }
                />
              )}
            />
            {formErrors?.signSubmitCheckboxes?.certify?.message ? (
              <div>
                <InputErrorMessage>
                  {formErrors?.signSubmitCheckboxes?.certify?.message}
                </InputErrorMessage>
              </div>
            ) : null}
          </WellContainer>
        </FormSectionWrapper>
        <FormButtonGroup isFilingStep className='mb-[1.875rem]'>
          <FilingNavButtons
            classNameButtonContainer='mb-[2.313rem]'
            onPreviousClick={onPreviousClick}
            labelNext='Submit filing'
            onNextClick={onSubmit}
            onClearClick={onUncheckAllCheckboxes}
          />
        </FormButtonGroup>

        {properSubmittedState ? (
          <Alert
            status='success'
            message={`Thank you for participating in the beta filing process ${year}`}
          >
            <div className='max-w-[41.875rem]'>
              <Paragraph>
                {`This filing was submitted by ${username} on ${formatDateTimeShort(
                  submission.submission_time,
                  'fff',
                )}. The confirmation number for this filing is
                    ${filing.confirmation_id}.`}
              </Paragraph>
              <Paragraph>
                The beta platform is for testing purposes only and any
                user-supplied data may be removed at any time. Take a moment to{' '}
                <Link href='mailto:SBLHelp@cfpb.gov?subject=[BETA] Sign and Submit: Form assistance'>
                  email our support staff
                </Link>{' '}
                with your feedback or{' '}
                <Link href={`/filing/${year}/${lei}/upload`}>
                  upload a new file
                </Link>{' '}
                to continue testing.
              </Paragraph>
            </div>
          </Alert>
        ) : null}
      </FormWrapper>
    </>
  );
}

export default FilingSubmit;
