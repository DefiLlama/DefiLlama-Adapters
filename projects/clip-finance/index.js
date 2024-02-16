const {
  getVaults,
  getAmmVaultsValues,
  getStargateVaultsValues,
  vaultTypes,
} = require("./helpers");

const config = require("./config");

const aggregateVaultsTvl = async (api) => {
  const { vaultRegistry } = config[api.chain];
  const vaults = await getVaults(api, vaultRegistry);

  await Promise.all(
    Object.keys(vaults).map(async (keySting) => {
      const type = Number(keySting);
      switch (type) {
        case vaultTypes.amm:
          await getAmmVaultsValues(api, vaults[type]);
          break;
        case vaultTypes.stargate:
          await getStargateVaultsValues(api, vaults[type]);
          break;
        default:
          break;
      }
    })
  );
};

const tvl = async (_, _b, _cb, { api }) => {
  await aggregateVaultsTvl(api);
  return api.getBalances();
};

module.exports = {
  methodology:
    "Clip Finance TVL is achieved by summing total values of assets deposited in other protocols through our vaults and vaults balances.",
  doublecounted: true,
  start: 1697627757, // (Oct-18-2023 11:15:57 AM +UTC) deployed on the BSC network
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});
