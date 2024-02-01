const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens, sumTokensExport, staking } = require('../helper/unknownTokens')

const LIQD_TOKEN = ADDRESSES.arbitrum.LIQD
const LIQD_ETH_TOKEN = '0x73700aeCfC4621E112304B6eDC5BA9e36D7743D3'
const masterchef = '0x2582fFEa547509472B3F12d94a558bB83A48c007'
const WETH_POOL = '0x705ea996D53Ff5bdEB3463dFf1890F83f57CDe97'
const LIQD_STAKING = '0xA1A988A22a03CbE0cF089e3E7d2e6Fcf9BD585A9'
const TREASURY = '0x61fb28d32447ef7F4e85Cf247CB9135b4E9886C2'
const WETH = ADDRESSES.arbitrum.WETH
const chain = 'arbitrum'
const LPs = [
  '0x5dcf474814515b58ca0ca5e80bbb00d18c5b5cf8',
  '0xb6a0ad0f714352830467725e619ea23e2c488f37',
]

async function tvl(_, _b, {[chain]: block }) {
  const toa = []
  LPs.map(i => toa.push([i, TREASURY])) // Protocol owned liquidity
  toa.push([WETH,TREASURY])
  toa.push([WETH,WETH_POOL])
  return sumUnknownTokens({ chain, block, tokensAndOwners: toa, useDefaultCoreAssets: true, })
}

module.exports = {
  arbitrum: { 
    tvl,
    pool2: sumTokensExport({ owner: masterchef, tokens: LPs, chain, useDefaultCoreAssets: true, }),
    staking: staking({ owner: LIQD_STAKING, tokens: [LIQD_TOKEN], chain, })
  }
}


