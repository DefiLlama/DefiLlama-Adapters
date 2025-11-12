const { sumERC4626VaultsExport } = require('../helper/erc4626')

const LP_CONTRACT = '0x2fb5AAbf9bbc7303eB48D154F57de5cCe158FC2c';

module.exports = {
  methodology: "K-BIT Vault is a core component of the K-BIT ecosystem, enabling users to participate in the platform by depositing USDT and receiving KLP tokens in return.",
  klaytn: {
    tvl: sumERC4626VaultsExport({ vaults: [LP_CONTRACT], isOG4626: true }),
  },
}
