const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const gatewayAbi = require("./gateway.abi.json");

const UNITRADE_ORDERBOOK = "0xC1bF1B4929DA9303773eCEa5E251fDEc22cC6828";
const UNITRADE_BRIDGE = "0x64B17B166090B8F9BA19C13Bf8D5dA951b2d653D";

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
  ];
  //getting Unitrade orderbook balance of specified tokens
  let balances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: uniqueLockedTokenAddresses.map((address) => ({
        target: address,
        params: UNITRADE_ORDERBOOK,
      })),
      block,
    })
  ).output;

  //formatting fetched data
  balances = balances.reduce((acc, item) => {
    return Object.assign(acc, { [item.input.target]: item.output });
  }, {});
  //fetching first 10 gateway tokens and formatting output (temp fix until we can fetch addedTokens.length )
  const gatewayTokens = (
    await sdk.api.abi.multiCall({
      abi: gatewayAbi.abi.filter((item) => item.name === "tokens")[0],
      calls: new Array(10).fill(null).map((_, index) => ({
        target: UNITRADE_BRIDGE,
        params: index,
      })),
    })
  ).output
    .filter((item) => item.output !== null)
    .map((item) => item.output.tokenAddress);
  //fetching gateway contract balance of the gateway tokens
  const gatewayBalances = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: gatewayTokens.map((address) => ({
        target: address,
        params: UNITRADE_BRIDGE,
      })),
      block,
    })
  );
  //combining balance from orderbook and gateway
  sdk.util.sumMultiBalanceOf(balances, gatewayBalances, true)
  let ethBalanceOrderbook = (
    await sdk.api.eth.getBalance({ target: UNITRADE_ORDERBOOK, block })
  ).output;
  let ethBalanceGateway = (
    await sdk.api.eth.getBalance({ target: UNITRADE_BRIDGE, block })
  ).output;
  const combinedETHBalances =
    parseInt(ethBalanceGateway) + parseInt(ethBalanceOrderbook);

  balances["0x0000000000000000000000000000000000000000"] = combinedETHBalances.toFixed(0);
  
  return balances;
}

module.exports = {
  ethereum:{tvl},
};
