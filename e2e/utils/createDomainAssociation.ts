import axios from 'axios';

interface CreateDomainAssociationProperties {
  adminToken: string;
  testEmailDomain: string;
  testLei: string;
}

export default async function createDomainAssociation({
  adminToken,
  testEmailDomain,
  testLei,
}: CreateDomainAssociationProperties): Promise<void> {
  const optionsForDomainAssociation = {
    method: 'POST',
    url: `http://localhost:8881/v1/institutions/${testLei}/domains`,
    headers: { Authorization: `Bearer ${adminToken}` },
    data: [{ domain: testEmailDomain }],
  };

  try {
    await axios.request(optionsForDomainAssociation);
  } catch (error) {
    // Part of evaluation for linter issues see: https://github.com/cfpb/sbl-frontend/issues/1039
    // eslint-disable-next-line no-console
    console.error(
      'error when creating a domain/institution association :>>',
      error,
    );
    throw error;
  }
}
