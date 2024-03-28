import CommonLinks from 'components/CommonLinks';
import FormMain from 'components/FormMain';
import InputEntry from 'components/InputEntry';
import SectionIntro from 'components/SectionIntro';
import { Paragraph, WellContainer } from 'design-system-react';
import type { JSXElement } from 'design-system-react/dist/types/jsxElement';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { InstitutionDetailsApiType } from 'types/formTypes';
import { FormSectionWrapper } from '../../../components/FormSectionWrapper';
import { DisplayField } from '../ViewInstitutionProfile/DisplayField';
import TypesFinancialInstitutionSection from './TypesFinancialInstitutionSection';
import { processRssdId } from './processRssdId';
import type { UpdateInstitutionType } from './types';

const taxID = 'tax_id';
const rssdID = 'rssd_id';

function FieldFederalPrudentialRegulator({
  data,
  register,
}: {
  data: InstitutionDetailsApiType;
  register: UseFormRegister<UpdateInstitutionType>;
}): JSXElement {
  return (
    <>
      <DisplayField
        label='Federal prudential regulator'
        value={`${data.primary_federal_regulator.name} (${data.primary_federal_regulator.id})`}
      />
      <input
        hidden
        {...register('primary_federal_regulator.name')}
        value={data.primary_federal_regulator.name}
      />
      <input
        hidden
        {...register('primary_federal_regulator.id')}
        value={data.primary_federal_regulator.id}
      />
    </>
  );
}

function UpdateIdentifyingInformation({
  data,
  register,
  setValue,
  formErrors,
  watch,
}: {
  data: InstitutionDetailsApiType;
  formErrors: FieldErrors<UpdateInstitutionType>;
  register: UseFormRegister<UpdateInstitutionType>;
  setValue: UseFormSetValue<UpdateInstitutionType>;
  watch: UseFormWatch<UpdateInstitutionType>;
}): JSXElement {
  // setValueAs leaves displayed value out of sync with saved value
  const rssdIdValue = watch(rssdID);

  return (
    <FormSectionWrapper>
      <SectionIntro heading='Update your financial institution identifying information'>
        If your financial institution has an RSSD ID, provide it here and we
        will pull your Federal prudential regulator and TIN from{' '}
        <CommonLinks.NIC />. If your financial institution does not have an RSSD
        ID, provide your Federal Taxpayer Identification Number (TIN).
      </SectionIntro>
      <WellContainer className='u-mt30'>
        <InputEntry
          id={taxID}
          label='Federal Taxpayer Identification Number (TIN)'
          {...register(taxID)}
          errorMessage={formErrors[taxID]?.message}
        />
        <InputEntry
          id={rssdID}
          label='Research, Statistics, Supervision, Discount (RSSD) ID'
          type='number'
          isOptional
          {...register(rssdID, {
            setValueAs: processRssdId,
          })}
          value={rssdIdValue}
          errorMessage={formErrors[rssdID]?.message}
        />
        <FieldFederalPrudentialRegulator {...{ register, data }} />
      </WellContainer>
      <Paragraph className='u-mt30 u-mb30'>
        Select all applicable options that describe your financial institution.
        If you wish to provide additional types of financial institutions add
        them to “Other” and check the box.{' '}
      </Paragraph>
      <FormMain>
        <TypesFinancialInstitutionSection
          {...{ data, register, setValue, watch, formErrors }}
        />
      </FormMain>
    </FormSectionWrapper>
  );
}

export default UpdateIdentifyingInformation;
