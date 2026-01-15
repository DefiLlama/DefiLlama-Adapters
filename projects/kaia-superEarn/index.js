const { sumERC4626VaultsExport } = require('../helper/erc4626')

// https://docs.superearn.io/en/developers/smart-contracts
module.exports = {
  klaytn: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        '0x3B37DB3AC2a58f2daBA1a7d66d023937d61Fc95b', // earnUSDT origin
        '0x4E4654cE4Ca7ff0ba66a0A4a588A4bd55A6f9A33', // earnUSDT cooldown
      ],
      isOG4626: true,
    }),
  }
}