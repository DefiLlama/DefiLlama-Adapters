const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// zipcoin runs its own Privacy Pools Entrypoint on Ethereum; today its only registered pool holds the ZC token.
// https://github.com/zipcoincash/zipcoin, https://www.zipcoin.cash/docs
const ENTRYPOINT = '0x7a8DA01D241C3cFcF7803cdB007EcE5663749193'
const ZC = '0x4E67DB19044549fF420860834c91b45BaD298722'
const FROM_BLOCK = 26069641 // first PoolRegistered on the Entrypoint, 2026-09-27

const poolRegisteredEvent = 'event PoolRegistered(address _pool, address _asset, uint256 _scope)'
const assetConfigAbi = 'function assetConfig(address) view returns (address pool, uint256 minimumDepositAmount, uint256 vettingFeeBPS, uint256 maxRelayFeeBPS)'

// Registered pools still configured on the Entrypoint, as [asset, pool] pairs.
async function registeredPools(api) {
  const logs = await getLogs2({ api, target: ENTRYPOINT, eventAbi: poolRegisteredEvent, fromBlock: FROM_BLOCK })
  const assets = [...new Set(logs.map(log => log._asset.toLowerCase()))]
  const configs = await api.multiCall({ abi: assetConfigAbi, calls: assets, target: ENTRYPOINT })
  return assets
    .map((asset, i) => [asset, configs[i].pool])
    .filter(([, pool]) => pool !== '0x0000000000000000000000000000000000000000')
}

// Deposits of any asset other than zipcoin's own token (none registered yet).
async function tvl(api) {
  const tokensAndOwners = (await registeredPools(api)).filter(([asset]) => asset !== ZC.toLowerCase())
  return sumTokens2({ api, tokensAndOwners })
}

// ZC deposited by users into the ZC privacy pool.
async function staking(api) {
  const tokensAndOwners = (await registeredPools(api)).filter(([asset]) => asset === ZC.toLowerCase())
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Balances of the Privacy Pool contracts registered on the zipcoin Entrypoint, read on chain. Users deposit into a pool and withdraw with a zero-knowledge proof; the pool holds the deposits and nothing is lent or rehypothecated. The ZC token is the protocol\'s own token, so ZC deposited into the ZC pool is counted under staking; pools of any other asset count as TVL.',
  start: '2026-09-27',
  ethereum: { tvl, staking },
}
