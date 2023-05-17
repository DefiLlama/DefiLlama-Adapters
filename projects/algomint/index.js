const { tokens } = require("../helper/chain/algorand");

const { getPrices, lpTokenPostion } = require("./utils");

//Algomint Basket contracts where the liquidty is held
const goUsdBasketAddress =
  "B7GJK5XWIYRM7Y5ZBSLHYGQFOWMBRNCITBL37U6HMXETTA37BRJVLF7XRM";
const goBtcBasketAddress =
  "OYJM6HVQESRPVFMMGPXA6AL6T4JP5U25J6IQ7UKA6I3NC7VRSH6H3F7KDI";
const goEthBasketAddress =
  "72BMR3TYPOLPNUEUL6FTY5ZE4SQQ7KZ2PE5QRTA4Z2M76IEFA72A24NXGQ";

//The following pool ID's are the PACT LP pool contracts
const usdcPoolId = 885102197;
const usdtPoolId = 1081978547;
const wBtcPoolId = 1058934586;
const wEthPoolId = 1058935016;

async function tvl() {
  //Returns the position of the LP token.
  const usdcPostion = await lpTokenPostion(
    tokens.usdcGoUsdLp,
    usdcPoolId,
    goUsdBasketAddress
  );

  const usdtPosition = await lpTokenPostion(
    tokens.usdtGoUsdLp,
    usdtPoolId,
    goUsdBasketAddress
  );

  const wBtcPosition = await lpTokenPostion(
    tokens.wBtcGoBtcLp,
    wBtcPoolId,
    goBtcBasketAddress
  );

  const wEthPosition = await lpTokenPostion(
    tokens.wEthGoEthLp,
    wEthPoolId,
    goEthBasketAddress
  );

  //Function gets current market prices from coingecko
  const marketPrices = await getPrices();
  //positionA is USDC in the LP
  const usdcTvlvalue =
    (usdcPostion.positionA / 10 ** 6) * marketPrices.usdcPrice;
  //positionA is USDT in the LP
  const usdtTvlValue =
    (usdtPosition.positionA / 10 ** 6) * marketPrices.usdtPrice;
  //positionB is wBTC in the LP
  const wBtcTvlValue =
    (wBtcPosition.positionB / 10 ** 8) * marketPrices.btcPrice;
  //positionB is wEth in the LP
  const wEthTvlValue =
    (wEthPosition.positionB / 10 ** 8) * marketPrices.ethPrice;
  //Returns total TVL in USD
  return usdcTvlvalue + usdtTvlValue + wBtcTvlValue + wEthTvlValue;
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};
