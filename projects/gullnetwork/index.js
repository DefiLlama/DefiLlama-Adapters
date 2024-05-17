
const FACTORY_SINGLETON_ADDR = '0xFc6387f581d2A827F183A9ea68f07063F99744dE';

const tvl = async (api) => {
  const vaults = await api.fetchList({ lengthAbi: 'length', itemAbi: 'stakingVaults', target: FACTORY_SINGLETON_ADDR })
  const stakedTokens = await api.multiCall({ calls: vaults, abi: 'address:stakedToken', })
  return api.sumTokens({ tokensAndOwners2: [stakedTokens, vaults] });
}

module.exports = {
  start: 1710844331, // May-17-2024 12:45:31 PM +UTC
  methodology: 'GullNetwork TVL including total values of assets staked in our staking vaults.',
}

const config = {
  ethereum: {},
  bsc: {},
  manta: {},
  base: {},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})