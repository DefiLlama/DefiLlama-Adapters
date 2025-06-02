const abi = require("./abi.json");
const gatewayAbi = require("./gateway.abi.json");
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs');

const UNITRADE_ORDERBOOK = "0xC1bF1B4929DA9303773eCEa5E251fDEc22cC6828";
const UNITRADE_BRIDGE = "0x64B17B166090B8F9BA19C13Bf8D5dA951b2d653D";

const tokensAndOwners = [
  [nullAddress, UNITRADE_BRIDGE],
  [nullAddress, UNITRADE_ORDERBOOK],
]

async function tvl(api) {
  const activeOrderIds = await api.fetchList({ lengthAbi: abi["abiGetActiveOrdersLength"], itemAbi: abi["abiGetOrderId"], target: UNITRADE_ORDERBOOK })

  //getting active orders based on order ids
  const activeOrders = await api.multiCall({
    target: UNITRADE_ORDERBOOK,
    abi: abi["abiGetOrder"],
    calls: activeOrderIds,
  })

  //filtering out duplicate tokens
  const uniqueLockedTokenAddresses = [
    ...new Set(activeOrders.map((order) => order.tokenIn)),
  ];
  uniqueLockedTokenAddresses.map((address) => tokensAndOwners.push([address, UNITRADE_ORDERBOOK]))
  
  //fetching first 10 gateway tokens and formatting output (temp fix until we can fetch addedTokens.length )
  const gatewayTokens = (
    await api.multiCall({
      abi: gatewayAbi.abi,
      calls: new Array(10).fill(null).map((_, index) => ({
        target: UNITRADE_BRIDGE,
        params: index,
      })),
      permitFailure: true,
    })
  )
    .filter((item) => item !== null)
    .map((item) => item.tokenAddress);
  //fetching gateway contract balance of the gateway tokens
  gatewayTokens.forEach((token) => tokensAndOwners.push([token, UNITRADE_BRIDGE]))
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  ethereum: { tvl },
};
