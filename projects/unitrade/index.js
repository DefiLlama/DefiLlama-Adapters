const sdk = require("../../sdk");
const abi = require("./abi.json");

const UNITRADE_ORDERBOOK = "0xC1bF1B4929DA9303773eCEa5E251fDEc22cC6828";

async function tvl(_, block) {
  //getting active orders length
  const activeOrdersLength = (
    await sdk.api.abi.call({
      target: UNITRADE_ORDERBOOK,
      block,
      abi: abi["abiGetActiveOrdersLength"],
    })
  ).output;
  //getting order ids based on active orders length
  const activeOrderIds = (
    await sdk.api.abi.multiCall({
      target: UNITRADE_ORDERBOOK,
      abi: abi["abiGetOrderId"],
      block,
      calls: [...Array(parseInt(activeOrdersLength))].map((_, index) => ({
        params: index,
      })),
    })
  ).output.map((call) => call.output);
  //getting active orders based on order ids
  const activeOrders = (
    await sdk.api.abi.multiCall({
      target: UNITRADE_ORDERBOOK,
      abi: abi["abiGetOrder"],
      block,
      calls: activeOrderIds.map((orderId) => ({
        params: orderId,
      })),
    })
  ).output.map((orderCall) => orderCall.output);
  //filtering out duplicate tokens 
  const uniqueLockedTokenAddresses = [
    ...new Set(activeOrders.map((order) => order.tokenIn)),
  ]
  //getting Unitrade orderbook balance of specified tokens
  let balances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: uniqueLockedTokenAddresses.map((address) => ({
        target: address,
        params: UNITRADE_ORDERBOOK,
      })),
      block
    })
  ).output;

  //formatting fetched data
  balances = balances.reduce((acc, item) => {
    return Object.assign(acc, { [item.input.target]: [item.output] });
  }, {});
  
  let ethBalance = (await sdk.api.eth.getBalance({target: UNITRADE_ORDERBOOK, block})).output;
  balances['0x0000000000000000000000000000000000000000'] = ethBalance;

  return balances;
}

module.exports = {
  name: "UniTrade",
  token: "TRADE",
  category: "dexes",
  start: 1603843200, // Oct-28-2020 00:00:00 PM +UTC
  tvl,
};
