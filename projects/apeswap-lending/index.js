const {usdCompoundExports} = require('../helper/compound');
const methodologies = require('../helper/methodologies');

const unitroller_bsc = "0xad48b2c9dc6709a560018c678e918253a65df86e"

const abis = {
  oracle: "address:getRegistry",
  underlyingPrice: "function getPriceForUnderling(address cToken) view returns (uint256)",
}

const lendingMarket = usdCompoundExports(unitroller_bsc, "bsc", "0x34878F6a484005AA90E7188a546Ea9E52b538F6f", abis)


module.exports = {
      misrepresentedTokens: true,
  bsc:{
    tvl: lendingMarket.tvl,
    borrowed: lendingMarket.borrowed
  },
  methodology: methodologies.lendingMarket,
}