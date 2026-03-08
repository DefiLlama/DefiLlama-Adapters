const abi = {
    "abiGetActiveOrdersLength": "uint256:getActiveOrdersLength",
    "abiGetOrderId": "function getActiveOrderId(uint256 index) view returns (uint256)",
    "abiGetOrder": "function getOrder(uint256 orderId) view returns (uint8 orderType, address maker, address tokenIn, address tokenOut, uint256 amountInOffered, uint256 amountOutExpected, uint256 executorFee, uint256 totalEthDeposited, uint8 orderState, bool deflationary)"
  };
const gatewayAbi = {
    "address": "0x64B17B166090B8F9BA19C13Bf8D5dA951b2d653D",
    "abi": "function tokens(uint256) view returns (address tokenAddress, uint8 releaseMethod)"
  };
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs');

const UNITRADE_ORDERBOOK = "0xC1bF1B4929DA9303773eCEa5E251fDEc22cC6828";
const UNITRADE_BRIDGE = "0x64B17B166090B8F9BA19C13Bf8D5dA951b2d653D";

async function tvl(api) {
  const tokensAndOwners = [
    [nullAddress, UNITRADE_BRIDGE],
    [nullAddress, UNITRADE_ORDERBOOK],
  ]

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
  
  //fetching gateway tokens dynamically
  const gatewayTokens = [];
  let i = 0;
  const batchSize = 20;

  while (true) {
    const batch = await api.multiCall({
      abi: gatewayAbi.abi,
      calls: Array.from({ length: batchSize }, (_, k) => ({
        target: UNITRADE_BRIDGE,
        params: i + k,
      })),
      permitFailure: true,
    });

    const validBatch = batch.filter((item) => item !== null);

    validBatch.forEach((item) => gatewayTokens.push(item.tokenAddress));

    // Stop if we encounter a failed call (end of array)
    if (validBatch.length < batchSize) break;

    i += batchSize;
    // Safety break to prevent infinite loops
    if (i > 2000) break;
  }

  //fetching gateway contract balance of the gateway tokens
  gatewayTokens.forEach((token) => tokensAndOwners.push([token, UNITRADE_BRIDGE]))
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  ethereum: { tvl },
};
