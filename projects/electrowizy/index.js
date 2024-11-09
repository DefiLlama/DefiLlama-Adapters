const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  polygon: {
    tvl: sumERC4626VaultsExport({ vaults: [ '0x663819aB31cB6204a2A732996549B702DeC38aa9'], balanceAbi: 'uint256:totalStaked', tokenAbi: 'address:stakingToken' }),
  }
}
