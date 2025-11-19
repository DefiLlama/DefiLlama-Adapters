const { sumTokens2 } = require('../helper/unwrapLPs');

// HybridDebtMarket contract address (same on all chains via CREATE2)
const MARKETPLACE_CONTRACT = '0x3333cb20c3C7491CA9fa7281a8B418512d7a9a22';

async function tvl(api) {
  // Query order IDs from contract state
  const nextSellOrderId = await api.call({
    target: MARKETPLACE_CONTRACT,
    abi: 'uint256:nextSellOrderId',
  });

  const nextBuyOrderId = await api.call({
    target: MARKETPLACE_CONTRACT,
    abi: 'uint256:nextBuyOrderId',
  });

  const tokens = new Set();

  // Query all sell orders
  const sellOrderCalls = [];
  for (let i = 1; i < Math.min(nextSellOrderId, 100); i++) {
    sellOrderCalls.push({ params: [i] });
  }

  if (sellOrderCalls.length > 0) {
    const sellOrders = await api.multiCall({
      target: MARKETPLACE_CONTRACT,
      abi: 'function sellOrders(uint256) view returns (uint256 orderId, address seller, address debtToken, address paymentToken, uint256 totalAmount, uint256 filledAmount, uint256 pricePerToken, bool active, uint256 createdAt, uint256 expiresAt)',
      calls: sellOrderCalls,
      permitFailure: true,
    });

    sellOrders.forEach((order) => {
      if (order && order.active) {
        tokens.add(order.debtToken);
        tokens.add(order.paymentToken);
      }
    });
  }

  // Query all buy orders
  const buyOrderCalls = [];
  for (let i = 1; i < Math.min(nextBuyOrderId, 100); i++) {
    buyOrderCalls.push({ params: [i] });
  }

  if (buyOrderCalls.length > 0) {
    const buyOrders = await api.multiCall({
      target: MARKETPLACE_CONTRACT,
      abi: 'function buyOrders(uint256) view returns (uint256 orderId, address buyer, address debtToken, address paymentToken, uint256 totalAmount, uint256 filledAmount, uint256 pricePerToken, uint256 depositedFunds, bool active, uint256 createdAt, uint256 expiresAt)',
      calls: buyOrderCalls,
      permitFailure: true,
    });

    buyOrders.forEach((order) => {
      if (order && order.active) {
        tokens.add(order.debtToken);
        tokens.add(order.paymentToken);
      }
    });
  }

  if (tokens.size === 0) {
    return {}; // No orders yet
  }

  // Sum balances for all discovered tokens
  return sumTokens2({
    api,
    owner: MARKETPLACE_CONTRACT,
    tokens: Array.from(tokens),
    permitFailure: true,
  });
}

module.exports = {
  methodology: "Counts all debt tokens and payment tokens locked in active buy and sell orders on the HybridDebtMarket orderbook",
  ethereum: { tvl },
  avax: { tvl },
  plasma: { tvl },
  bsc: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  linea: { tvl },
  sonic: { tvl },
  unichain: { tvl },
  swellchain: { tvl },
  tac: { tvl },
  bob: { tvl },
  berachain: { tvl },
};
