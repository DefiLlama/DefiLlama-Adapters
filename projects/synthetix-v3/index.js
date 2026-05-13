const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// const CUSTOM_ADDRESSES = {
//   arbitrum: {
//     WEETH: ADDRESSES.arbitrum.weETH,
//     sUSDe: ADDRESSES.arbitrum.sUSDe,
//     tBTC: "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40"
//   }
// }

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xffffffaEff0B96Ea8e4f94b2253f31abdD875847', tokens: [ADDRESSES.ethereum.SNX] })
  },
  base: { tvl: () => ({}) },
  arbitrum: { tvl: () => ({}) },
};
