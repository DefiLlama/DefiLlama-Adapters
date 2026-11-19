const ethers = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// SHROOM is a memecoin on Robinhood Chain. Its treasury is held by two team wallets as Uniswap V4
// positions pairing SHROOM against MU, USDG, PONS and tokenized equities, plus loose reserves in the
// same wallets. The Pons-locked genesis SHROOM/MU position is not counted: the team does not own it.
const SHROOM = '0xab093def657f15df31b33922a95e047add645b29'
const POSITION_MANAGER = '0x58daec3116aae6d93017baaea7749052e8a04fa7' // Uniswap V4 PositionManager
const OWNERS = [
  '0xAd5Bc794c2829E671a7F5c135cA85Ff97a62638b',
  '0xFca196eAcf630F67b505023C4f2cf7Eb36da2f9F',
]
const FROM_BLOCK = 52657452 // genesis SHROOM/MU pool initialize; no SHROOM position predates it

const TRANSFER_ABI = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const POOL_INFO_ABI = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address token0, address token1, uint24 fee, int24 tickSpacing, address hook) poolKey, uint256 info)'

// Team positions: every PositionManager NFT ever transferred to a team wallet, kept if a team wallet
// still owns it at api.block and the pool has SHROOM on one side.
async function getPositionIds(api) {
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, eventAbi: TRANSFER_ABI, fromBlock: FROM_BLOCK, extraKey: 'positions-in',
    topics: [ethers.id('Transfer(address,address,uint256)'), null, OWNERS.map((i) => ethers.zeroPadValue(i.toLowerCase(), 32))],
  })
  const ids = [...new Set(transfers.map((i) => i.tokenId.toString()))]
  if (!ids.length) return []

  const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', target: POSITION_MANAGER, calls: ids, permitFailure: true })
  const pools = await api.multiCall({ abi: POOL_INFO_ABI, target: POSITION_MANAGER, calls: ids, permitFailure: true })
  const ownerSet = new Set(OWNERS.map((i) => i.toLowerCase()))

  return ids.filter((_, i) => {
    if (!owners[i] || !ownerSet.has(owners[i].toLowerCase())) return false
    const poolKey = pools[i]?.poolKey
    if (!poolKey) return false
    return [poolKey.token0, poolKey.token1].some((token) => token.toLowerCase() === SHROOM)
  })
}

async function tvl(api) {
  const positionIds = await getPositionIds(api)
  await sumTokens2({ api, owners: OWNERS, fetchBlockscoutTokens: true, blacklistedTokens: [SHROOM] })
  if (positionIds.length)
    await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds, blacklistedTokens: [SHROOM] } })
  return api.getBalances()
}

async function ownTokens(api) {
  const positionIds = await getPositionIds(api)
  await sumTokens2({ api, owners: OWNERS, tokens: [SHROOM] })
  if (positionIds.length)
    await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds, whitelistedTokens: [SHROOM] } })
  return api.getBalances()
}

module.exports = {
  robinhood: { tvl, ownTokens },
}
