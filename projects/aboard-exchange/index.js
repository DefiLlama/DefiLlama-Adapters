const ADDRESSES = require('../helper/coreAssets.json')
//20230428 initial release: simple and clear
const { sumTokensExport } = require('../helper/unwrapLPs');

const ownerArbitrum = '0x7a08b29A7Ad4A19A5ECa0c82F5F082872488D135'; // contract address
const tokensArbitrum = [
  ADDRESSES.arbitrum.USDC, // USDC
  ADDRESSES.null, // ETH
  ADDRESSES.arbitrum.USDT, // USDT
  ADDRESSES.arbitrum.WBTC, // WBTC
];

const ownerAvalanche = '0xd8b0D18faE7eA29F2AD95d01FFb479E0021a9A5e'; // contract address
const tokensAvalanche = [
  ADDRESSES.avax.USDC, // USDC
  ADDRESSES.null, // AVAX
  ADDRESSES.avax.BTC_b, // BTC.b
  ADDRESSES.avax.WETH_e, // WETH.e
  ADDRESSES.avax.USDt, // USDt
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
};
