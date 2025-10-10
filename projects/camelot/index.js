const { getUniTVL } = require("../helper/unknownTokens");

const tvl = getUniTVL({ factory: '0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4', useDefaultCoreAssets: true })

module.exports = {
  misrepresentedTokens: true,
  start: '2022-11-22',
  arbitrum: {
    tvl: getUniTVL({ factory: '0x6EcCab422D763aC031210895C81787E87B43A652', useDefaultCoreAssets: true, }),
  },
  sanko: { tvl },
  xai: {
    tvl: getUniTVL({ factory: '0x18E621B64d7808c3C47bccbbD7485d23F257D26f', useDefaultCoreAssets: true })
  },
  rari: { tvl },
  reya: { tvl },
  gravity: { tvl },
  apechain: { tvl },
  duckchain: { tvl },
  occ: { tvl },
  spn: { tvl },
};