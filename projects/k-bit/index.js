const { sumERC4626VaultsExport } = require('../helper/erc4626')

const LP_CONTRACT = '0x2fb5AAbf9bbc7303eB48D154F57de5cCe158FC2c';

module.exports = {
  methodology: "TVL is calculated as the total underlying assets in the ERC4626 LP vault on Klaytn.",
  klaytn: {
    tvl: sumERC4626VaultsExport({ vaults: [LP_CONTRACT], isOG4626: true }),
  },
}
