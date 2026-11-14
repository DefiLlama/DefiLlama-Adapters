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
// tvl      = USDG held by the vault and by every market it supplies (vault withdraw/supply queues)
//          + collateral held by every Position contract (PositionCreated logs)
// borrowed = totalBorrowAssets of every market router the vault supplies
//
// Not counted yet: Uniswap v3/v4 LP NFTs posted as collateral in the LP markets (their Positions are announced
// by a separate emitter). Their USDG cash and debt are counted, since the same vault supplies them.
const VAULT = '0xaF5aE508b2B57587c6cB9704950fa86c4090c634' // Paboxo USDG earn vault
const EMITTER = '0xe3463043C6dFda7444E9C133C368740b8C4057d9' // PaboxoEmitter of the stock/WETH markets
const FROM_BLOCK = 86793701 // core deployment block

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

  return sumTokens2({ api, tokensAndOwners })
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
  methodology:
    'TVL is the USDG held by the Paboxo earn vault and by the lending markets it supplies, plus the stock tokens and WETH that borrowers hold as collateral in their Position contracts (found through PositionCreated events). Borrowed is the outstanding USDG debt of every market. Uniswap LP NFTs posted as collateral in the LP markets are not counted yet.',
  start: '2026-10-12',
  robinhood: { tvl, borrowed },
}
