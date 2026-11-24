const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getVerifiedProject } = require('../helper/verified');

const LENDING = '0xde6e08ac208088cc62812ba30608d852c6b0ecbc'; // 3Jane lending contract (Morpho Blue fork)
const USD3 = '0x056B269Eb1f75477a8666ae8C7fE01b64dD55eCc'; // USD3 vault
const WA_ETH_USDC = '0xd4fa2d31b7968e448877f69a96de69f5de8cd23e'; // Wrapped Aave Ethereum USDC

module.exports = {
  timetravel: false,
  misrepresentedTokens: true, // off-chain assets
  methodology: "TVL is 3Jane's bank cash, read hourly from the bank api, plus idle USDC and waEthUSDC in the USD3 vault and lending contract. Borrowed is the outstanding principal of off-chain loans, counted from loan originators' reports.",
  hallmarks: [
    ['2026-11-24', 'Methodology change: counts off-chain loans and bank cash from verified reports'],
  ],
  ethereum: {
    tvl: async (api) => {
      const data = await getVerifiedProject('3jane');
      const now = Math.floor(Date.now() / 1000);
      // balances: category -> bank -> { balanceUsd, timestamp (unix seconds) }
      for (const [category, banks] of Object.entries(data.balances)) {
        for (const [bank, item] of Object.entries(banks)) {
          const age = now - item.timestamp;
          // written as !(age <= max) so a missing timestamp (NaN age) also fails
          if (!(age <= 3 * 3600)) throw new Error(`3jane balance ${category}/${bank} is stale: timestamp ${item.timestamp}, ${(age / 3600).toFixed(1)}h old, max 3h`);

          api.addUSDValue(item.balanceUsd);
        }
      }

      // on-chain: idle USDC and waEthUSDC not yet sent to the bank
      // on-chain borrowed is not counted, it is the same money as the off-chain loans and bank cash
      await sumTokens2({ api, tokens: [ADDRESSES.ethereum.USDC, WA_ETH_USDC], owners: [LENDING, USD3] });
    },
    borrowed: async (api) => {
      const data = await getVerifiedProject('3jane');
      for (const item of Object.values(data.loans)) {
        for (const value of Object.values(item)) {
         api.addUSDValue(value.principalUsd);
        }
      }
    }
  }
};

