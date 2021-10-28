const retry = require("async-retry");
const axios = require("axios");
const utils = require("./helper/utils");
const web3 = require("./config/web3.js");
const BigNumber = require("bignumber.js");
const {
  DEC_18,
  xaaveaAddr,
  xaavebAddr,
  xalphaaAddr,
  alphaAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  kncAddr,
  xsnxaAddr,
  xsnxaAdminAddr,
  xsnxaTradeAccountingAddr,
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpdAddr,
  xu3lpeAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  wbtcAddr,
  wethAddr,
} = require("./config/xtoken/constants");
const xAAVE = require("./config/xtoken/xAAVE.json");
const xALPHA = require("./config/xtoken/xALPHA.json");
const xBNT = require("./config/xtoken/xBNT.json");
const xINCH = require("./config/xtoken/xINCH.json");
const xKNC = require("./config/xtoken/xKNC.json");
const xSNX = require("./config/xtoken/xSNX.json");
const xSNXTradeAccountingContract = require("./config/xtoken/xSNXTradeAccountingContract.json");
const xU3LP = require("./config/xtoken/xU3LP.json");
const ERC20 = require("./config/xtoken/ERC20.json");
const SNX = require("./config/xtoken/SNX.json");

async function fetch() {
  const xaaveaCtr = new web3.eth.Contract(xAAVE, xaaveaAddr);
  const xaavebCtr = new web3.eth.Contract(xAAVE, xaavebAddr);
  const xalphaaCtr = new web3.eth.Contract(xALPHA, xalphaaAddr);
  const xbntaCtr = new web3.eth.Contract(xBNT, xbntaAddr);
  const xinchaCtr = new web3.eth.Contract(xINCH, xinchaAddr);
  const xinchbCtr = new web3.eth.Contract(xINCH, xinchbAddr);
  const xkncaCtr = new web3.eth.Contract(xKNC, xkncaAddr);
  const xkncbCtr = new web3.eth.Contract(xKNC, xkncbAddr);
  const xsnxaCtr = new web3.eth.Contract(xSNX, xsnxaAddr);
  const xu3lpaCtr = new web3.eth.Contract(xU3LP, xu3lpaAddr);
  const xu3lpbCtr = new web3.eth.Contract(xU3LP, xu3lpbAddr);
  const xu3lpcCtr = new web3.eth.Contract(xU3LP, xu3lpcAddr);
  const xu3lpdCtr = new web3.eth.Contract(xU3LP, xu3lpdAddr);
  const xu3lpeCtr = new web3.eth.Contract(xU3LP, xu3lpeAddr);
  const xu3lpfCtr = new web3.eth.Contract(xU3LP, xu3lpfAddr);
  const xu3lpgCtr = new web3.eth.Contract(xU3LP, xu3lpgAddr);
  const xu3lphCtr = new web3.eth.Contract(xU3LP, xu3lphAddr);
  const xsnxaTradeAccountingCtr = new web3.eth.Contract(
    xSNXTradeAccountingContract,
    xsnxaTradeAccountingAddr
  );
  const ethrsi6040Ctr = new web3.eth.Contract(ERC20, ethrsi6040Addr);
  const snxCtr = new web3.eth.Contract(SNX, snxAddr);

  const priceAave = await utils.getPricesfromString("aave");
  const priceAlpha = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${alphaAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

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

  const priceSnx = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${snxAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceEthrsi6040 = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${ethrsi6040Addr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceSusd = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x57ab1ec28d129707052df4df418d58a2d46d5f51&vs_currencies=usd`
      )
  );

  const priceWeth = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${wethAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const priceWbtc = await retry(
    async (bail) =>
      await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${wbtcAddr}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )
  );

  const xaaveaTvlRaw = await xaaveaCtr.methods.getFundHoldings().call();
  const xaavebTvlRaw = await xaavebCtr.methods.getFundHoldings().call();

  const xaaveaTvlToken = new BigNumber(xaaveaTvlRaw).div(DEC_18).toFixed(2);
  const xaavebTvlToken = new BigNumber(xaavebTvlRaw).div(DEC_18).toFixed(2);

  const xbntaStakedRaw = await xbntaCtr.methods.totalAllocatedNav().call();
  const xbntaBufferRaw = await xbntaCtr.methods.getBufferBalance().call();
  const xbntaPendingRaw = await xbntaCtr.methods
    .getRewardsContributionToNav()
    .call();

  const xbntaStakedToken = new BigNumber(xbntaStakedRaw).div(DEC_18).toFixed(2);
  const xbntaBufferToken = new BigNumber(xbntaBufferRaw).div(DEC_18).toFixed(2);
  const xbntaPendingToken = new BigNumber(xbntaPendingRaw)
    .div(DEC_18)
    .toFixed(2);

  const xinchaTvlRaw = await xinchaCtr.methods.getNav().call();
  const xinchbTvlRaw = await xinchbCtr.methods.getNav().call();

  const xinchaTvlToken = new BigNumber(xinchaTvlRaw).div(DEC_18).toFixed(2);
  const xinchbTvlToken = new BigNumber(xinchbTvlRaw).div(DEC_18).toFixed(2);

  const xkncaTvlRaw = await xkncaCtr.methods.getFundKncBalanceTwei().call();
  const xkncbTvlRaw = await xkncbCtr.methods.getFundKncBalanceTwei().call();

  const xkncaTvlToken = new BigNumber(xkncaTvlRaw).div(DEC_18).toFixed(2);
  const xkncbTvlToken = new BigNumber(xkncbTvlRaw).div(DEC_18).toFixed(2);

  // xU3LP
  const xu3lpaTvlRaw = await xu3lpaCtr.methods.getNav().call();
  const xu3lpbTvlRaw = await xu3lpbCtr.methods.getNav().call();
  const xu3lpcTvlRaw = await xu3lpcCtr.methods.getNav().call();
  const xu3lpdTvlRaw = await xu3lpdCtr.methods.getNav().call();
  const xu3lpeTvlRaw = await xu3lpeCtr.methods.getNav().call();
  const xu3lpfTvlRaw = await xu3lpfCtr.methods.getNav().call();
  const xu3lpgTvlRaw = await xu3lpgCtr.methods.getNav().call();
  const xu3lphTvlRaw = await xu3lphCtr.methods.getNav().call();

  const xu3lpaTvl = Number(new BigNumber(xu3lpaTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpbTvl = Number(new BigNumber(xu3lpbTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpcTvl = Number(new BigNumber(xu3lpcTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpdTvl =
    Number(new BigNumber(xu3lpdTvlRaw).div(DEC_18).toFixed(2)) *
    priceWeth.data["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"].usd;
  const xu3lpeTvl =
    Number(new BigNumber(xu3lpeTvlRaw).div(DEC_18).toFixed(2)) *
    priceWbtc.data["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"].usd;
  const xu3lpfTvl = Number(new BigNumber(xu3lpfTvlRaw).div(DEC_18).toFixed(2));
  const xu3lpgTvl = Number(new BigNumber(xu3lpgTvlRaw).div(DEC_18).toFixed(2));
  const xu3lphTvl = Number(new BigNumber(xu3lphTvlRaw).div(DEC_18).toFixed(2));

  // xALPHAa
  const xalphaaTvlRaw = await xalphaaCtr.methods.getNav().call();
  const xalphaaTvl =
    Number(new BigNumber(xalphaaTvlRaw).div(DEC_18).toFixed(2)) *
    priceAlpha.data["0xa1faa113cbe53436df28ff0aee54275c13b40975"].usd;

  console.log("xalphaaTvl : ", xalphaaTvl);

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

  // xSNXa TVL is SNX + ETH + ETHRSI6040 - sUSD
  const xsnxaSnxRaw = await xsnxaTradeAccountingCtr.methods
    .getSnxBalance()
    .call();
  const xsnxaSnx = new BigNumber(xsnxaSnxRaw).div(DEC_18).toFixed(2);
  const xsnxaSnxTvl =
    xsnxaSnx * priceSnx.data["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"].usd;

  const xsnxaEthRaw = await xsnxaTradeAccountingCtr.methods
    .getEthBalance()
    .call();
  const xsnxaEth = new BigNumber(xsnxaEthRaw).div(DEC_18).toFixed(2);
  const xsnxaEthTvl =
    xsnxaEth * priceWeth.data["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"].usd;

  const xsnxaEthrsi6040Raw = await ethrsi6040Ctr.methods
    .balanceOf(xsnxaAdminAddr)
    .call();
  const xsnxaEthrsi6040 = new BigNumber(xsnxaEthrsi6040Raw)
    .div(DEC_18)
    .toFixed(2);
  const xsnxaEthrsi6040Tvl =
    xsnxaEthrsi6040 *
    priceEthrsi6040.data["0x93e01899c10532d76c0e864537a1d26433dbbddb"].usd;

  const xsnxaSusdRaw = await snxCtr.methods
    .debtBalanceOf(xsnxaAdminAddr, web3.utils.asciiToHex("sUSD"))
    .call();
  const xsnxaSusd = new BigNumber(xsnxaSusdRaw).div(DEC_18).toFixed(2);
  const xsnxaSusdTvl =
    xsnxaSusd *
    priceSusd.data["0x57ab1ec28d129707052df4df418d58a2d46d5f51"].usd;

  const xsnxaTvl =
    xsnxaSnxTvl + xsnxaEthTvl + xsnxaEthrsi6040Tvl - xsnxaSusdTvl;

  const tvl =
    xaaveaTvl +
    xaavebTvl +
    xalphaaTvl +
    xbntaTvl +
    xinchaTvl +
    xinchbTvl +
    xkncaTvl +
    xkncbTvl +
    xsnxaTvl +
    xu3lpaTvl +
    xu3lpbTvl +
    xu3lpcTvl +
    xu3lpdTvl +
    xu3lpeTvl +
    xu3lpfTvl +
    xu3lpgTvl +
    xu3lphTvl;

  return tvl;
}

module.exports = {
  fetch,
  methodology: `TVL includes deposits made to the available strategies at xToken Markets.`,
};
