
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const KGL_ADDRESS = ADDRESSES.astar.KGL
const VOTING_ESCROW_ADDRESS = "0x432c8199F548425F7d5746416D98126E521e8174"

// Kagla is a Curve fork on Astar. Its on-chain registry (get_registry / pool_list /
// get_coins) is a legacy Vyper contract whose calls now revert on current Astar state
// after a network runtime upgrade (eth_call returns empty `0x`, while raw storage is
// intact). Standard ERC20 balanceOf calls still work, so we hardcode the pool -> coins
// map (snapshotted from the registry at an earlier block) and sum balances directly.
// LP tokens that appear as coins inside metapools are blacklisted to avoid double
// counting the base-pool liquidity.
const poolTokens = {
  '0xeb97bc7c4ca99fa8078ff879905338517821b9f5': ['0x6de33698e9e9b787e09d3bd7771ef63557e148bb', ADDRESSES.moonbeam.USDC, '0x3795c36e7d12a8c252a20c5a7b455f7c57b60283'],
  '0xed29ca5c39e35793f63f4485873abbb52cb29308': ['0x4dd9c468a44f3fef662c35c1e9a6108b70415c2c', '0xc404e12d3466accb625c67dbab2e1a8a457def3c', '0x430d50963d9635bbef5a2ff27bd0bddc26ed691f'],
  '0x247f10e06536dd774f11fa5f8309c21b6647fc9a': [ADDRESSES.oasis.ceUSDT, '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0x60b26fd3251bc15045e3f94a2c30751a022dfcc3': ['0x733ebcc6df85f8266349defd0980f8ced9b45f35', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0xbb70f16f2a115af2faf3b8abfefaf61969909a21': ['0x29f6e49c6e3397c3a84f715885f9f233a441165c', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0xe12332a6118832cbafc1913ec5d8c3a05e6fd880': ['0xffffffff00000000000000010000000000000001', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0x327d5322242b5558beba1dfb9c02a9da63551d67': [ADDRESSES.GAS_TOKEN_2, '0xe511ed88575c57767bafb72bfd10775413e3f2b0'],
  '0x222660f8729897a703412cd965d85688c396e7df': ['0xdbd71969ac2583a9a20af3fb81fe9c20547f30f3', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0xabc6830022c18a60e80108ca8a66e4524e7104a1': ['0x9914bff0437f914549c673b34808af6020e2b453', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0x5b14ec307ac141688c6c3c55253f12cdefb0bcf9': ['0x347e53263f8fb843ec605a1577ec7c8c0cac7a58', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0xdccafcda0953b2948b40e0cdc94c900f0d2d6368': ['0x02dac4898b2c2ca9d50ff8d6a7726166cf7bcfd0', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0x578aa1be6d258677e80c9067711861dd981a663e': ['0x257f1a047948f73158dadd03eb84b34498bcdc60', '0x5eaae8435b178d4677904430bac5079e73afa56e'],
  '0x4fd9011f0867e7e8af7608ad1bb969da8b0aba9b': ['0xc4335b1b76fa6d52877b3046eca68f6e708a27dd', '0xddf2ad1d9bfa208228166311fc22e76ea7a4c44d'],
  '0xdc1c5babb4dad3117fd46d542f3b356d171417fa': ['0xffffffff000000000000000000000001000007c0', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
  '0x77579ca9dd0e8af9c4b40dc9c0bfecbdbc073cf5': ['0xffffffff00000000000000010000000000000003', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'],
}

// LP tokens (Kagla pool share tokens) that show up as a coin inside metapools.
// Blacklisting them prevents double counting the base pool's underlying liquidity.
const lpTokens = [
  '0x18bdb86e835e9952cfaa844eb923e470e832ad58', // base 3pool LP
]

const tvl = async (api) => {
  const ownerTokens = Object.entries(poolTokens).map(([pool, tokens]) => [tokens, pool])
  return sumTokens2({ api, ownerTokens, blacklistedTokens: [...Object.keys(poolTokens), ...lpTokens] })
}

module.exports = {
  astar: {
    tvl,
    staking: staking(VOTING_ESCROW_ADDRESS, KGL_ADDRESS),
  },
};
