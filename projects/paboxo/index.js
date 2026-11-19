const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Paboxo (paboxo.xyz) is a lending market for tokenized stocks on Robinhood Chain: users post a stock token
// (or WETH) as collateral and borrow USDG from it.
//
// Lenders deposit USDG into one ERC4626 earn vault, which is the only supplier of every market. The vault keeps
// the USDG idle and a market pulls it only when a borrow needs it, so un-borrowed liquidity sits in the vault and
// a little booked cash (plus reserves) sits in each market's LendingPool. Every borrower gets a Position contract
// per market, created by the LendingPool and announced through the PaboxoEmitter; the Position holds the
// collateral.
//
// The LP markets take Uniswap v3/v4 LP NFTs as collateral instead. Their Positions are announced by a second
// PaboxoEmitter and hold the NFTs themselves; each Position lists what it holds through nfts().
//
// tvl      = USDG held by the vault and by every market it supplies (vault withdraw/supply queues)
//          + collateral held by every Position contract (PositionCreated logs)
//          + the tokens inside every LP NFT held by an LP market Position (unwrapped to its two tokens)
// borrowed = totalBorrowAssets of every market router the vault supplies
const VAULT = '0xaF5aE508b2B57587c6cB9704950fa86c4090c634' // Paboxo USDG earn vault
const EMITTER = '0xe3463043C6dFda7444E9C133C368740b8C4057d9' // PaboxoEmitter of the stock/WETH markets
const FROM_BLOCK = 86793701 // core deployment block
const LP_EMITTER = '0x839CEa352A21791Df87b32bc510deA8AD6FE13f7' // PaboxoEmitter of the LP markets
const LP_FROM_BLOCK = 105975390 // LP deployment block
const UNI_V3_NFT = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3' // Uniswap v3 NonfungiblePositionManager
const UNI_V4_NFT = '0x58daec3116aae6D93017bAAea7749052E8a04fA7' // Uniswap v4 PositionManager

const abi = {
  asset: 'function asset() view returns (address)',
  withdrawQueueLength: 'function withdrawQueueLength() view returns (uint256)',
  withdrawQueue: 'function withdrawQueue(uint256) view returns (address)',
  supplyQueueLength: 'function supplyQueueLength() view returns (uint256)',
  supplyQueue: 'function supplyQueue(uint256) view returns (address)',
  markets: 'function markets(address) view returns (address router, uint256 cap, bool enabled)',
  router: 'function router() view returns (address)',
  collateralToken: 'function collateralToken() view returns (address)',
  borrowToken: 'function borrowToken() view returns (address)',
  totalBorrowAssets: 'function totalBorrowAssets() view returns (uint256)',
  positionCreated: 'event PositionCreated(address lendingPool, address lendingPoolRouter, address user, address position)',
  nfts: 'function nfts() view returns (address[] positionManagers, uint256[] tokenIds)',
}

async function getMarkets(api) {
  const [withdrawQueue, supplyQueue] = await Promise.all([
    api.fetchList({ lengthAbi: abi.withdrawQueueLength, itemAbi: abi.withdrawQueue, target: VAULT }),
    api.fetchList({ lengthAbi: abi.supplyQueueLength, itemAbi: abi.supplyQueue, target: VAULT }),
  ])
  const pools = [...new Set([...withdrawQueue, ...supplyQueue].map((p) => p.toLowerCase()))]
  const routers = (await api.multiCall({ abi: abi.markets, target: VAULT, calls: pools })).map((m) => m.router)
  return { pools, routers }
}

async function tvl(api) {
  const usdg = await api.call({ abi: abi.asset, target: VAULT })
  const { pools } = await getMarkets(api)
  const tokensAndOwners = [VAULT, ...pools].map((owner) => [usdg, owner])

  const logs = await getLogs2({ api, target: EMITTER, eventAbi: abi.positionCreated, fromBlock: FROM_BLOCK })
  if (logs.length) {
    const routers = [...new Set(logs.map((l) => l.lendingPoolRouter.toLowerCase()))]
    const collaterals = await api.multiCall({ abi: abi.collateralToken, calls: routers })
    const collateralOf = Object.fromEntries(routers.map((r, i) => [r, collaterals[i]]))
    logs.forEach((l) => tokensAndOwners.push([collateralOf[l.lendingPoolRouter.toLowerCase()], l.position]))
  }

  await sumTokens2({ api, tokensAndOwners })
  await addLpCollateral(api)
  return api.getBalances()
}

// The LP NFTs every LP market Position holds, unwrapped into their two tokens at the pool's current price.
async function addLpCollateral(api) {
  const logs = await getLogs2({ api, target: LP_EMITTER, eventAbi: abi.positionCreated, fromBlock: LP_FROM_BLOCK })
  const positions = [...new Set(logs.map((l) => l.position.toLowerCase()))]
  if (!positions.length) return
  const held = await api.multiCall({ abi: abi.nfts, calls: positions })

  const v3Owners = new Set()
  const v4Ids = []
  held.forEach(({ positionManagers, tokenIds }, i) => {
    positionManagers.forEach((pm, j) => {
      if (pm.toLowerCase() === UNI_V3_NFT.toLowerCase()) v3Owners.add(positions[i])
      else if (pm.toLowerCase() === UNI_V4_NFT.toLowerCase()) v4Ids.push(tokenIds[j])
      else throw new Error(`unknown position manager ${pm} in Paboxo LP position ${positions[i]}`)
    })
  })

  if (v3Owners.size)
    await sumTokens2({ api, uniV3nftsAndOwners: [...v3Owners].map((owner) => [UNI_V3_NFT, owner]) })
  if (v4Ids.length)
    await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { nftAddress: UNI_V4_NFT, positionIds: v4Ids } })
}

async function borrowed(api) {
  const { routers } = await getMarkets(api)
  const [tokens, debts] = await Promise.all([
    api.multiCall({ abi: abi.borrowToken, calls: routers }),
    api.multiCall({ abi: abi.totalBorrowAssets, calls: routers }),
  ])
  api.add(tokens, debts)
}

module.exports = {
  doublecounted: true, // LP collateral sits in Uniswap V3/V4 pools
  methodology:
    'TVL is the USDG held by the Paboxo earn vault and by the lending markets it supplies, plus the stock tokens and WETH that borrowers hold as collateral in their Position contracts (found through PositionCreated events), plus the tokens inside the Uniswap v3/v4 LP NFTs held as collateral by the LP market Positions. Borrowed is the outstanding USDG debt of every market.',
  start: '2026-10-12',
  robinhood: { tvl, borrowed },
}
