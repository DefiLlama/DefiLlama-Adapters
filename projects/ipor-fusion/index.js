const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

async function tvl(api) {
  const config  = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);
  const chainConfig = config[api.chain];
  if (!chainConfig || !chainConfig.vaults) {
    return {};
  }
  const calls = chainConfig.vaults.map(vault => vault.PlasmaVault);
  return api.erc4626Sum2({ calls })
}

module.exports = {
  methodology: `Counts the tokens deposited into IPOR Fusion Vaults.`,
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  unichain: { tvl },
  ink: { tvl },
  tac: { tvl },
  plasma: { tvl },
  avax: { tvl }
};
