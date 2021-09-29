const tokens = require("./tokens");

const PoolCategory = {
  COMMUNITY: "Community",
  CORE: "Core",
  BINANCE: "Binance", // Pools using native BNB behave differently than pools using a token
  AUTO: "Auto",
};

const pools = [
  {
    sousId: 0,
    stakingToken: tokens.kwoof,
    earningToken: tokens.kwoof,
    contractAddress: {
      321: "0x1Ae33198c47799e9333bbcd74cd3aB80DC03D283",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "10",
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 1,
    stakingToken: tokens.kwoof,
    earningToken: tokens.kafe,
    contractAddress: {
      321: "0x27d55dd01cb6bff2791f46e4a7657e69257e80df",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "0.00289",
    sortOrder: 1,
    isFinished: false,
  },
];

module.exports = pools;
