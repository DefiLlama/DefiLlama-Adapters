const { getTokenPrices, getLiquidStakingAddress } = require("../helper/hatom/hatom-graph");
const {
   getLiquidStakingCashReserve,
} = require("../helper/hatom/on-chain");

const ADDRESSES = require('../helper/coreAssets.json');
const BigNumber = require("bignumber.js");


const tlv = async () => {
   // Fetching data off chain
   const [tokenPrices, liquidStakingAddress] = await Promise.all([
      getTokenPrices(),
      getLiquidStakingAddress()
   ]);

   // Fetching data on chain
   const liquidStakingCashReserve = await getLiquidStakingCashReserve(liquidStakingAddress)

   // Formatting data
   const liquidStakingCashReserveUSD = BigNumber(liquidStakingCashReserve)
      .dividedBy(1e18)
      .multipliedBy(tokenPrices?.EGLD || 0)

   return { [ADDRESSES.ethereum.USDC]: liquidStakingCashReserveUSD.multipliedBy(1e6).toNumber() }
};

module.exports = {
   misrepresentedTokens: true,
   timetravel: false,
   elrond: {
      tvl: tlv,
   },
};
