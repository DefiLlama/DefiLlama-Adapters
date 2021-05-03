const retry = require("async-retry");
const axios = require("axios");
const utils = require("./helper/utils");
const web3 = require('./config/web3.js');
const BigNumber = require("bignumber.js");
const {
  xaaveaAddr,
  xaavebAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  kncAddr,
  xsnxaAddr,
} = require("./config/xtoken/constants");
const xAAVE = require("./config/xtoken/xAAVE.json");
const xINCH = require("./config/xtoken/xINCH.json");
const xKNC = require("./config/xtoken/xKNC.json");
const xSNX = require("./config/xtoken/xSNX.json");
const xBNT = require("./config/xtoken/xBNT.json");

async function fetch() {
  const xaaveaCtr = new web3.eth.Contract(xAAVE, xaaveaAddr);
  const xaavebCtr = new web3.eth.Contract(xAAVE, xaavebAddr);
  const xinchaCtr = new web3.eth.Contract(xINCH, xinchaAddr);
  const xinchbCtr = new web3.eth.Contract(xINCH, xinchbAddr);
  const xkncaCtr = new web3.eth.Contract(xKNC, xkncaAddr);
  const xkncbCtr = new web3.eth.Contract(xKNC, xkncbAddr);
  const xsnxaCtr = new web3.eth.Contract(xSNX, xsnxaAddr);
  const xbntaCtr = new web3.eth.Contract(xBNT, xbntaAddr);

  const xaaveaTvlRaw = await xaaveaCtr.methods.getFundHoldings().call();
  const xaavebTvlRaw = await xaavebCtr.methods.getFundHoldings().call();

  const xaaveaTvlToken = new BigNumber(xaaveaTvlRaw).div(10 ** 18).toFixed(2);
  const xaavebTvlToken = new BigNumber(xaavebTvlRaw).div(10 ** 18).toFixed(2);

  const xbntaStakedRaw = await xbntaCtr.methods.totalAllocatedNav().call();
  const xbntaBufferRaw = await xbntaCtr.methods.getBufferBalance().call();
  const xbntaPendingRaw = await xbntaCtr.methods
    .getRewardsContributionToNav()
    .call();

  const xbntaStakedToken = new BigNumber(xbntaStakedRaw)
    .div(10 ** 18)
    .toFixed(2);
  const xbntaBufferToken = new BigNumber(xbntaBufferRaw)
    .div(10 ** 18)
    .toFixed(2);
  const xbntaPendingToken = new BigNumber(xbntaPendingRaw)
    .div(10 ** 18)
    .toFixed(2);

  const xinchaTvlRaw = await xinchaCtr.methods.getNav().call();
  const xinchbTvlRaw = await xinchbCtr.methods.getNav().call();

  const xinchaTvlToken = new BigNumber(xinchaTvlRaw).div(10 ** 18).toFixed(2);
  const xinchbTvlToken = new BigNumber(xinchbTvlRaw).div(10 ** 18).toFixed(2);

  const xkncaTvlRaw = await xkncaCtr.methods.getFundKncBalanceTwei().call();
  const xkncbTvlRaw = await xkncbCtr.methods.getFundKncBalanceTwei().call();

  const xkncaTvlToken = new BigNumber(xkncaTvlRaw).div(10 ** 18).toFixed(2);
  const xkncbTvlToken = new BigNumber(xkncbTvlRaw).div(10 ** 18).toFixed(2);

  const xsnxaTotalSupplyRaw = await xsnxaCtr.methods.totalSupply().call();
  const xsnxaTotalSupply = new BigNumber(xsnxaTotalSupplyRaw)
    .div(10 ** 18)
    .toFixed(2);

  const priceAave = await utils.getPricesfromString("aave");
  const priceBnt = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${bntAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );
  const priceOneInch = await utils.getPricesfromString("1inch");
  const priceKnc = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${kncAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );
  const priceXsnxa = await retry(
    async (bail) =>
      await axios.get(
        "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x2367012aB9c3da91290F71590D5ce217721eEfE4&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
      )
  );

  const xaaveaTvl = xaaveaTvlToken * priceAave.data.aave.usd;
  const xaavebTvl = xaavebTvlToken * priceAave.data.aave.usd;

  const xbntaStakedTvl =
    xbntaStakedToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaBufferTvl =
    xbntaBufferToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaPendingTvl =
    xbntaPendingToken *
    priceBnt.data["0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c"].usd;

  const xbntaTvl = xbntaStakedTvl + xbntaBufferTvl + xbntaPendingTvl;

  const xinchaTvl = xinchaTvlToken * priceOneInch.data["1inch"].usd;
  const xinchbTvl = xinchbTvlToken * priceOneInch.data["1inch"].usd;

  const xkncaTvl =
    xkncaTvlToken *
    priceKnc.data["0xdd974d5c2e2928dea5f71b9825b8b646686bd200"].usd;
  const xkncbTvl =
    xkncbTvlToken *
    priceKnc.data["0xdd974d5c2e2928dea5f71b9825b8b646686bd200"].usd;

  const xsnxaTvl =
    xsnxaTotalSupply *
    priceXsnxa.data["0x2367012ab9c3da91290f71590d5ce217721eefe4"].usd;

  const tvl =
    xaaveaTvl +
    xaavebTvl +
    xbntaTvl +
    xinchaTvl +
    xinchbTvl +
    xkncaTvl +
    xkncbTvl +
    xsnxaTvl;

  return tvl;
}

module.exports = {
  fetch,
};
