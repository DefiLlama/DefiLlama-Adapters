const ADDRESSES = require('../helper/coreAssets.json')

const FURETY_QUICKSWAP_V2_PAIR = '0x752ba5553d3066d76fd2f9ee6699337ef357cb89'

async function tvl(api) {
  const wpolBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.polygon.WMATIC_2,
    params: [FURETY_QUICKSWAP_V2_PAIR],
  })

  api.add(ADDRESSES.polygon.WMATIC_2, wpolBalance)
}

module.exports = {
  methodology:
    'Furety TVL counts the WPOL side of the public QuickSwap V2 FTY/WPOL pair on Polygon. Treasury-held FTY and internal reserves are not counted as TVL, and the FTY side of the pair is excluded until it has a DefiLlama-supported price source.',
  polygon: {
    tvl,
  },
}
