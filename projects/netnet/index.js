const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// NetNet Capital Management ($NET) — OlympusDAO-v1-style reserve protocol on
// Robinhood Chain. Everything is immutable after deploy; addresses below are
// the canonical mainnet registry (github.com/mattybcodes/netnet,
// packages/sdk/src/addresses.ts).
const USDG = ADDRESSES.robinhood.USDG
const NET = '0xCA9c78Dd337A67F6e0077F65F5E9218719d30eDf'
const TREASURY = '0x04822Ea321A0DEE6F40656172F29312104855d66'
const STAKING = '0xB078cc304A0B264C5F3680DC0488954ACcd02E87'
const MORPHO_USDG_VAULT = '0xBeEff033F34C046626B8D0A041844C5d1A5409dd' // Steakhouse USDG (ERC-4626)
const CANONICAL_V2_PAIR = '0x59F95461E68e0c77605299791E1449f175165B54' // NET/USDG POL
// NetNet RWA Sleeve — Safe holding the tokenized equities bought through the
// RWA Desk (Rialto execution). Stock tokens never sit in the Treasury contract.
const RWA_SLEEVE = '0x498752D5fa0600CBd613074C151Abe15B3FeC7CB'
const STOCK_TOKENS = [
  '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
  '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea', // SPCX
  '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9', // AAPL
  '0xe93237c50d904957cf27e7b1133b510c669c2e74', // MSFT
  '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3', // GOOGL
  '0x6330d8c3178a418788df01a47479c0ce7ccf450b', // COIN
]

async function tvl(api) {
  // Liquid USDG + POL (LP resolved to underlying; the NET leg is dropped
  // below as own-token) + RWA Sleeve equities.
  await sumTokens2({
    api,
    tokensAndOwners: [
      [USDG, TREASURY],
      [CANONICAL_V2_PAIR, TREASURY],
      ...STOCK_TOKENS.map(t => [t, RWA_SLEEVE]),
    ],
    resolveLP: true,
    blacklistedTokens: [NET],
  })
  // Treasury USDG deployed to the Morpho Steakhouse vault (≤70% cap).
  const shares = await api.call({ abi: 'erc20:balanceOf', target: MORPHO_USDG_VAULT, params: TREASURY })
  const assets = await api.call({ abi: 'function convertToAssets(uint256) view returns (uint256)', target: MORPHO_USDG_VAULT, params: shares })
  api.add(USDG, assets)
  api.removeTokenBalance(NET)
}

module.exports = {
  methodology:
    'TVL is the NetNet treasury: liquid USDG held by the Treasury contract, USDG deployed to the Morpho Steakhouse USDG vault, the USDG leg of protocol-owned NET/USDG liquidity, and the tokenized equities (Robinhood stock tokens) held in the NetNet RWA Sleeve. NET itself is excluded; staked NET (sNET) is reported under staking.',
  start: '2026-07-16',
  robinhood: {
    tvl,
    staking: (api) => sumTokens2({ api, owner: STAKING, tokens: [NET] }),
  },
}
