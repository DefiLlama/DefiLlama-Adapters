const { sumTokens, unwrapCrv, } = require('../helper/unwrapLPs')

const chain = 'polygon'
const DAI = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

const treasuryAddress = '0xb495ffc5acd7e2fd909c23c30d182e6719fbe9ec'
const oldDaoContract = '0xb05d0da5253e77a8ad37232e8235c712e10edee8'
const daoContract = '0xb8dc6634b7ac8ad3ae352ab92de51349e7b5e71c'

async function polygon_tvl(timestamp, ethBlock, { polygon: block }) {
  const daoTokens = [DAI,].map(token => [
    [token, oldDaoContract,],
    [token, daoContract,],
  ]).flat()

  const balances = {}
  const transformPolygonAddress = addr => `${chain}:${addr}`
  await sumTokens(
    balances,
    daoTokens,
    block,
    chain,
    transformPolygonAddress
  )
  return balances
}

async function polygon_treasury(timestamp, ethBlock, { polygon: block }) {

  const DRAGON_QUICK = '0xf28164a485b0b2c90639e47b0f377b4a438a16b1'
  const CUBO_TOKEN = '0x381d168DE3991c7413d46e3459b48A5221E3dfE4'
  const MOO_CRV_TriCrypto = '0x5A0801BAd20B6c62d86C566ca90688A6b9ea1d3f'
  const MOO_AM3CRV = '0xAA7C2879DaF8034722A0977f13c343aF0883E92e'
  const AM3CRV = '0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171'
  const CRV_TriCrypto = '0xdad97f7713ae9437fa9249920ec8507e5fbb23d'

  const UnwrapTokenMapping = [
    { from: MOO_AM3CRV, unwrapTo: AM3CRV },
    { from: AM3CRV, unwrapTo: AM3CRV },
    { from: MOO_CRV_TriCrypto, unwrapTo: CRV_TriCrypto },
    { from: CRV_TriCrypto, unwrapTo: CRV_TriCrypto },
  ].reduce((mapping, { from, unwrapTo }) => {
    mapping[`${chain}:${from}`] = { type: 'crv', unwrapTo, }
    return mapping
  }, {})

  const treasuryTokens = [DAI, DRAGON_QUICK, CUBO_TOKEN, MOO_CRV_TriCrypto, MOO_AM3CRV,].map(token => [token, treasuryAddress,])

  const balances = {}
  const transformPolygonAddress = addr => `${chain}:${addr}`
  await sumTokens(
    balances,
    treasuryTokens,
    block,
    chain,
    transformPolygonAddress
  )

  // Handle wrapped pools in balances - like curvePools, etc
  for (let i = 0; i < 2; i++) { // since crvTriCrypto contains am3crv, unwrap twice
    for (const token of Object.keys(balances)) {
      if (Object.keys(UnwrapTokenMapping).includes(token) && balances[token] > 0) {
        if (UnwrapTokenMapping[token].type === 'crv') {
          await unwrapCrv(balances, UnwrapTokenMapping[token].unwrapTo, balances[token], block, chain, transformPolygonAddress)
        }
        delete balances[token]// Once unwrapped, remove from balance
      }
    }
  }
  return balances
}

module.exports = {
  polygon: {
    tvl: polygon_tvl,
    treasury: polygon_treasury,
  },
  methodology: `TVL on polygon is sum of all collateralTokens (dai only atm) provided to mint nodes`,
}
