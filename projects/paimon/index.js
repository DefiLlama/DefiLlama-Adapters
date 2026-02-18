const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

module.exports = {
  bsc: {
    tvl: sumERC4626VaultsExport2({ vaults: ['0x8505c32631034A7cE8800239c08547e0434EdaD9']}),
  },
};
