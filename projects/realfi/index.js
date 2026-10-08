const { sumTokens2 } = require('../helper/chain/cardano')

const POLICY = '7d9e4a0ee1a3f5d5ff8159ea91a83310cf2795ee7a87170c7aea05ae'
const USDRF = POLICY + '55534472'

// USDCx, the Circle-backed reserve asset. USDrf is not priced by DefiLlama, so the
// locked balance is denominated in USDCx, which is priced and also has 6 decimals.
const USDCX = '1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e345553444378'

// Enterprise script address of the staking vault validator, hash
// 2efab7b9fe036476f6e095f69cf4728917755e1f9c75204dcf510e89.
const STAKING_VAULT = 'addr1wyh04daelcpkgahkuz2ld885w2y3wa27r7w82gzdeagsazgtwduhf'

async function tvl(api) {
  const balances = await sumTokens2({ owner: STAKING_VAULT, tokens: [USDRF] })
  const locked = balances[`cardano:${USDRF}`]
  // Fail loudly rather than report a silent zero: the vault has held USDrf
  // continuously since it was deployed, so an empty read is a failed query.
  if (locked === undefined)
    throw new Error('realfi: no USDrf found at the staking vault address')
  api.add(USDCX, locked)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2026-09-22',
  methodology: 'TVL corresponds to USDrf locked in the RealFi staking vault on Cardano, read from the vault script address. RealFi operates a two-token structure: USDrf is the stable token, pegged to one US dollar, and sUSDrf is the junior staked token. Holders deposit USDrf and receive sUSDrf, whose exchange rate is the vault\'s settled USDrf backing divided by the circulating sUSDrf supply, so it rises as the backing portfolio earns and falls when it loses. On a loss, USDrf is burned from the staking vault while the sUSDrf supply is held constant, so the sUSDrf exchange rate falls directly. USDrf is never rebased: it redeems against reserve assets at a fixed rate set in protocol settings. USDrf circulating supply is reported separately on the stablecoins dashboard.',
  cardano: {
    tvl,
  },
}
