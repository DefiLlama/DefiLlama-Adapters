// projects/predmart/index.js
const ADDRESSES = require('../helper/coreAssets.json')

const LENDING_POOL = "0xD90D012990F0245cAD29823bDF0B4C9AF207d9ee";
const SYNTHETIC_VAULT = "0xadFe4055f7Bc231287bED441fD213565D1BC06D2";
const USDC = ADDRESSES.polygon.USDC;

module.exports = {
  methodology: "On Base, TVL is the USDC held by the PredMart synthetic vault: LP deposits, open trader margin and accrued fees. On Polygon, TVL is the liquid USDC in the PredMart lending pool (total deposits minus outstanding borrows), and Borrowed is the USDC lent out to borrowers who posted Polymarket prediction market shares as collateral.",
  base: {
    tvl: async (api) => {
      // The vault is the counterparty to every trade, so all LP capital and trader margin sit in this contract
      await api.sumTokens({
        owners: [SYNTHETIC_VAULT],
        tokens: [ADDRESSES.base.USDC],
      });
    },
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