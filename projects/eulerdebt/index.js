const { sumTokens2 } = require('../helper/unwrapLPs');

// HybridDebtMarket contract address (same on all chains via CREATE2)
const MARKETPLACE_CONTRACT = '0x3333cb20c3C7491CA9fa7281a8B418512d7a9a22';

async function tvl(api) {
  // Use sumTokens2 with resolveLP to automatically detect and sum all ERC20 token balances
  // held by the marketplace contract
  return sumTokens2({
    api,
    owner: MARKETPLACE_CONTRACT,
    resolveLP: true,
  });
}

module.exports = {
  methodology: "Counts all debt tokens and payment tokens locked in active buy and sell orders on the HybridDebtMarket orderbook",
  ethereum: { tvl },
  avax: { tvl },
  plasma: { tvl },
  bsc: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  linea: { tvl },
  sonic: { tvl },
  unichain: { tvl },
  swellchain: { tvl },
  tac: { tvl },
  bob: { tvl },
  berachain: { tvl },
};
