const { getLogs } = require('../helper/cache/getLogs')

// satellite factory: same Uniswap V3 engine as the public goo exchange factory, but its pools hold
// treasury-owned liquidity and only the protocol's arbitrage contract can swap them
const SATELLITE_FACTORY = '0x649Fee51B30dce68Eed7B356F5Ec6185e3982ADf'
const GOO = '0x6572EADe9Fb17F4027baF92FEAC222B9AA746bd0'

async function getPools(api) {
  return getLogs({
    api,
    target: SATELLITE_FACTORY,
    fromBlock: 79897550,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
    onlyArgs: true,
  })
}

async function tvl(api) {
  const pools = await getPools(api)
  return api.sumTokens({ ownerTokens: pools.map(i => [[i.token0, i.token1], i.pool]), blacklistedTokens: [GOO] })
}

async function ownTokens(api) {
  const pools = await getPools(api)
  return api.sumTokens({ owners: pools.map(i => i.pool), tokens: [GOO] })
}

module.exports = {
  methodology: 'Tokens held by the satellite pools of goo exchange on Robinhood Chain: protocol-owned liquidity for GOO and its stock pairs, held by the treasury in private pools that only the protocol\'s arbitrage contract trades. GOO is reported as own tokens.',
  robinhood: {
    tvl,
    ownTokens,
  },
}
