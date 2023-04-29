const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')

const pools = {
  '3MM Basepool': {
    owner: '0x690BBaa9EDBb762542FD198763092eaB2B2A5350',
    tokens: [
      ADDRESSES.polygon.USDT,  // USDT
      ADDRESSES.polygon.USDC,  // USDC
      ADDRESSES.polygon.DAI, // DAI
    ]
  }
}
const chain = 'polygon'
async function tvl(ts, _, { [chain]: block }) {
  const toa = []
  Object.values(pools).forEach(i => {
    i.tokens.forEach(j => toa.push([j, i.owner]))
  })
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

module.exports = {
  doublecounted: true,
  polygon: {
    tvl
  },
  methodology: "Counts DAI, USDC, & USDT tokens on the 3MM Base Pool for tvl"
};
