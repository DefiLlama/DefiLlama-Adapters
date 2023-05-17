//Get realtime price of BTC and ETH
const axios = require("axios");
const {
  getAppGlobalState,
  getAccountInfo,
} = require("../helper/chain/algorand");

async function getPrices() {
  //Gets current price data from coingecko
  const btc_price_query = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );
  const eth_price_query = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );

  const usdc_price_query = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
  );

  const usdt_price_query = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"
  );

  const btcPrice = btc_price_query.data.bitcoin.usd;
  const ethPrice = eth_price_query.data.ethereum.usd;
  const usdcPrice = usdc_price_query.data["usd-coin"].usd;
  const usdtPrice = usdt_price_query.data.tether.usd;

  return {
    btcPrice: btcPrice,
    ethPrice: ethPrice,
    usdcPrice: usdcPrice,
    usdtPrice: usdtPrice,
  };
}
async function lpTokenPostion(asaId, appId, basketAddress) {
  const poolGlobalState = await getAppGlobalState(appId);

  //A & B represent the two tokens in the LP pool, Token A is always the ASA with the lowest ID

  const balanceA = poolGlobalState.A;
  const balanceB = poolGlobalState.B;
  const lpCirculatingSupply = poolGlobalState.L;

  const ratioA = balanceA / lpCirculatingSupply;
  const ratioB = balanceB / lpCirculatingSupply;

  //get basket balance of lp token
  const basketBalance = await getAccountInfo(basketAddress);

  const basketLpBalanceObject = basketBalance.assets;
  let basketLpBalance;

  for (let lpAsset of basketLpBalanceObject) {
    if (lpAsset["asset-id"] === asaId) {
      basketLpBalance = lpAsset.amount;
    }
  }
  const positionA = basketLpBalance * ratioA;
  const positionB = basketLpBalance * ratioB;

  return { positionA: positionA, positionB: positionB };
}

module.exports = {
  lpTokenPostion,
  getPrices,
};
