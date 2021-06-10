const web3 = require("./config/web3.js");
const utils = require("./helper/utils");

var usdc = {
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  decimals: 6,
};
var susd = {
  address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
  decimals: 18,
};
var dai = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  decimals: 18,
};

async function fetch() {
  var tokens = [dai, usdc, susd];
  var tvl = 0;
  var pool = "0xb0fa2beee3cf36a7ac7e99b885b48538ab364853";
  await Promise.all(
    tokens.map(async (token) => {
      let tokenBalance = await utils.returnBalance(token.address, pool);
      tvl += parseFloat(tokenBalance);
    })
  );
  return tvl;
}

module.exports = {
  fetch,
};
