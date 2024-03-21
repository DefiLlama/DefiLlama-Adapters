//20230428 initial release: simple and clear
//20230606 update: add chain: zkSync Era
//20240321 update: add chain: scroll, base, mantle, manta, polygon_zkevm
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

//arbitrum
const ownerArbitrum = '0x7a08b29A7Ad4A19A5ECa0c82F5F082872488D135'; // contract address
const tokensArbitrum = [
  ADDRESSES.arbitrum.USDC, // USDC.e
  ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
  ADDRESSES.null, // ETH
  ADDRESSES.arbitrum.USDT, // USDT
  ADDRESSES.arbitrum.WBTC, // WBTC
];
//avalanche
const ownerAvalanche = '0xd8b0D18faE7eA29F2AD95d01FFb479E0021a9A5e'; // contract address
const tokensAvalanche = [
  ADDRESSES.avax.USDC, // USDC
  ADDRESSES.null, // AVAX
  ADDRESSES.avax.BTC_b, // BTC.b
  ADDRESSES.avax.WETH_e, // WETH.e
  ADDRESSES.avax.USDt, // USDt
];
//zkSync Era
const ownerEra = '0xa1795B95C543428AFf866dA613e43895457bf1C1'; // contract address
const tokensEra = [
  ADDRESSES.era.USDC, // USDC
  ADDRESSES.null, // ETH
];
//scroll
const ownerScroll = '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F'; // contract address
const tokensScroll = [
  ADDRESSES.scroll.USDC, // USDC
  ADDRESSES.null, // ETH
];
//base
const ownerBase = '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F'; // contract address
const tokensBase = [
  ADDRESSES.base.USDC, // USDC
  ADDRESSES.null, // ETH
];
//mantle
const ownerMantle = '0x8712FA9569658c27556d95C820f775939513faEf'; // contract address
const tokensMantle = [
  ADDRESSES.mantle.USDC, // USDC
];
//manta
const ownerManta = '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F'; // contract address
const tokensManta = [
  ADDRESSES.manta.USDC, // USDC
  "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5", // MANTA
  "0xEc901DA9c68E90798BbBb74c11406A32A70652C3", // STONE
];
//polygon_zkevm
const ownerPolygonZkevm = '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F'; // contract address
const tokensPolygonZkevm = [
  ADDRESSES.polygon_zkevm.USDC, // USDC
  ADDRESSES.polygon_zkevm.USDC_CIRCLE, //USDC.E
];


module.exports = {
  methodology: "TVL is equal to users' deposits minus withdrawals",
  start: 1641625200, // Jan-08-2022 07:00:00 AM +UTC
  arbitrum: {
    tvl: sumTokensExport({ owner:ownerArbitrum, tokens:tokensArbitrum })
  },
  avax: {
    tvl: sumTokensExport({ owner:ownerAvalanche, tokens:tokensAvalanche })
  },
  era: {
    tvl: sumTokensExport({ owner:ownerEra, tokens:tokensEra })
  },
  scroll: {
    tvl: sumTokensExport({ owner:ownerScroll, tokens:tokensScroll })
  },
  base: {
    tvl: sumTokensExport({ owner:ownerBase, tokens:tokensBase })
  },
  mantle: {
    tvl: sumTokensExport({ owner:ownerMantle, tokens:tokensMantle })
  },
  manta: {
    tvl: sumTokensExport({ owner:ownerManta, tokens:tokensManta })
  },
  polygon_zkevm: {
    tvl: sumTokensExport({ owner:ownerPolygonZkevm, tokens:tokensPolygonZkevm })
  },  
};
