const SHARED_RESERVES = {
  ethereum: {
    strategy: '0xe0E445967256EE60111e243e0F0F94DD1D351A59',
    positionManager: '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
    lendingLens: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
    tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
  },
  sonic: {
    strategy: '0x6EC218FC45aC0C7B83D16557befABB62ed7455Ae',
    positionManager: '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
    lendingLens: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
    tokens: ['0x29219dd400f2Bf60E5a23d13Be72B486D4038894'],
  },
  bsc: {
    strategy: '0x7eF4ED045E693E10E6ed08ac71438b661f09817A',
    positionManager: '0xB36d39C72d66153B7f32E1320BEe3280657353Bd',
    lendingLens: '0xc374d2aE274f31bf53C561d0b4024136cC692f48',
    tokens: ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', '0x55d398326f99059fF775485246999027B3197955'],
  },
}

const ASSET_STATE_ABI = 'function assetState(address) view returns (uint256 cash, uint256 borrows, uint256 reserves, uint256 utilWad)'
const GET_BALANCE_ABI = 'function getBalance(address user, address asset) view returns (uint256 avail, uint256 holdBal)'

function allocateSharedCash(cash, claim) {
  cash = BigInt(cash)
  claim = BigInt(claim)
  if (cash < 0n || claim < 0n) throw new Error('Shared reserve has a negative cash or claim balance')
  const ftusd = claim < cash ? claim : cash
  return { ftusd, lend: cash - ftusd }
}

function isSharedReserve(chain, token) {
  return SHARED_RESERVES[chain]?.tokens.some(asset => asset.toLowerCase() === token.toLowerCase()) || false
}

async function getSharedAllocation(api, token, state) {
  const config = SHARED_RESERVES[api.chain]
  if (!config || !isSharedReserve(api.chain, token)) throw new Error(`Not a Flying Tulip shared reserve: ${api.chain}:${token}`)
  const [balance, reserve] = await Promise.all([
    api.call({ target: config.positionManager, abi: GET_BALANCE_ABI, params: [config.strategy, token] }),
    state === undefined
      ? api.call({ target: config.lendingLens, abi: ASSET_STATE_ABI, params: [token] })
      : state,
  ])
  const claim = BigInt(balance.avail ?? balance[0])
  const cash = BigInt(reserve.cash ?? reserve[0])
  return { ...allocateSharedCash(cash, claim), claim, cash }
}

module.exports = { SHARED_RESERVES, ASSET_STATE_ABI, GET_BALANCE_ABI, allocateSharedCash, isSharedReserve, getSharedAllocation }
