const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const { unwrapUniswapV4NFTs, sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

// MING on BSC: https://ming.family
const TREASURY = '0x427992090a24122Df5b77b5cC259804af7Ad8844' // BNB waiting for MING buybacks and staker gold
const GOLD_RESERVE = '0x2dfadF788a3eF31F6F3eAc85b2ac0339FdD535be' // the protocol's gold reserve, published at ming.family/reserve
const MING = '0x35771285a60B2aA5d4f5AcB917cc019Ee1DF7777'
const XAUT = '0x21cAef8A43163Eea865baeE23b9C2E327696A3bf'
const UNISWAP_V4_POSITION_MANAGER = '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b'

// only the reserve's position ids come from MING's API, every amount is read on chain
async function reservePositions() {
  return getConfig('ming/reserve-positions', undefined, {
    fetcher: async () => {
      const { positions } = await get('https://core.ming.family/v1/reserve')
      if (!Array.isArray(positions) || !positions.length) throw new Error('ming: empty reserve position list')
      return positions
    },
  })
}

// MING's own token is left out of every position
async function tvl(api) {
  await api.sumTokens({ owners: [TREASURY], tokens: [nullAddress, ADDRESSES.bsc.WBNB, XAUT] })
  await api.sumTokens({ owners: [GOLD_RESERVE], tokens: [XAUT] })

  const positions = await reservePositions()
  if (!Array.isArray(positions)) throw new Error('ming: no reserve position list (api down, nothing cached)')
  if (positions.some(p => p.venue !== 'uniswap-v4' || p.nft?.id == null)) throw new Error('ming: reserve position on a venue this adapter does not unwrap')
  const ids = positions.map(p => String(p.nft.id))
  // ownerOf reverts for a burned position
  const owners = await api.multiCall({ target: UNISWAP_V4_POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const held = ids.filter((_, i) => owners[i]?.toLowerCase() === GOLD_RESERVE.toLowerCase())
  if (held.length) await unwrapUniswapV4NFTs({ api, balances: api.getBalances(), owner: GOLD_RESERVE, nftAddress: UNISWAP_V4_POSITION_MANAGER, blacklistedTokens: [MING], uniV4ExtraConfig: { positionIds: held } })

  // Uniswap V3 and PancakeSwap V3 positions
  return sumTokens2({ api, owner: GOLD_RESERVE, resolveUniV3: true, blacklistedTokens: [MING] })
}

module.exports = {
  methodology: "BNB and gold in MING's Treasury contract, plus the gold (XAUt) in the protocol's reserve wallet and its liquidity positions. MING itself is not counted.",
  bsc: { tvl },
}
