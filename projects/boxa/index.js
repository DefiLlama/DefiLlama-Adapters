// BOXA: a token launchpad on Elysium (https://boxa.club). Every coin launches into a Uniswap v4 pool whose hook is a BOXA
// hook that owns the launch liquidity. TVL is what sits in BOXA's own venues:
//  - BOXA's own Uniswap v4 PoolManager, home of its first launches (boxaV4), its pair launches (boxaV4Pairs) and its
//    meme-paired launches (boxaV4MemePairs) - addresses from the boxa.club front-end config, all deployed by 0x4ac872…ee2
//  - the limit-order escrow (HYPE held for open buy orders)
// Newer launches (boxaUni V1-V4 hooks) trade on Uniswap's own v4 PoolManager on Elysium, which the Uniswap V4 adapter already
// counts, so they're left out here. $BOXA in BOXA's PoolManager is reported under staking.

const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const BOXA_POOL_MANAGER = '0x06c63714fbf1f5753017123e2fcfdede4540b2c4'
const LIMIT_ORDERS = '0x346e65fb84ac7a1a8a9ebd4335d042c4ad61646b'
const BOXA = '0xa3c1d6a8648df3978a38ce1478fbc284c75d95d7'

// Pair assets BOXA launches are quoted in besides native HYPE and $BOXA: WHYPE, KNTQ, wNVDAx and BLOB (ElysPump).
const QUOTES = [
  nullAddress,
  '0xba876237b0f021a6c6d852d6c26e107997cc5e81', // WHYPE
  '0xe45a355d9e9cad2ad85f2d03e3ee3102a036acf0', // KNTQ
  '0x11265018bf2d5a99fb71efae73ad670203c1df44', // wNVDAx
  '0x9a9815af521149e8d982791703a31bca2f95f534', // BLOB
]

async function tvl(api) {
  return sumTokens2({ api, owners: [BOXA_POOL_MANAGER, LIMIT_ORDERS], tokens: QUOTES })
}

async function staking(api) {
  return sumTokens2({ api, owner: BOXA_POOL_MANAGER, tokens: [BOXA] })
}

module.exports = {
  methodology:
    "TVL is the pair assets (HYPE, WHYPE, KNTQ, wNVDAx, BLOB) held by BOXA's own Uniswap v4 PoolManager on Elysium, where its " +
    "launch pools trade, plus HYPE escrowed for open limit orders. Launches on Uniswap's own v4 PoolManager are counted by the " +
    "Uniswap V4 adapter, so they're not counted again here. Staking is the $BOXA held by BOXA's PoolManager.",
  start: '2026-10-26',
  elysium: {
    tvl,
    staking,
  },
}
