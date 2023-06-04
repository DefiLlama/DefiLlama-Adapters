const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: {
    owners: [
      '0x2a838ab9b037db117576db8d0dcc3b686748ef7c',
      '0x7043E4e1c4045424858ECBCED80989FeAfC11B36',
    ],
    tokens: [
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDT,
    ],
  },
  xdai: {
    owners: [
      '0xac004b512c33D029cf23ABf04513f1f380B3FD0a', // v1
      '0x204e7371Ade792c5C006fb52711c50a7efC843ed', // v2
    ],
    tokens: [
      ADDRESSES.xdai.WXDAI, // WXDAI
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
