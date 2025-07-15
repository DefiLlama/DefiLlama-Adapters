const sdk = require('@defillama/sdk');

// https://www.coinbase.com/cbbtc/proof-of-reserves
module.exports = {
  methodology: "BTC collateral backing CBBTC reported by ChainLink Smart Data on Base 0x0F8E057D1D7b282EF968D26E9cB432617dF52519",
  bitcoin: {
    tvl: async function (api) {
      const latestRoundData = await sdk.api2.abi.call({
        chain: 'base',
        target: '0x0F8E057D1D7b282EF968D26E9cB432617dF52519',
        abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
      });
      api.addCGToken('bitcoin', Number(latestRoundData.answer) / 1e8)
    },
  },
};

// const sdk = require('@defillama/sdk');
// const { sumTokensExport } = require('../helper/sumTokens');
// const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

// module.exports = {
//   methodology: "BTC collateral backing CBBTC. https://www.coinbase.com/cbbtc/proof-of-reserves",
//   bitcoin: {
//     tvl: sdk.util.sumChainTvls([
//       sumTokensExport({ owners: bitcoinAddressBook.coinbasebtc }),
//     ]),
//   },
// };
