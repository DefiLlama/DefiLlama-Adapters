const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// EventTrader — AI-native prediction market on Base L2
// https://cymetica.com
// A2A agent card: https://cymetica.com/.well-known/agent-card.json
// MCP endpoint:   https://cymetica.com/.well-known/mcp.json

const USDC = ADDRESSES.base.USDC   // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const WETH = ADDRESSES.base.WETH   // 0x4200000000000000000000000000000000000006

// Perpetual binary-option collateral (CYM1)
const CYM1 = '0x133969feb4a827e0b4f38f5926a552dcc10131da'

// Wrapped VAIX (wVAIX) — supply-chain market collateral
const WVAIX = '0x5134C080Be86322CE77C344e2C88599F9A84E5c2'

// ── Factories ──────────────────────────────────────────────
const WTA_FACTORY       = '0xDc7551e5C67802dEa4d8A03E61F856Ff3000a6cF'
const PERPETUAL_FACTORY = '0x3466e9a644A9CAF2Bef46c23c6b44D5AfBDf3719'
const SUPPLY_CHAIN_FACTORY = '0xFeE351D2f0d0337661EF82766868b690030055D3'

// ── Static protocol addresses ──────────────────────────────
const CLOB_SETTLEMENT  = '0x9d4dFbdF0fa05B5657Efe601db9A99A1F7c71500'
const ARENA_SETTLEMENT = '0x5Ce06F6692e045089FeE521534C50F79e07b89fB'
const WTA_POOL_FUNDER  = '0xf698e08eebE1Cbfe82d98d1f4001f6fBcab4639E'
const TREASURY         = '0x79b15E07205B6338041a158F7AC11d05153eA9D7'

// Tokens we track across all owners
const TOKENS = [USDC, WETH, CYM1, WVAIX]

async function tvl(api) {
  // Static protocol-owned addresses
  const owners = [CLOB_SETTLEMENT, ARENA_SETTLEMENT, WTA_POOL_FUNDER, TREASURY]

  // 1. WTA markets (enumerated from factory)
  const wtaMarkets = await api.call({
    abi: 'function getAllMarkets() view returns (address[])',
    target: WTA_FACTORY,
  })
  owners.push(...wtaMarkets)

  // 2. Perpetual binary-option markets (indexed; getMarkets() reverts on large sets)
  const perpCount = await api.call({
    abi: 'function getMarketCount() view returns (uint256)',
    target: PERPETUAL_FACTORY,
  })
  if (perpCount > 0) {
    const perpMarkets = await api.multiCall({
      abi: 'function markets(uint256) view returns (address)',
      target: PERPETUAL_FACTORY,
      calls: Array.from({ length: Number(perpCount) }, (_, i) => i),
    })
    owners.push(...perpMarkets)
  }

  // 3. Supply-chain / tokenized markets (indexed)
  const scCount = await api.call({
    abi: 'function getMarketCount() view returns (uint256)',
    target: SUPPLY_CHAIN_FACTORY,
  })
  if (scCount > 0) {
    const scMarkets = await api.multiCall({
      abi: 'function markets(uint256) view returns (address)',
      target: SUPPLY_CHAIN_FACTORY,
      calls: Array.from({ length: Number(scCount) }, (_, i) => i),
    })
    owners.push(...scMarkets)
  }

  // Sum USDC + WETH + CYM1 + wVAIX across every owner
  return sumTokens2({ api, owners, tokens: TOKENS })
}

module.exports = {
  methodology:
    'TVL is the total value of tokens (USDC, WETH, CYM1 collateral, wVAIX) held across all ' +
    'EventTrader prediction market contracts on Base L2 — Winner-Takes-All (WTA) markets, ' +
    'perpetual binary-option markets, supply-chain markets, CLOB/Arena settlement, and the ' +
    'protocol treasury. Markets are enumerated dynamically from on-chain factories.',
  base: {
    tvl,
  },
}
