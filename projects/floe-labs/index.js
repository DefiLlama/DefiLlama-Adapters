const { post } = require('../helper/http');

const ENVIO_ENDPOINT = 'https://indexer.hyperindex.xyz/4a53586/v1/graphql';
const PAGE_SIZE = 1000;

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
  const allLoans = [];
  let offset = 0;

  while (true) {
    const response = await post(ENVIO_ENDPOINT, {
      query: LOANS_QUERY,
      variables: { limit: PAGE_SIZE, offset },
    });

    if (response?.errors) {
      throw new Error(`Error fetching Floe loans: ${response.errors.map(e => e.message).join('; ')}`);
    }

    const loans = response?.data?.Loan ?? [];
    allLoans.push(...loans);

    if (loans.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return allLoans;
}

function aggregateByToken(loans, tokenKey, amountKey) {
  const totals = {};
  for (const loan of loans) {
    if (!loan[tokenKey] || !loan[amountKey]) continue;
    const token = loan[tokenKey].toLowerCase();
    totals[token] = (totals[token] ?? BigInt(0)) + BigInt(loan[amountKey]);
  }
  return totals;
}

async function tvl(api) {
  const loans = await fetchAllActiveLoans();
  const collateralByToken = aggregateByToken(loans, 'collateralToken', 'collateralAmount');
  for (const [token, amount] of Object.entries(collateralByToken)) {
    api.add(token, amount.toString());
  }
}

async function borrowed(api) {
  const loans = await fetchAllActiveLoans();
  const principalByToken = aggregateByToken(loans, 'loanToken', 'currentPrincipal');
  for (const [token, amount] of Object.entries(principalByToken)) {
    api.add(token, amount.toString());
  }
}

module.exports = {
  methodology: 'TVL is calculated as the total collateral locked in active loans. Borrowed represents the total outstanding loan principal.',
  base: { tvl, borrowed },
};
