// DeFiLlama TVL Adapter — DPX Settlement Protocol
// Chain: Base mainnet (chainId 8453)
// Category: Payments / Stablecoin Infrastructure
//
// TVL methodology:
//   DPX tokens held in the SettlementRouter, BasketPegManager, and PolicyManager
//   represent protocol-controlled value — settlements in-flight and basket reserves.

const DPX_TOKEN         = '0x7A62dEcF6936675480F0991A2EF4a0d6f1023891';
const SETTLEMENT_ROUTER = '0x7d2b0Cea5A2d19369548F59C6B8EEe9Fe3495c97';
const BASKET_PEG_MANAGER= '0xB5071fA48B92e3652701053eEd8826ab94014AaA';
const POLICY_MANAGER    = '0x741f3179786d9f72e134BdC699D6604eaB250D6E';
const ESG_REDISTRIBUTION= '0x4F3741252847E4F07730c4CEC3018b201Ac6ce87';

async function tvl(api) {
  await api.sumTokens({
    tokens: [DPX_TOKEN],
    owners: [
      SETTLEMENT_ROUTER,
      BASKET_PEG_MANAGER,
      POLICY_MANAGER,
      ESG_REDISTRIBUTION,
    ],
  });
}

module.exports = {
  methodology: 'DPX tokens held in the SettlementRouter (in-flight settlements), BasketPegManager (basket reserves), PolicyManager (governance), and ESGRedistribution (impact pool) contracts on Base mainnet.',
  base: {
    tvl,
  },
};
