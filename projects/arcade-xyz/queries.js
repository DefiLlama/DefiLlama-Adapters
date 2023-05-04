const { gql, request } = require('graphql-request');
const { SUBGRAPH_URL } = require('./constants');

// Max recursion depth
const MAX_DEPTH = 100;

// Fetch from the SG until there are no results
async function fetchPaginated(query, key = '', first = 100, block, cursor = 0, depth = 0) {
  // Defensive so we don't give DeFiLlama engineers a headache
  if (cursor < 0 || depth >= MAX_DEPTH) {
    return [];
  }

  let q  = query.replace('<FIRST>', first);
  q = q.replace('<CURSOR>', cursor);
  q = q.replace('<BLOCK>', ''+block);

  const res = await request(SUBGRAPH_URL, q);

  // Check if the HTTP request was successful but the Subgraph returned an error
  if (res.errors && res.errors.length > 0) {
    const { errors } = res;

    let message;

    // It should always be an array, but lets be safe
    if (Array.isArray(errors)) {
      message = errors.join('\n');
    } else if (typeof errors === 'string') {
      message = errors;
    } else {
      message = 'Unknown error fetching Subgraph data for arcade-xyz project';
    }

    throw new Error(message);
  }

  const results = res[key];

  // There could be more results if the length matches the query limit
  if (Array.isArray(results) && results.length >= first) {
    // Get the cursor for the last item
    const lastCursor = results[first - 1].cursor ?? -1;

    // Fetch more results starting from the last cursor + 1, inclusive
    const moreResults = await fetchPaginated(query, key, first, block, lastCursor + 1, depth + 1);
    return results.concat(moreResults);
  }

  return results;
}

// Fetches vaults that have tokens deposited and are available to be used on the platform.
// Broken vaults (withdrawEnabled) cannot be used in a loan.
const fetchVaultQuery = gql`
  query {
    arcadeVaults(first: <FIRST>, block: { number: <BLOCK> }, where:{hasCollateral:true, withdrawEnabled:false, cursor_gte: <CURSOR>}) {
      address
      collateral {
        collectionAddress
        amount
      }
    }
  }
`;

// Helper function to fetch the first 1000 active
async function fetchVaults(block) {
  return fetchPaginated(fetchVaultQuery, 'arcadeVaults', 1000, block);
}

// Fetches active loans
const fetchLoansQuery = gql`
  query {
    arcadeLoans(first: <FIRST>, block: { number: <BLOCK> }, where :{ state: "Active", cursor_gte: <CURSOR> }) {
      payableCurrency
      principal
    }
  }
`

// Helper function to fetch the first 1000 active loans
async function fetchLoans(block) {
  return fetchPaginated(fetchLoansQuery, 'arcadeLoans', 1000, block);
}

module.exports = {
  fetchLoans,
  fetchPaginated,
  fetchVaults,
}
