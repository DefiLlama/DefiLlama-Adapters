const { VAULTS, CHAINS } = require('./config');
const abi = require('./abi');

function calculateTvl(totalSupply, pricePerShare, decimals) {
  return (totalSupply * pricePerShare) / BigInt(10 ** decimals);
}

function getChainVaultData(chain) {
  const chainConfig = CHAINS[chain];
  if (!chainConfig) return [];

  return Object.entries(chainConfig.ofts).map(([vaultKey, oftAddress]) => {
    const vault = VAULTS[vaultKey];
    const token = chainConfig.tokens[vault.asset];
    return {
      vaultAddress: vault.address,
      oftAddress,
      assetAddress: token.address,
      decimals: token.decimals
    };
  });
}

async function getVaultRoundData(api, vaultAddresses) {
  const rounds = await api.multiCall({
    abi: abi.round,
    calls: vaultAddresses,
    permitFailure: false
  });

  const pricePerShares = await api.multiCall({
    abi: abi.roundPricePerShare,
    calls: vaultAddresses.map((target, i) => ({
      target,
      params: rounds[i] ? [BigInt(rounds[i]) - 1n] : [0n]
    })),
    permitFailure: true
  });

  return [rounds, pricePerShares];
}

module.exports = {
  calculateTvl,
  getChainVaultData,
  getVaultRoundData
};
