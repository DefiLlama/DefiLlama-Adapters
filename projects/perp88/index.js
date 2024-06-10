const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');
const tokens = {
  "WMATIC": ADDRESSES.polygon.WMATIC_2,
  "WETH": ADDRESSES.polygon.WETH_1,
  "WBTC": ADDRESSES.polygon.WBTC,
  "DAI": ADDRESSES.polygon.DAI,
  "USDC": ADDRESSES.polygon.USDC,
  "USDT": ADDRESSES.polygon.USDT
}
const POOL_DIAMOND_CONTRACT = '0xE7D96684A56e60ffBAAe0fC0683879da48daB383';

async function blastTvl(api) {
  const vaultStorageAddress = '0x97e94BdA44a2Df784Ab6535aaE2D62EFC6D2e303'
  const hlpUnderlyings = [
    "0x2EAd9c6C7cAB1DD3442714A8A8533078C402135A",
    "0x620aa22aA45F59Af91CaFBAd0ab58181FcDBfB08",
  ]
  return api.sumTokens({ owner: vaultStorageAddress, tokens: hlpUnderlyings, })
}

module.exports = {
  start: 1668684025,
  polygon: {
    tvl: sumTokensExport({ owner: POOL_DIAMOND_CONTRACT, tokens: Object.values(tokens), }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x56CC5A9c0788e674f17F7555dC8D3e2F1C0313C0',
      tokens: [
        "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
        "0x47c031236e19d024b42f8AE6780E44A573170703",
      ],
      fetchCoValentTokens: true,
    })
  },
  blast: {
    tvl: blastTvl
  }
}
