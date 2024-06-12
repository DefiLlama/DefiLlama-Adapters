const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

async function tvl(api) {
  return api.sumTokens({
    owner: '0xa6D0e001A257296d5246edcEFE4Ac56BD558F6c6',
    tokens: [
      ADDRESSES.null, 
      ADDRESSES.polygon.DAI,
      ADDRESSES.polygon.WETH_1,
      '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
      '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171',
    ]
  })
}

async function pool2(api) {
  const tokens = [
    '0x162b21ba1a90dd9384c615192fa4053217d2a8db',
    '0x53add4c98b2787f690042771ca8e512a5793e9c9',
    '0x49d8136336e3feb7128c12172ae5ff78238a88be',
  ]
  return sumTokens2({ api, tokens, owner: '0xf12d4CF635c5D5107D67356090A941bD80f2556C', resolveLP: true})
}

module.exports = {
  polygon: {
    tvl,
    staking: staking('0xa6D0e001A257296d5246edcEFE4Ac56BD558F6c6', '0x2db0Db271a10661e7090b6758350E18F6798a49D'),
    pool2,
  },
}
