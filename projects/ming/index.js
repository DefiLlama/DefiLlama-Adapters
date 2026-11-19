const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/tokenMapping')
const { staking } = require('../helper/unknownTokens')

// MING on BSC: https://ming.family
const GRID_MINING = '0x50518bfb43d526F0342459cF92CB0AeC25D38Fd9'
const AUTO_MINER = '0x0a570E5Ac33118f36c9B0AC7bFFCAB6bde57c308'
const STAKING = '0x9515533189751237D92A77068a61D1D100ABd966'
const ACCOUNT_FACTORY = '0xcA03db2bACd90C6B35494d3b942C8FBF1634bFbA' // creates players' Loop accounts
const MING = '0x35771285a60B2aA5d4f5AcB917cc019Ee1DF7777'
const MING_WBNB = '0x14BaCB4C10578c6D561b22244b3f5bF0dF1764c8' // PancakeSwap V2 pair, prices MING
const XAUT = '0x21cAef8A43163Eea865baeE23b9C2E327696A3bf'
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

async function tvl(api) {
  const count = await api.call({ target: ACCOUNT_FACTORY, abi: 'uint256:totalAccounts' })
  const accounts = await api.multiCall({ target: ACCOUNT_FACTORY, abi: 'function accountAt(uint256) view returns (address)', calls: [...Array(Number(count)).keys()] })

  // GridMining and the AutoMiner also hold BNB that belongs to the protocol: the float that pays for round
  // triggers and fees not yet sent on. Only the rest, the players' BNB, is counted.
  const [gridBnb, autoBnb] = await api.multiCall({ target: MULTICALL3, abi: 'function getEthBalance(address) view returns (uint256)', calls: [GRID_MINING, AUTO_MINER] })
  const triggerFloat = await api.call({ target: GRID_MINING, abi: 'uint256:triggerFloat' })
  const feeOwed = await api.call({ target: GRID_MINING, abi: 'uint256:feeOwed' })
  const treasuryOwed = await api.call({ target: GRID_MINING, abi: 'uint256:treasuryOwed' })
  const triggerReserve = await api.call({ target: AUTO_MINER, abi: 'uint256:triggerReserve' })
  const autoMinerFees = await api.call({ target: AUTO_MINER, abi: 'uint256:accumulatedFees' })
  const nonNegative = (v) => (v > 0n ? v : 0n).toString()
  api.add(nullAddress, nonNegative(BigInt(gridBnb) - BigInt(triggerFloat) - BigInt(feeOwed) - BigInt(treasuryOwed)))
  api.add(nullAddress, nonNegative(BigInt(autoBnb) - BigInt(triggerReserve) - BigInt(autoMinerFees)))

  await api.sumTokens({ owners: accounts, tokens: [nullAddress] })
  // WBNB waiting to become Goldpot gold, the Goldpot's and players' XAUt, and the XAUt owed to stakers
  return api.sumTokens({ owners: [GRID_MINING, STAKING, ...accounts], tokens: [ADDRESSES.bsc.WBNB, XAUT] })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL: BNB and gold (XAUt) held for players: the current round, unclaimed payouts, AutoMiner and Loop deposits, the Goldpot and gold owed to stakers. Staking: MING staked, plus mined MING held for players until they claim it, priced from the MING/WBNB PancakeSwap pool.",
  start: '2026-11-05',
  bsc: {
    tvl,
    staking: staking({ owners: [STAKING, GRID_MINING], tokens: [MING], lps: [MING_WBNB], useDefaultCoreAssets: true }),
  },
}
