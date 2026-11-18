const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { ethers } = require('ethers')

// Gemoon (gmoon.trade) — meme token launchpad on Uniswap V4, Robinhood Chain.
// Pool liquidity itself sits in the Uniswap V4 PoolManager and is already counted by the
// uniswap-v4 adapter, so only the protocol's own contracts are counted here.
const CONTROLLER = '0x1d05Da4495E57C764229Ec355FCEC1298C6A4AeD' // creates memes (TokenCreated, PoolCreated)
const VAULT = '0x1fd8082AC782444EcD013803A18BAD383BFAc0F8' // staked memes, USDG fees, reward assets
const POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951' // Uniswap V4
const FROM_BLOCK = 104517510 // Controller deployment
const POOLS_SLOT = 6n // `_pools` mapping slot in the Uniswap V4 PoolManager (Pool.State.slot0 is its first word)
const Q192 = 1n << 192n

const poolStateSlot = poolId => ethers.keccak256(
  ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'uint256'], [poolId, POOLS_SLOT]))

async function tvl(api) {
  const tokenLogs = await getLogs2({
    api, target: CONTROLLER, fromBlock: FROM_BLOCK, extraKey: 'token-created',
    eventAbi: 'event TokenCreated(address indexed tokenAddress, address indexed creatorAdmin, uint256 indexed positionId, address creatorRewardRecipient, string name, string symbol)',
  })
  const poolLogs = await getLogs2({
    api, target: CONTROLLER, fromBlock: FROM_BLOCK, extraKey: 'pool-created',
    eventAbi: 'event PoolCreated(bytes32 indexed pool, address indexed token0, address indexed token1, uint256 initialPrice, int24 tick)',
  })
  const memes = tokenLogs.map(l => l.tokenAddress)
  const usdg = await api.call({ target: VAULT, abi: 'address:usdg' })
  const rewardAssets = await api.call({ target: VAULT, abi: 'address[]:allowedAssets' })

  // Staked memes are not priced by the coins server (young, one-sided pools), so they are valued
  // here from the current price of their own Meme/USDG pool and added as USDG. They are left out
  // of the plain balance sum below, otherwise they would be counted twice once they get priced.
  const staked = await api.multiCall({ abi: 'function totalStaked(address) view returns (uint256)', target: VAULT, calls: memes })
  const slot0 = await api.multiCall({ abi: 'function extsload(bytes32) view returns (bytes32)', target: POOL_MANAGER, calls: poolLogs.map(l => poolStateSlot(l.pool)) })
  const poolByMeme = {}
  poolLogs.forEach((l, i) => {
    const meme = l.token0.toLowerCase() === usdg.toLowerCase() ? l.token1 : l.token0
    poolByMeme[meme.toLowerCase()] = { memeIsToken0: meme.toLowerCase() === l.token0.toLowerCase(), sqrtPriceX96: BigInt(slot0[i]) & ((1n << 160n) - 1n) }
  })
  memes.forEach((meme, i) => {
    const pool = poolByMeme[meme.toLowerCase()]
    const amount = BigInt(staked[i])
    if (!pool || pool.sqrtPriceX96 === 0n || amount === 0n) return
    const price = pool.sqrtPriceX96 * pool.sqrtPriceX96 // token1 per token0, raw units, scaled by 2^192
    api.add(usdg, pool.memeIsToken0 ? amount * price / Q192 : amount * Q192 / price)
  })

  return sumTokens2({ api, owner: VAULT, tokens: [usdg, ...rewardAssets] })
}

module.exports = {
  methodology: 'Counts assets held by the Gemoon Vault: USDG swap fees pending distribution, converted reward assets, and the meme tokens staked by users. Staked memes are valued at the current price of their Meme/USDG Uniswap V4 pool, read from the PoolManager, and counted in USDG. The Referrals contract is not counted. Liquidity in the Uniswap V4 pools of the memes is held by the PoolManager and is counted by the Uniswap V4 adapter, not here.',
  start: '2026-11-03',
  robinhood: { tvl },
}
