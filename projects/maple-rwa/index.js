/**
 * Maple Finance TVL & Borrowed Amounts Adapter
 * 
 * This adapter fetches data from Maple Finance's GraphQL API to calculate:
 * - Total Value Locked (TVL): Sum of all collateral values
 * - Total Borrowed: Sum of all loan values
 * 
 * References:
 * - Maple Finance API Docs: https://studio.apollographql.com/public/maple-api/variant/mainnet/home
 * 
 */

const axios = require('axios');

const ENDPOINT = 'https://api.maple.finance/v2/graphql';
const LOANS_QUERY = `
    query getNativeLoansSnapshot($timestamp: Float!) {
      nativeLoansSnapshot(timestamp: $timestamp) {
        loanId
        loanAsset
        loanAmount
        collateralAsset
        collateralAmount
        collateralPrice
        collateralValueUsd
        loanAssetPrice
        loanValueUsd
      }
    }
  `;

/**
 * Fetches raw loan data from Maple Finance's GraphQL API
 * @param {number} timestamp Unix timestamp in seconds
 * @returns {Promise<Array<{loanId: string, loanAsset: string, loanAmount: string, collateralAsset: string, collateralAmount: string, collateralPrice: string, collateralValueUsd: string, loanAssetPrice: string, loanValueUsd: string}>>} Array of loan objects
 */
const fetchLoans = async (timestamp) => {
  const timestampMs = timestamp * 1000;

  const payload = {
    query: LOANS_QUERY,
    variables: { timestamp: timestampMs },
    headers: { "Content-Type": "application/json" }
  };

  const response = await axios.post(ENDPOINT, payload);

  return response.data.data.nativeLoansSnapshot;
}

/**
 * Calculates total value based on specified property and returns API response format
 * @param {number} timestamp Unix timestamp in seconds
 * @param {string} propertyName Property to sum ('loanValueUsd' or 'collateralValueUsd')
 * @returns {Promise<number>} Total value in USD
 */
const getTotal = async (api, propertyName) => {
  const timestamp = api.timestamp
  const loans = await fetchLoans(timestamp);
  const total = loans.reduce((sum, loan) => sum + Number(loan[propertyName]), 0);
  api.addUSDValue(total)
}

module.exports = {
  ethereum: {
    tvl: async (api) => await getTotal(api, 'collateralValueUsd'),
    borrowed: async (api) => await getTotal(api, 'loanValueUsd'),
  },
};
