const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

const AAVE_ADDRESSES_PROVIDER_REGISTRY = "0x90C5055530C0465AbB077FA016a3699A3F53Ef99";
const AAVE_POOL_DATA_PROVIDER = "0x2A0979257105834789bC6b9E1B00446DFbA8dFBa";

module.exports = {
  base: aaveExports("base", AAVE_ADDRESSES_PROVIDER_REGISTRY, undefined, [AAVE_POOL_DATA_PROVIDER], { v3: true }),
  methodology: methodologies.lendingMarket
}
