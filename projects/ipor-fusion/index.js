const { getConfig } = require('../helper/cache')

const IPOR_GITHUB_ADDRESSES_URL = "https://raw.githubusercontent.com/IPOR-Labs/ipor-abi/refs/heads/main/mainnet/addresses.json";

let totalVaultsProcessed = 0;

async function tvl(api) {
  const config  = await getConfig('ipor/assets', IPOR_GITHUB_ADDRESSES_URL);

  const chain = api.chain === "avax" ? 'avalanche' : api.chain;

  const chainConfig = config[chain];
  if (!chainConfig || !chainConfig.vaults) {
    console.log(`[IPOR Fusion] No vaults found for chain: ${chain}`);
    return {};
  }
  
  console.log(`[IPOR Fusion] Processing ${chainConfig.vaults.length} vaults on ${chain}:`);
  
  const calls = chainConfig.vaults.map((vault, index) => {
    console.log(`  Vault ${index + 1}/${chainConfig.vaults.length}: ${vault.PlasmaVault} (${vault.name || 'Unknown'})`);
    return vault.PlasmaVault;
  });

  totalVaultsProcessed += calls.length;
  
  console.log(`[IPOR Fusion] Total vaults processed on ${chain}: ${calls.length}`);
  console.log(`[IPOR Fusion] GRAND TOTAL vaults processed across all chains so far: ${totalVaultsProcessed}`);
  
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
