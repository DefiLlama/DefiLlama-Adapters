const { getConfig } = require('../helper/cache')
const { getUniqueAddresses } = require('../helper/utils')

async function tvl(api) {
  const { vaults = [] } = await getConfig('ipor/fusion-vaults', 'https://api.ipor.io/v2/fusion/vaults')

  // dedupe by address - the API can list the same vault twice
  const calls = getUniqueAddresses(vaults.filter(v => v.chainId === api.chainId).map(v => v.address))

  // permitFailure so vaults not yet deployed at a historical block are skipped instead of throwing
  return api.erc4626Sum2({ calls, permitFailure: true })
}

module.exports = {
  methodology: `Counts the tokens deposited into Fusion Vaults.`,
  hallmarks: [
    ["2024-09-30", "Fusion Vaults Rollout"],
    ["2025-10-24", "Fusion Points Program Launch"],
    ["2025-11-04", "xUSD Depeg DeFi Contagion"]
  ],
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  unichain: { tvl },
  ink: { tvl },
  tac: { tvl },
  plasma: { tvl },
  avax: { tvl },
  katana: { tvl },
  hyperliquid: { tvl },
  robinhood: { tvl },
  monad: { tvl },
  flare: { tvl }
};

