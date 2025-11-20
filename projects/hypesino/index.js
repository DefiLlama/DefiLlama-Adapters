const { sumTokens } = require('../helper/unwrapLPs');

const CONTRACTS = {
  v1: '0xdD9776C41DDb6B1e968045733460F7868150dE49',
  v2: '0xfA07008373014D035E49064A5373EFb053228C87',
};

const abi = {
  accumulatedFees: "uint256:accumulatedFees",
  pendingExposure: "uint256:pendingExposure",
};

async function tvl(api) {
  const balances = await api.multiCall({
    calls: Object.values(CONTRACTS),
    abi: 'erc20:balanceOf',
    params: [api.address],
    permitFailure: true,
  });

  const fees = await api.multiCall({
    calls: Object.values(CONTRACTS),
    abi: abi.accumulatedFees,
    permitFailure: true,
  });

  let totalTvl = 0n;
  for (let i = 0; i < balances.length; i++) {
    const balance = BigInt(balances[i] || 0);
    const fee = BigInt(fees[i] || 0);
    const bankroll = balance - fee;
    if (bankroll > 0n) {
      totalTvl += bankroll;
    }
  }

  api.addGasToken(totalTvl.toString());
  return api.getBalances();
}

async function revenue(api) {
  const fees = await api.multiCall({
    calls: Object.values(CONTRACTS),
    abi: abi.accumulatedFees,
    permitFailure: true,
  });

  const totalRevenue = fees.reduce((acc, fee) => {
    return acc + BigInt(fee || 0);
  }, 0n);

  api.addGasToken(totalRevenue.toString());
  return api.getBalances();
}

module.exports = {
  methodology: 'Hypesino casino on HyperEVM. TVL = bankroll. Revenue = house edge.',
  hyperliquid: {
    tvl,
    revenue,
  },
  start: 1704067200,
  hallmarks: [
    [1704067200, "Hypesino V1 Launch"],
    [1730419200, "V2 Tiered Betting"],
  ],
};
