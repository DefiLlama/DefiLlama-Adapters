const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const VAULT_V2_VERSION = 3

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
  const VAULTS = logs.map((log) => log.entity)
  const versions = await api.multiCall({ abi: 'uint64:version', calls: VAULTS })
  const v2Vaults = VAULTS.filter((_, i) => Number(versions[i]) >= VAULT_V2_VERSION)
  const legacyVaults = VAULTS.filter((_, i) => Number(versions[i]) < VAULT_V2_VERSION)
  const collaterals = await api.multiCall({ abi: 'address:collateral', calls: legacyVaults })
  if (v2Vaults.length) await api.erc4626Sum2({ calls: v2Vaults })
  owners.push(...legacyVaults)
  tokens.push(...collaterals)
}

module.exports = {
  start: '2024-06-11',
  ethereum: { tvl },
}
