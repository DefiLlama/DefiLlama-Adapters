const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports, methodology, } = require("../helper/compound");

const blacklist = [
  '0x4002a65e13f87C897B8018Fd7329af17339346ba',
  '0xa2d59cdc396574da0f0bc97a3e883b9fb72f6b88',
  '0xa10faa75589bf01af220b2d6acb91785129443f0',
  '0x1611Ac5e87aC082e016d60dB63eccb50F45B8b4e',
  '0x438DDA002CaDBe95F72b7b9acB1FEf4782418566',
];

module.exports = {
  methodology,
  ethpow: compoundExports("0x5e496e7F241B13c514A78B7E840bc3cC744D7215", "ethpow", "0xb9e008f2C039fB994C8adD806F8aF709899aA95e", ADDRESSES.ethereum.WETH, undefined, undefined, { blacklistedTokens: blacklist })
} 