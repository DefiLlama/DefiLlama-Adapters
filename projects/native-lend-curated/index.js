const { addCreditPoolTvl, addCreditPoolBorrowed } = require("../native-lend/helper");

module.exports = {
  doublecounted: true,
  methodology: "Gets all the assets deposited by LPs in the Native-curated, TownSquare-owned Credit Pool on monad for PMMs to facilitate trades for Native Swap.",
};

const config = {
  monad: {
    vault: "0xcD1D2D602C3e7394515DaAe96e4FFe16DE71e5B4",
    vaultFromBlock: 70146973,
  },
};

Object.keys(config).forEach((chain) => {
  const { vault, vaultFromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => await addCreditPoolTvl(api, vault, vaultFromBlock),
    borrowed: async (api) => await addCreditPoolBorrowed(api, vault, vaultFromBlock),
  };
});