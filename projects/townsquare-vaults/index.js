const { addCreditPoolTvl, addCreditPoolBorrowed } = require("../native-lend/helper");

module.exports = {
  methodology: "Gets all the assets deposited by LPs in TownSquare Vault for PMMs to facilitate trades.",
};
const blacklistedTokens = [
  '0xD7aCB868F97F8286D5d3A0Fd5Ef112a8a72eCD90', // enzoBTC
]

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
  base: [
    {
      vault: "0xe7aFdA918134eAA42607ec3E5463c955A02F3d70",
      vaultFromBlock: 48975086,
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
      blacklistedTokens.forEach(t => api.removeTokenBalance(t))
    },
    borrowed: async (api) => {
      for (const { vault, vaultFromBlock } of vaults) {
        await addCreditPoolBorrowed(api, vault, vaultFromBlock);
      }
    },
  };
});