const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const BLACKLIST = new Set([
  '0x602c7941c6d3dc1c773591859948ed819cf6d151',
  '0x5858B8Ecff0D1f37f6D02cFbc3ea8eb934eA82AC',
].map(a => a.toLowerCase()))

async function tvl(api) {
  const owners = []
  const tokens = []
  await vaultsTvl(api, tokens, owners)
  await defaultCollateralsTvl(api, tokens, owners)
  return sumTokens2({api, tokensAndOwners2: [tokens, owners], permitFailure: true, })
}

async function defaultCollateralsTvl(api, tokens, owners) {
  const logs = await getLogs2({
    api,
    factory: '0x1BC8FCFbE6Aa17e4A7610F51B888f34583D202Ec',
    eventAbi: 'event AddEntity(address indexed entity)',
    fromBlock: 
    20011312,
  })
  const COLLATERALS = logs.map((log) => log.entity)
  const _tokens = await api.multiCall({ abi: 'address:asset', calls: COLLATERALS })
  owners.push(...COLLATERALS)
  tokens.push(..._tokens)
}

async function vaultsTvl(api, tokens, owners) {
  const logs = await getLogs2({
    api,
    factory: '0xAEb6bdd95c502390db8f52c8909F703E9Af6a346',
    eventAbi: 'event AddEntity(address indexed entity)',
    fromBlock: 21580035,
  })
  const VAULTS = logs.map((log) => log.entity).filter(e => !BLACKLIST.has(e.toLowerCase()))
  const _tokens = await api.multiCall({ abi: 'address:collateral', calls: VAULTS })
  owners.push(...VAULTS)
  tokens.push(..._tokens)
}

module.exports = {
  start: '2024-06-11',
  ethereum: { tvl },
}
