const { sumTokens2, } = require('../helper/unwrapLPs')

const pools = {
  '3MM Basepool': {
    owner: '0x690BBaa9EDBb762542FD198763092eaB2B2A5350',
    tokens: [
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',  // USDT
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',  // USDC
      '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
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
