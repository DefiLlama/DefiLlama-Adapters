const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");

const UiPoolDataProviderABI = require("./UiPoolDataProvider.json");
const address = require("./address");

async function tvl(api) {
  const { UiPoolDataProvider, PoolAddressProvider } = address[api.chain];
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: UiPoolDataProviderABI.getReservesData,
  });

  const balances = {};

  let toa = reservesData.map((i) => [i.underlyingAsset, i.aTokenAddress]);

  return sumTokens2({ chain: api.chain, balances, tokensAndOwners: toa });
}

async function borrowed(api) {
  const { UiPoolDataProvider, PoolAddressProvider } = address[api.chain];
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: UiPoolDataProviderABI.getReservesData,
  });

  const balances = {};

  reservesData.forEach((d) => {
    sdk.util.sumSingleBalance(
      balances,
      d.underlyingAsset,
      d.totalScaledVariableDebt * d.variableBorrowIndex * 1e-27,
      api.chain
    );
  });

  return balances;
}

module.exports = {
  blast: {
    tvl,
    borrowed,
  },
};
