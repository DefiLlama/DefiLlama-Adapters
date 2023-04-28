//20230428 initial release: simple and clear
const { sumTokensExport } = require('../helper/unwrapLPs');

const ownerArbitrum = '0x7a08b29A7Ad4A19A5ECa0c82F5F082872488D135'; // contract address
const tokensArbitrum = [
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
  '0x0000000000000000000000000000000000000000', // ETH
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
];

const ownerAvalanche = '0xd8b0D18faE7eA29F2AD95d01FFb479E0021a9A5e'; // contract address
const tokensAvalanche = [
  '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
  '0x0000000000000000000000000000000000000000', // AVAX
  '0x152b9d0FdC40C096757F570A51E494bd4b943E50', // BTC.b
  '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH.e
  '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDt
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
