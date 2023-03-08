const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");

const ROCI_COLLATERAL_MANAGER = "0xd85af14C32Cc98Be9Fe5195eDb797773af8bB609";

const ROCI_SETTINGS_PROVIDER = "0xb2e577a112A6F2C6d3d511ade2AD512cEA312a6d";

const ROCI_LIMIT_MANAGER = "0x347892c2c0C230f0803127F4E1137b3e975F57E4";

const chain = "polygon";

const limitManagerAbi = {
  inputs: [{ internalType: "contract IPool", name: "", type: "address" }],
  name: "poolToBorrowedAmount",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

async function getPools(block) {
  const { output: pools } = await sdk.api.abi.call({
    target: ROCI_SETTINGS_PROVIDER,
    abi: "address[]:getPools",
    chain,
    block,
  });
  return Promise.all(
    pools.map(async (poolAddress) => {
      const { output: underlyingToken } = await sdk.api.abi.call({
        abi: "address:underlyingToken",
        target: poolAddress,
        chain,
        block,
      });

      return { address: poolAddress, underlyingToken };
    })
  );
}

async function tvl(_, __, { [chain]: block }) {
  const pools = await getPools(block);

  const { output: collaterals } = await sdk.api.abi.call({
    target: ROCI_COLLATERAL_MANAGER,
    abi: "address[]:getCollaterals",
    chain,
    block,
  });

  const toa = [
    ...pools.map((pool) => [pool.underlyingToken, pool.address]),
    ...collaterals.map((collateral) => [collateral, ROCI_COLLATERAL_MANAGER]),
  ];

  return sumTokens2({
    chain,
    block,
    tokensAndOwners: toa,
  });
}

async function borrowed(_, __, { [chain]: block }) {
  const pools = await getPools(block);

  const balances = {};
  for (const pool of pools) {
    const { output: borrowedAmount } = await sdk.api.abi.call({
      abi: limitManagerAbi,
      target: ROCI_LIMIT_MANAGER,
      chain,
      block,
      params: pool.address,
    });

    const key = `${chain}:${pool.underlyingToken}`;
    const value = balances[key];

    if (value) {
      balances[key] = BigNumber(value).plus(borrowedAmount).toString();
    } else {
      balances[key] = borrowedAmount;
    }
  }

  return sumTokens2({
    chain,
    block,
    balances,
  });
}

module.exports = {
  polygon: {
    tvl,
    borrowed,
  },
};
