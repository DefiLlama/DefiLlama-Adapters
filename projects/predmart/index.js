// projects/predmart/index.js
const ADDRESSES = require('../helper/coreAssets.json')

const LENDING_POOL = "0xD90D012990F0245cAD29823bDF0B4C9AF207d9ee";
const USDC = ADDRESSES.polygon.USDC;

module.exports = {
  methodology: "TVL represents liquid USDC currently available in the PredMart lending pool (total deposits minus outstanding borrows). Borrowed reflects total USDC actively lent out to borrowers who posted Polymarket prediction market shares as collateral. Total lender deposits = TVL + Borrowed.",
  base: {
    tvl: () => ({}),
  },
  polygon: {
    tvl: async (api) => {
      // Liquid USDC sitting in the lending pool contract
      await api.sumTokens({
        owners: [LENDING_POOL],
        tokens: [USDC],
      });
    },
    borrowed: async (api) => {
      // Total USDC currently lent out to borrowers
      const totalBorrowed = await api.call({
        target: LENDING_POOL,
        abi: "function totalBorrowAssets() view returns (uint256)",
      });
      api.add(USDC, totalBorrowed);
    },
  },
};