const { sumTokens2 } = require('../../helper/unwrapLPs')
const { getLogs2 } = require('../../helper/cache/getLogs')
const { liveAt } = require('../helpers')

const ROBINHOOD_REGISTRY = '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146'
const ROBINHOOD_FROM_BLOCK = 55893170
const ROBINHOOD_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const ARBITRUM_REGISTRY = '0xFB2eA53b16C07011d4390A2e449385180A54eD5e'
const ARBITRUM_FROM_BLOCK = 505000000
const ARBITRUM_NFPM = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

async function registryTvl(api, registry, nftAddress, fromBlock) {
  // all() is the live listing; a delisted vault keeps its position NFT, so
  // union it with every VaultListed event. Each vault owns one position NFT
  // (both legs counted) plus idle balances held between compounds.
  const [listed, logs] = await Promise.all([
    api.call({ abi: 'address[]:all', target: registry }),
    getLogs2({ api, target: registry, fromBlock, eventAbi: 'event VaultListed(address indexed vault, address indexed pool, uint8 mode)' }),
  ])
  const vaults = [...new Set([...listed, ...logs.map((log) => log.vault)].map((vault) => vault.toLowerCase()))]
  if (!vaults.length) return
  await sumTokens2({ api, owners: vaults, resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
  ])
  await sumTokens2({ api, ownerTokens: vaults.map((vault, i) => [[token0s[i], token1s[i]], vault]) })
}

async function tvl(api) {
  if (liveAt(api, ROBINHOOD_FROM_BLOCK)) await registryTvl(api, ROBINHOOD_REGISTRY, ROBINHOOD_NFPM, ROBINHOOD_FROM_BLOCK)
}

async function arbitrumTvl(api) {
  await registryTvl(api, ARBITRUM_REGISTRY, ARBITRUM_NFPM, ARBITRUM_FROM_BLOCK)
}

module.exports = { arbitrumTvl, tvl }
