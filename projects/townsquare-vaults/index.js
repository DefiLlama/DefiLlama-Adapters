const { addCreditPoolTvl, addCreditPoolBorrowed } = require("../native-lend/helper");

module.exports = {
  methodology: "Gets all the assets deposited by LPs in TownSquare Vault for PMMs to facilitate trades.",
};

const config = {
  monad: [
    {
      vault: "0x6B00868e2D1385b3804127827bBaB461d3E697E7",
      vaultFromBlock: 85979242,
    },
    {
      vault: "0xcD1D2D602C3e7394515DaAe96e4FFe16DE71e5B4", // curated by Native
      vaultFromBlock: 70146973,
    },
  ],
};


Object.keys(config).forEach((chain) => {
  const vaults = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      for (const { vault, vaultFromBlock } of vaults) {
        await addCreditPoolTvl(api, vault, vaultFromBlock);
      }
    },
    borrowed: async (api) => {
      for (const { vault, vaultFromBlock } of vaults) {
        await addCreditPoolBorrowed(api, vault, vaultFromBlock);
      }
    },
  };
});