/* eslint-disable react/require-default-props */
import SectionIntro from 'components/SectionIntro';
import { Link, WellContainer } from 'design-system-react';
import type { ReactNode } from 'react';
import type {
  DomainType as Domain,
  InstitutionDetailsApiType,
} from 'types/formTypes';
import { FormSectionWrapper } from '../../../components/FormSectionWrapper';
import InstitutionDataLabels from '../formHelpers';
import AddressStreetOptional from './AddressStreetOptional';
import { DisplayField } from './DisplayField';
import Links from 'components/CommonLinks';

export const formatDomains = (domains?: Domain[]): string =>
  (domains ?? []).map((domain: Domain) => domain.domain).join(', ');

const defaultDescription = (
  <>
    To update the email domains for your financial institution,{' '}
    <Link href='mailto:SBLHelp@cfpb.gov?subject=[BETA] Update financial institution profile: Update email domain'>
      email our support staff
    </Link>
    . To update any other data in this section, contact your Local Operating
    Unit (LOU) or visit <Links.GetAnLEI /> to identify your LOU.
  </>
);

export function FinancialInstitutionDetails({
  data,
  heading,
  isDomainsVisible = true,
  description = defaultDescription,
}: {
  data: InstitutionDetailsApiType;
  heading?: ReactNode;
  isDomainsVisible?: boolean;
  description?: ReactNode;
}): JSX.Element {
  return (
    <FormSectionWrapper isFieldSet={false} className='u-mt60'>
      <SectionIntro heading={heading}>{description}</SectionIntro>

      <WellContainer className='u-mt30'>
        <DisplayField label={InstitutionDataLabels.fiName} value={data.name} />
        <DisplayField
          label={InstitutionDataLabels.hqAddress}
          value={
            <>
              {data.hq_address_street_1}
              <br />
              <AddressStreetOptional street={data.hq_address_street_2} />
              <AddressStreetOptional street={data.hq_address_street_3} />
              <AddressStreetOptional street={data.hq_address_street_4} />
              {data.hq_address_city}, {data.hq_address_state_code}{' '}
              {data.hq_address_zip}
            </>
          }
        />
        <DisplayField label={InstitutionDataLabels.lei} value={data.lei} />
        <DisplayField
          label={InstitutionDataLabels.leiStatus}
          value={
            <span className='capitalize'>
              {data.is_active ? 'Active' : 'Inactive'}
            </span>
          }
        />
        {isDomainsVisible ? (
          <DisplayField
            label={InstitutionDataLabels.emailDomains}
            value={formatDomains(data.domains)}
          />
        ) : (
          ''
        )}
      </WellContainer>
    </FormSectionWrapper>
  );
}

FinancialInstitutionDetails.defaultProps = {
  heading: 'Financial institution details',
};

export default FinancialInstitutionDetails;
