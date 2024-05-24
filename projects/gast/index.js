const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport('arbitrum', '0x7e299DdF7E12663570dBfA8F3F20CB54f8fD04fA')

// const { sumTokens2, } = require('../helper/unwrapLPs')

// module.exports = {
//   btr: {
//     tvl: async api => {
//       return sumTokens2({
//         owners: [
//           '0x7ba47bbffa24983749145f3a683656d391e3f3bc', // gast-wbtc lp
//         ], tokens: ['0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'], api,
//       }) //wbtc
//     },
//   },
//   arbitrum: {
//     tvl: async api => {
//       return sumTokens2({
//         owners: [
//           '0xbd7d96b4598E22eC5302232F6e7870a2d095CAcA', // gast-usdt lp
//         ], tokens: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'], api,
//       }) //usdt
//     },
//   }
// }