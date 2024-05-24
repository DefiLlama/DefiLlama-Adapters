const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')

const kala = '0x32299c93960bb583a43c2220dc89152391a610c5'
const masterchef = '0x565bCba3eA730ac6987edE126B29DCf499fccEA1'

async function tvl(api) {
  return sumTokens2({
    api, ownerTokens: [
      [[ADDRESSES.bsc.BUSD], '0x2d067575BE1f719f0b0865D357e67925B6f461C5'], // BUSD mint
      [[
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.ETH,
        "0x23396cf899ca06c4472205fc903bdb4de249d6fc",
        ADDRESSES.bsc.USDC,
        "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.BUSD,
        "0x5066c68cae3b9bdacd6a1a37c90f2d1723559d18",], masterchef],
    ]
  })
}

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([getUniTVL({ factory: '0xa265535863305ce0a2a8ec330c2cec972aca3004', useDefaultCoreAssets: true, }), tvl]),
    staking: staking(masterchef, kala),
  }
}