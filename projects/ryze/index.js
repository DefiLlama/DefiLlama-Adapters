const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const binaryVaultContract = "0x4d3847da139d423ae9569A9E6E4dd5b7405093FA";
const feeWallet = '0x04EC26b47E48F60740c803ba93b1a6C9e83cafAa'

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owners: [binaryVaultContract,], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]}),
  },
};
