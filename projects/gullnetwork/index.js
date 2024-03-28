
const FACTORY_SINGLETON_ADDR = '0xFc6387f581d2A827F183A9ea68f07063F99744dE';

const tvl = async (api) => {
  // 1. find the number of vaults
  // handled error when the contract doesn't have not been deployed by that block
  let len = 0;
  try {
    len = await api.call({ 
      abi: 'uint256:length',
      target: FACTORY_SINGLETON_ADDR,
    });
    
  } catch (error) {
    return 0;
  }

  // 2. find the vault addresses
  const vaults = await api.multiCall({
    calls: Array.from({ length: len }, (_, i) => ({
      target: FACTORY_SINGLETON_ADDR,
      params: [i],
    })),
    abi: 'function stakingVaults(uint256) external view returns (address)',
    permitFailure: true,
  });

  // 3. find the staked token addr of each vaults
  const stakedTokens = await api.multiCall({
    calls: vaults,
    abi: 'address:stakedToken',
    permitFailure: true,
  });

  await api.sumTokens({ tokensAndOwners2: [stakedTokens, vaults] });
  return api.getBalances();
}

module.exports = {
  start: 1710844331, // May-17-2024 12:45:31 PM +UTC
  methodology: 'GullNetwork TVL including total values of assets staked in our staking vaults.',
  ethereum: {
    tvl,
  },
  bsc: {
    tvl,
  },
  manta: {
    tvl,
  },
  base: {
    tvl,
  },
}