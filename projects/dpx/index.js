// DeFiLlama TVL Adapter — DPX Settlement Protocol
// Chain: Base mainnet (chainId 8453)
// Category: Payments / Stablecoin Infrastructure
// Docs: https://docs.untitledfinancial.com
//
// TVL methodology:
//   USDC and EURC held in DPX settlement contracts represent capital in-transit
//   and protocol reserves: settlements in-flight (SettlementRouter), basket
//   reserves (BasketPegManager), ESG impact pool (ESGRedistribution).
//   DPX token holdings in governance/policy contracts are included separately.

// Base mainnet stablecoins
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const EURC = '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42';

// DPX protocol token
const DPX_TOKEN = '0x7A62dEcF6936675480F0991A2EF4a0d6f1023891';

// DPX settlement contracts on Base mainnet
const SETTLEMENT_ROUTER  = '0x7d2b0Cea5A2d19369548F59C6B8EEe9Fe3495c97';
const BASKET_PEG_MANAGER = '0xB5071fA48B92e3652701053eEd8826ab94014AaA';
const POLICY_MANAGER     = '0x741f3179786d9f72e134BdC699D6604eaB250D6E';
const ESG_REDISTRIBUTION = '0x4F3741252847E4F07730c4CEC3018b201Ac6ce87';

const OWNERS = [
  SETTLEMENT_ROUTER,
  BASKET_PEG_MANAGER,
  POLICY_MANAGER,
  ESG_REDISTRIBUTION,
];

async function tvl(api) {
  await api.sumTokens({
    tokens: [USDC, EURC, DPX_TOKEN],
    owners: OWNERS,
  });
}

module.exports = {
  methodology:
    'USDC and EURC held in the DPX SettlementRouter (in-flight settlements), ' +
    'BasketPegManager (basket reserves), ESGRedistribution (ESG impact pool), and ' +
    'PolicyManager (governance) contracts on Base mainnet. ' +
    'DPX protocol token holdings included.',
  base: {
    tvl,
  },
};
