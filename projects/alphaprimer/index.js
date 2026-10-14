const { sumERC4626VaultsExport2 } = require('../helper/erc4626');

const config = {
  arbitrum: {
    vaults: ['0x87Ef5c25203886b1026ad907E7f84fBAABdF1fa9'],
  },
};

Object.keys(config).forEach((chain) => {
  const { vaults } = config[chain];
  module.exports[chain] = { tvl: sumERC4626VaultsExport2({ vaults }) };
});

module.exports.methodology = 'TVL is the total USDC deposited in the AlphaPrimer vault, read on-chain via totalAssets().';
