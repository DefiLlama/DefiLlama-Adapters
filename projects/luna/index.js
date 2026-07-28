// LUNA - on-chain gamified mining on Robinhood Chain (chainId 4663).
// https://luna.supply
//
// Each 60-second round, miners deploy ETH across a 25-square grid. A drand
// beacon, verified on-chain, picks the winning square; that square's miners
// split the round pot and mint LUNA. LUNA can be staked for a share of
// protocol revenue in ETH.

const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const LUNA_GAME    = '0xd1b6D26FD47B2Fad620DfD4c522Fc03590DeF4ff'   // round deposits, unclaimed ETH, motherlode
const ECLIPSE_GAME = '0x6103b8C107217Dc4da94F977487a02Bd75940f4f'   // Eclipse prize pot + unclaimed dividends
const LUNA_STAKING = '0x5705e86776e220A0f256a7Ea8A9EA80672Dd141F'   // timed-lock staked LUNA + ETH yield
const LUNA_TOKEN   = '0xa6bd7d0dC2d3F4C0BABE6Ab06CCD5f090Ffc8089'
const LUNA_ETH_LP  = '0x4B7D11b6efaDe40b30869761420fcb782c75339F'   // Uniswap V2 pair
// A V2 pair holds WETH, not native ETH. Counting nullAddress here would find
// zero and silently drop the entire ETH side of the pool from pool2.
const WETH         = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'

module.exports = {
  methodology:
    'TVL counts the ETH and LUNA held by the two game contracts: LunaGame (active round deposits, unclaimed ETH winnings, the Motherlode jackpot, and mined LUNA not yet claimed by players) and EclipseGame (the current prize pot and unclaimed dividends). ' +
    'Staking counts LUNA locked in timed staking positions plus the ETH yield pool. ' +
    'Pool2 counts the ETH/LUNA Uniswap liquidity.',
  robinhood: {
    // LUNA as well as ETH: LunaGame holds mined-but-unclaimed LUNA, the LUNA
    // half of the Motherlode, and the passive pool awaiting claims - all owed
    // to players, exactly like the LUNA counted in the staking bucket below.
    tvl: sumTokensExport({ owners: [LUNA_GAME, ECLIPSE_GAME], tokens: [nullAddress, LUNA_TOKEN] }),
    staking: sumTokensExport({ owner: LUNA_STAKING, tokens: [nullAddress, LUNA_TOKEN] }),
    pool2: sumTokensExport({ owner: LUNA_ETH_LP, tokens: [WETH, LUNA_TOKEN] }),
  },
}
