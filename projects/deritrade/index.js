const sdk = require("@defillama/sdk");

async function bsc_tvl(_, _1, _2, { api }) {
  const balances = {};

  const totalAssets = await api.call({
    abi: "function totalDeposited() public view returns(uint256)",
    target: "0xdA47DF05a5eeC438d673F01Ef74E9DF4A527ED57", // contract address
  });

  const a = sdk.util.sumSingleBalance(
    balances,
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // usdc address
    totalAssets,
    api.chain
  );
  return balances;
}

async function arbitrum_tvl(timestamp, _, _1, { api }) {
  const balances = {};

  const totalAssets = await api.call({
    abi: "function totalDeposited() public view returns(uint256)",
    target: "0xD2Ea465D2D45E4bfa093Da27dcf2b8Fa754586c4", // contract address
  });

  const a = sdk.util.sumSingleBalance(
    balances,
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // usdc address
    totalAssets,
    api.chain
  );
  return balances;
}

async function era_tvl(timestamp, _, _1, { api }) {
  const balances = {};

  const totalAssets = await api.call({
    abi: "function totalDeposited() public view returns(uint256)",
    target: "0x97Ec7948e6e59DD7401d4008cc9ED6Dc0b55Af21", // contract address
  });

  sdk.util.sumSingleBalance(
    balances,
    "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", // usdc address
    totalAssets,
    api.chain
  );
  return balances;
}
module.exports = {
  bsc: { tvl: bsc_tvl },
  era: { tvl: era_tvl },
  arbitrum: { tvl: arbitrum_tvl },
};
