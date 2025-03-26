const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

async function tvl(api) {
  const config  = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);
  const calls = config[api.chain].vaults.map(vault => vault.PlasmaVault);
  return api.erc4626Sum2({ calls })
}

module.exports = {
  methodology: `Counts the tokens deposited into IPOR Fusion Vaults.`,
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
};
