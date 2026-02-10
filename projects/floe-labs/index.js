const { post } = require('../helper/http');

const ENVIO_ENDPOINT = 'https://indexer.hyperindex.xyz/4a53586/v1/graphql';

// GraphQL query to get all active loans with their collateral
const LOANS_QUERY = `
  query GetActiveLoans($limit: Int!, $offset: Int!) {
    Loan(
      where: {
        _or: [
          { status: { _eq: "active" } },
          { status: { _eq: "overdue" } }
        ]
      }
      limit: $limit
      offset: $offset
    ) {
      id
      loanId
      collateralToken
      collateralAmount
      loanToken
      currentPrincipal
      status
    }
  }
`;

async function fetchAllActiveLoans() {
  const headers = {
    'Content-Type': 'application/json',
  };

  const allLoans = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await post(
        ENVIO_ENDPOINT,
        {
          query: LOANS_QUERY,
          variables: { limit: pageSize, offset },
        },
        { headers }
      );

      if (response?.errors) {
        throw new Error(response.errors.map(e => e.message).join('; '));
      }

      const loans = response?.data?.Loan || [];
      allLoans.push(...loans);

      if (loans.length < pageSize) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    } catch (e) {
      throw new Error(`Error fetching Floe loans: ${e.message}`);
    }
  }

  return allLoans;
}

async function tvl(api) {
  const loans = await fetchAllActiveLoans();

  // Aggregate collateral by token address
  const collateralByToken = {};

  for (const loan of loans) {
    if (!loan.collateralToken || !loan.collateralAmount) continue;

    const token = loan.collateralToken.toLowerCase();
    const amount = BigInt(loan.collateralAmount);

    if (!collateralByToken[token]) {
      collateralByToken[token] = BigInt(0);
    }
    collateralByToken[token] += amount;
  }

  // Add balances to API
  for (const [token, amount] of Object.entries(collateralByToken)) {
    api.add(token, amount.toString());
  }
}

async function borrowed(api) {
  const loans = await fetchAllActiveLoans();

  // Aggregate principal by loan token address
  const principalByToken = {};

  for (const loan of loans) {
    if (!loan.loanToken || !loan.currentPrincipal) continue;

    const token = loan.loanToken.toLowerCase();
    const amount = BigInt(loan.currentPrincipal);

    if (!principalByToken[token]) {
      principalByToken[token] = BigInt(0);
    }
    principalByToken[token] += amount;
  }

  // Add balances to API
  for (const [token, amount] of Object.entries(principalByToken)) {
    api.add(token, amount.toString());
  }
}

module.exports = {
  methodology: 'TVL is calculated as the total collateral locked in active loans. Borrowed represents the total outstanding loan principal.',
  base: {
    tvl,
    borrowed,
  },
};
