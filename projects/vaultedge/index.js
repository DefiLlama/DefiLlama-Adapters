const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  base: {
    adminContract: "0x83a52f623dcf358012eED9bA6E49D4e0695693dE",
    psm: "0x96de787502E64c5a30653a3CBE73F4B412F96877",
  },
};

async function tvl(api) {
  const { adminContract, psm } = config[api.chain];

  // Get all valid collateral addresses from AdminContract
  const collAddresses = await api.call({
    abi: "address[]:getValidCollateral",
    target: adminContract,
  });

  // Get pool addresses from AdminContract
  const activePool = await api.call({
    abi: "address:activePool",
    target: adminContract,
  });
  const defaultPool = await api.call({
    abi: "address:defaultPool",
    target: adminContract,
  });
  const stabilityPool = await api.call({
    abi: "address:stabilityPool",
    target: adminContract,
  });
  const debtToken = await api.call({
    abi: "address:debtToken",
    target: adminContract,
  });

  // 1. Collateral tokens across ActivePool, DefaultPool, and StabilityPool
  //    ActivePool: collateral backing open vessels
  //    DefaultPool: collateral from liquidations pending redistribution
  //    StabilityPool: collateral gains from liquidations
  await sumTokens2({
    api,
    tokens: collAddresses,
    owners: [activePool, defaultPool, stabilityPool],
  });

  // 2. USDVE deposits in StabilityPool (stability providers)
  const spDeposits = await api.call({
    abi: "uint256:getTotalDebtTokenDeposits",
    target: stabilityPool,
  });
  api.add(debtToken, spDeposits);

  // 3. PSM reserves — peg token held on-hand + invested in strategy
  if (psm) {
    const pegToken = await api.call({
      abi: "address:pegToken",
      target: psm,
    });
    // On-hand peg token balance
    await sumTokens2({ api, tokens: [pegToken], owner: psm });
    // Strategy-deployed balance (if strategy is active)
    const strategyAddr = await api.call({
      abi: "address:strategy",
      target: psm,
    });
    if (strategyAddr !== "0x0000000000000000000000000000000000000000") {
      const invested = await api.call({
        abi: "uint256:totalHoldings",
        target: strategyAddr,
      });
      api.add(pegToken, invested);
    }
  }
}

module.exports = {
  methodology:
    "TVL includes collateral locked in vessels (ActivePool), " +
    "collateral pending redistribution (DefaultPool), " +
    "collateral gains and USDVE deposits in the StabilityPool, " +
    "and USDC reserves in the Peg Stability Module.",
  start: "2026-02-05",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
