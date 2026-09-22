const { sumTokensExport } = require('../helper/unwrapLPs')
const nightshades = require('./nightshades')
const safetyDepositBox = require('./safety-deposit-box')
const smartLp = require('./smart-lp')

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

async function robinhoodTvl(api) {
  await safetyDepositBox.tvl(api)
  await nightshades.tvl(api)
  safetyDepositBox.keepQuoteTokens(api)
  await smartLp.tvl(api)
  // The protocol's own token is tracked under staking, not TVL.
  api.removeTokenBalance(STONKBROKER)
}

module.exports = {
  methodology:
    'TVL is the liquidity locked in the Safety Deposit Box lockers on Robinhood Chain: Uniswap V3 position NFTs in the V3 box, up. DEX (Slipstream) positions in the up. CL box (including every Stonklauncher / Safe Launch graduation pool, whose raise + LP tax reserve is locked forever at bond), Uniswap v4 PoolManager positions in the V4 box, up. V2 LP in the up. V2 box, and the ownerless forever-escrow holding the canonical ETH/STONKBROKER Uniswap v4 LP. Only the quote side (ETH, WETH, USDG, cbBTC, UP) of each locked position is counted; launched-token legs stay unpriced and STONKBROKER is excluded from TVL. Plus the Smart LP (Volatility Farming) vaults on Robinhood Chain and Arbitrum One: every vault the registry has ever listed, each owning one Uniswap V3 position NFT (both legs counted) plus idle balances held between compounds. Plus the Nightshades anti-snipe launch: the WETH raise escrowed in the pad pre-bond, the snipe-tax WETH held in the FactionLiquidityVault, and the WETH leg of each bonded faction\'s protocol-owned Uniswap v4 position. Staking tracks STONKBROKER tokens in the escrow contract.',
  doublecounted: true,
  robinhood: {
    tvl: robinhoodTvl,
    staking: sumTokensExport({ owner: STONK_ESCROW, tokens: [STONKBROKER] }),
  },
  arbitrum: {
    start: '2026-09-15',
    tvl: smartLp.arbitrumTvl,
  },
}
