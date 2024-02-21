const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const ROCI_COLLATERAL_MANAGER = {
  polygon: '0xd85af14C32Cc98Be9Fe5195eDb797773af8bB609',
  era: '0x0C10f6BeaF642Fa43bA8375f160F45704c865E65'
}

const ROCI_SETTINGS_PROVIDER = {
  polygon: '0xb2e577a112A6F2C6d3d511ade2AD512cEA312a6d',
  era: '0x719b5f658C13C943010718266a22D8F76cbfc8B9'
}

const ROCI_LIMIT_MANAGER = {
  polygon: '0x347892c2c0C230f0803127F4E1137b3e975F57E4',
  era: '0xc8531874Dfe8bc6415e06C1C1eD64dbf5dCeEa18'
}

const limitManagerAbi = 'function poolToBorrowedAmount(address) view returns (uint256)'

const getPools = async (chain, api) => {
  const pools = await api.call({ target: ROCI_SETTINGS_PROVIDER[chain], abi: "address[]:getPools", });
  const underlyings = await api.multiCall({ abi: "address:underlyingToken", calls: pools })
  return { pools, underlyings }
}

const tvl = (chain) => async (_, __, _1, { api }) => {
  const { pools, underlyings } = await getPools(chain, api);

  const collaterals = await api.call({
    target: ROCI_COLLATERAL_MANAGER[chain],
    abi: "address[]:getCollaterals",
  });

  const toa = [
    ...pools.map((pool, i) => [underlyings[i], pool]),
    ...collaterals.map((collateral) => [collateral, ROCI_COLLATERAL_MANAGER[chain]]),
  ];

  return sumTokens2({
    api,
    tokensAndOwners: toa,
  });
}

const borrowed = (chain) => async (_, __, _1, { api }) => {
  const { pools, underlyings } = await getPools(chain, api);

  const balances = {};
  const borrowed = await api.multiCall({ abi: limitManagerAbi, calls: pools, target: ROCI_LIMIT_MANAGER[chain] })
  underlyings.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain))
  return balances
}

module.exports = {
  polygon: {
    tvl: tvl('polygon'),
    borrowed: borrowed('polygon'),
  },
  era: {
    tvl: tvl('era'),
    borrowed: borrowed('era'),
  },
};
