const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");

const AVN_API = require("avn-api");
const AVN_GATEWAY_URL = "https://mainnet.gateway.aventus.io/";

// suri required to access the Aventus gateway
const options = {
  suri: "0x83f2e0857dd7c8e94e5a13852135b9569ec3042c06a371ca866a1c3b074cf52c",
};
const API = new AVN_API(AVN_GATEWAY_URL, options);

// Fetch token price from CoinGecko
async function getTotalAvtBalance() {
  // Initialise Aventus Network Gateway API
  await API.init();
  const totalAvt = await api.query.getTotalAvt();
  return totalAvt;
}

// Fetch token price from CoinGecko
async function getAcctAvtBalance(account) {
  // Initialise Aventus Network Gateway API
  await API.init();
  let acctAVTbalance = await API.query.getAvtBalance(account);
  return acctAVTbalance;
}

// Fetch token price from CoinGecko
async function getTokenBalance(account, token_address) {
  // Initialise Aventus Network Gateway API
  await API.init();
  let token_balance = await API.query.getTokenBalance(account, token_address);
  return token_balance;
}

module.exports = {
  getTokenBalance,
  getAcctAvtBalance,
  getTotalAvtBalance,
};
