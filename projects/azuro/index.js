const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: {
    owners: [
      '0x2a838ab9b037db117576db8d0dcc3b686748ef7c',
    ],
    tokens: [
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    ],
  },
  xdai: {
    owners: [
      '0xac004b512c33D029cf23ABf04513f1f380B3FD0a', // v1
      '0x204e7371Ade792c5C006fb52711c50a7efC843ed', // v2
    ],
    tokens: [
      '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
    ],
  },
}

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return sumTokens2({ api, ...config[api.chain] })
}

module.exports = {
  xdai: { tvl },
  polygon: { tvl },
  methodology: `TVL is the total amount of WXDAI and USDC held on Liquidity pools’ smart-contracts.`
}
