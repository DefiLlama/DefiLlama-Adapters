const { getLogs2 } = require('../helper/cache/getLogs')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function tvl(api) {
  let [tokens1, bals1] = await defaultCollateralsTvl(api)
  let [tokens2, bals2] = await vaultsTvl(api)
  const tokens_balances = {}
  tokens1.forEach((token, i) => {
    tokens_balances[token] = (tokens_balances[token] || 0n) + bals1[i]
  })
  tokens2.forEach((token, i) => {
    tokens_balances[token] = (tokens_balances[token] || 0n) + bals2[i]
  })

  const tokens = Object.keys(tokens_balances)
  const bals = Object.values(tokens_balances)
  api.addTokens(tokens, bals)

  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true })
}

async function defaultCollateralsTvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x1BC8FCFbE6Aa17e4A7610F51B888f34583D202Ec',
    eventAbi: 'event AddEntity(address indexed entity)',
    fromBlock: 
    20011312,
  })
  const COLLATERALS = logs.map((log) => log.entity)
  const [tokens, bals] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: COLLATERALS }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: COLLATERALS }),
  ])
  return [tokens, bals.map(bal => BigInt(bal))]
}

async function vaultsTvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0xAEb6bdd95c502390db8f52c8909F703E9Af6a346',
    eventAbi: 'event AddEntity(address indexed entity)',
    fromBlock: 21580035,
  })
  const VAULTS = logs.map((log) => log.entity)
  const [tokens, bals] = await Promise.all([
    api.multiCall({ abi: 'address:collateral', calls: VAULTS }),
    api.multiCall({ abi: 'uint256:activeStake', calls: VAULTS }),
  ])
  return [tokens, bals.map(bal => BigInt(bal))]
}

module.exports = {
  misrepresentedTokens: true,
  start: '2024-06-11',
  ethereum: {
    tvl,
  },
}
