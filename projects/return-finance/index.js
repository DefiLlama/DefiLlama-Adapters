const { sumERC4626VaultsExport } = require("../helper/erc4626")

module.exports = {
  doublecounted: true,
};

const config = {
  ethereum: ['0xFD360A096E4a4c3C424fc3aCd85da8010D0Db9a5', '0x201254227f9fE57296C257397Be6c617389a8cCb'],
  avax: ['0x3B6385493a1d4603809dDbaE647200eF8baA53F5'],
  polygon: ['0x3B6385493a1d4603809dDbaE647200eF8baA53F5'],
  base: ['0x3B6385493a1d4603809dDbaE647200eF8baA53F5'],
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: config[chain], isOG4626: true, })
  }
});
