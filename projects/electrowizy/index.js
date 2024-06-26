const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  polygon: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x41692d4141A98401F3F0CB729D4886AcBD811a66'], balanceAbi: 'uint256:totalStaked', tokenAbi: 'address:stakingToken' }),
  }
}