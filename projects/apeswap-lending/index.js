const sdk = require("@defillama/sdk");
const {usdCompoundExports} = require('../helper/compound');
const { transformBscAddress } = require("../helper/portedTokens.js");

const BANANA_TOKEN = '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95'
const unitroller_bsc = "0xad48b2c9dc6709a560018c678e918253a65df86e"


const abis = {
  oracle: {"constant":true,"inputs":[],"name":"getRegistry","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
  underlyingPrice: {"constant":true,"inputs":[{"internalType":"address","name":"cToken","type":"address"}],"name":"getPriceForUnderling","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
}

const lendingMarket = usdCompoundExports(unitroller_bsc, "bsc", "0x34878F6a484005AA90E7188a546Ea9E52b538F6f", abis)


module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  bsc:{
    tvl: lendingMarket.tvl,
    borrowed: lendingMarket.borrowed
  },
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
}