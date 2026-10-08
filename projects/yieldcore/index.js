const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const CORE_CONTRACTS = [
  '0x2375Fcc2a256425228aA94d7100093230761639e', // v3
  '0x6D6CDf89Cc565A04f0Ba99A1Dc13d43d0d005E4E', // v4.3.1
  '0x903407687486b3ae60746622D06b2eD3D75EaCAb', // v4.3.2
]

// Protocol-controlled Krystal vault wallets. These wallets hold idle USDT and/or
// concentrated-liquidity NFTs whose underlying assets are part of YieldCore TVL.
const VAULTS = [
  '0xeE9dd48b2Aa7Ab67534c6Da5E1cD261263d46ef7',
  '0x5e910c45611b401c6bbd6d9c85e4a228b4f5fac1',
  '0xde5da338479e1c5751e7243eb1bd750ec4e5a91f',
  '0x9fd253eeca51aa8cef55d8eb2fedd22b72fab3fd',
  '0x3322a1084b905cad729abcc6f02c52bbfbcbdf55',
  '0xad0d5df9316ca451707fae2ea3e079d368e80ba3',
  '0x4f84d1f9ae79363008870dacf7d50e4385166c9f',
]

const OWNERS = [...CORE_CONTRACTS, ...VAULTS]

async function tvl(api) {
  // Count idle USDT at every protocol custody address and unwrap PancakeSwap V3
  // and Uniswap V3 position NFTs held by those addresses.
  await sumTokens2({
    api,
    owners: OWNERS,
    tokens: [ADDRESSES.bsc.USDT],
    resolveUniV3: true,
  })

  // Uniswap V4 position enumeration currently accepts one owner per call.
  for (const owner of OWNERS) {
    await sumTokens2({
      api,
      owner,
      resolveUniV4: true,
    })
  }

  return api.getBalances()
}

module.exports = {
  start: '2026-02-06',
  methodology: 'TVL is the value of active USDT-backed YieldCore bond capital held across the v3, v4.3.1, and v4.3.2 contracts, plus idle USDT and the current underlying value of protocol-controlled concentrated-liquidity positions deployed through authorized YieldCore vaults. Assets are counted once from on-chain custody balances and LP positions.',
  bsc: { tvl },
}
