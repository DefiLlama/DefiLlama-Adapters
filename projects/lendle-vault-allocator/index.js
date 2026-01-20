const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const vaults = [
  "0xE12EED61E7cC36E4CF3304B8220b433f1fD6e254",
  "0x5A285484126D4e1985AC2cE0E1869D6384027727",
  "0xf36a57369362eB1553f24C8ad50873723E6e1173"
];

module.exports = {
  doublecounted: true,
  methodology: 'TVL accounts for all assets deposited into the Vaults.',
  mantle: { tvl: sumERC4626VaultsExport2({ vaults }) },
};