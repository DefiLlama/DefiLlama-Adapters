const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const ROCI_COLLATERAL_MANAGER = "0xd85af14C32Cc98Be9Fe5195eDb797773af8bB609";
const ROCI_SETTINGS_PROVIDER = "0xb2e577a112A6F2C6d3d511ade2AD512cEA312a6d";
const ROCI_LIMIT_MANAGER = "0x347892c2c0C230f0803127F4E1137b3e975F57E4";

const limitManagerAbi = 'function poolToBorrowedAmount(address) view returns (uint256)'

async function getPools(api) {
  const pools = await api.call({ target: ROCI_SETTINGS_PROVIDER, abi: "address[]:getPools", });
  const underlyings = await api.multiCall({ abi: "address:underlyingToken", calls: pools })
  return { pools, underlyings }
}

async function tvl(_, __, _1, { api }) {
  const { pools, underlyings } = await getPools(api);

  const collaterals = await api.call({
    target: ROCI_COLLATERAL_MANAGER,
    abi: "address[]:getCollaterals",
  });

  const toa = [
    ...pools.map((pool, i) => [underlyings[i], pool]),
    ...collaterals.map((collateral) => [collateral, ROCI_COLLATERAL_MANAGER]),
  ];

  return sumTokens2({
    api,
    tokensAndOwners: toa,
  });
}

async function borrowed(_, __, _1, { api }) {
  const { pools, underlyings } = await getPools(api);

  const balances = {};
  const borrowed = await api.multiCall({ abi: limitManagerAbi, calls: pools, target: ROCI_LIMIT_MANAGER })
  underlyings.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain))
  return balances
}

module.exports = {
  polygon: {
    tvl,
    borrowed,
  },
};
