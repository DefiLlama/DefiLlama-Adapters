const { sumTokens2 } = require('../helper/unwrapLPs')

const addresses = {
  polygon: {
    LPContract: '0x2a838ab9b037db117576db8d0dcc3b686748ef7c',
    token: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
  }, xdai: {
    LPContract: '0xac004b512c33D029cf23ABf04513f1f380B3FD0a',
    token: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
  }
}

async function tvl(_, _b, _cb, { api, }) {
  return sumTokens2({
    api, owner: addresses[api.chain].LPContract, tokens: [addresses[api.chain].token],
  })
}


module.exports = {
  xdai: {
    tvl,
  },
  polygon: {
    tvl
  },
  methodology: `TVL is the total quantity of xDAI held on Liquidity pools’ smart-contracts.`
}
