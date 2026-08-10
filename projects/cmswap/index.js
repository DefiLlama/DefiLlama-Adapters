const { uniV3Export } = require('../helper/uniswapV3')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// cmswap / Junoswap.trade — Uniswap V3-fork DEX + bonding-curve launchpad, live on
// Bitkub Chain and JBC (JIBCHAIN). Promoted out of registries/uniswapV3.js so the
// staking and launchpad reserves below can be added alongside the DEX pool TVL.
const config = {
  bitkub: {
    v3Factory: '0x090C6E5fF29251B1eF9EC31605Bdd13351eA316C',
    v3FactoryFromBlock: 25033350,
    v3Staker: '0xC216ad61623617Aa01b757A06836AA8D6fb547fF',
    bondingCurve: '0x65F6EC30A9E70822721585f6Bba15c40c2F8ab4e',
    bondingCurveFromBlock: 32995517,
  },
  jbc: {
    v3Factory: '0x5835f123bDF137864263bf204Cf4450aAD1Ba3a7',
    v3FactoryFromBlock: 4990175,
    v3Staker: '0xC7Aa8C815937B61F70E04d814914683bB9Bd7579',
  },
}

const dex = uniV3Export(Object.fromEntries(
  Object.entries(config).map(([chain, { v3Factory, v3FactoryFromBlock }]) => [chain, { factory: v3Factory, fromBlock: v3FactoryFromBlock }])
))

function stakingTvl(staker) {
  return async (api) => {
    const logs = await getLogs2({
      api,
      target: staker,
      eventAbi: 'event IncentiveCreated(address indexed rewardToken, address indexed pool, uint256 startTime, uint256 endTime, address refundee, uint256 reward)',
      fromBlock: 1,
    })
    const tokens = [...new Set(logs.map(l => l.rewardToken))]
    if (!tokens.length) return
    return sumTokens2({ api, owner: staker, tokens })
  }
}

function launchpadTvl(bondingCurve, fromBlock) {
  return async (api) => {
    const logs = await getLogs2({
      api,
      target: bondingCurve,
      eventAbi: 'event Creation(address indexed creator, address tokenAddr, string logo, string description, string link1, string link2, string link3, uint256 createdTime)',
      fromBlock,
    })
    const tokens = [nullAddress, ...new Set(logs.map(l => l.tokenAddr))]
    return sumTokens2({ api, owner: bondingCurve, tokens })
  }
}

module.exports = {
  methodology: 'DEX: sums the token reserves held in cmswap/Junoswap.trade V3 concentrated-liquidity pools (a Uniswap V3 fork), with pools discovered via PoolCreated events on the V3 factory. Staking: sums undistributed reward tokens held by the V3 staker contract, with reward tokens discovered via IncentiveCreated events. Launchpad: sums native currency and un-graduated token reserves held by the bonding-curve contract, with tokens discovered via Creation events.',
}

Object.keys(config).forEach(chain => {
  const { v3Staker, bondingCurve, bondingCurveFromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await dex[chain].tvl(api)
      if (bondingCurve) await launchpadTvl(bondingCurve, bondingCurveFromBlock)(api)
    },
    staking: stakingTvl(v3Staker),
  }
})
