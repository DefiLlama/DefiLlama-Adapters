const { addCreditPoolTvl, addCreditPoolBorrowed } = require("./helper");

module.exports = {
  methodology: "Gets all the assets deposited by LPs in Native Credit Pool for PMMs to facilitate trades for Native Swap.",
};

const config = {
  ethereum: {
    vault: "0xe3D41d19564922C9952f692C5Dd0563030f5f2EF",
    vaultFromBlock: 22173196,
  },
  bsc: {
    vault: "0xBA8dB0CAf781cAc69b6acf6C848aC148264Cc05d",
    vaultFromBlock: 47980948,
  },
  base: {
    vault: "0x74a4Cd023e5AfB88369E3f22b02440F2614a1367",
    vaultFromBlock: 32578350,
  },
  arbitrum: {
    vault: "0xbA1cf8A63227b46575AF823BEB4d83D1025eff09",
    vaultFromBlock: 355397381,
  },
  xlayer: {
    vault: "0x4Df7557734B382EB542BEa6c74786D398DF4CC19",
    vaultFromBlock: 59885325,
  },
  morph: {
    vault: "0x4Df7557734B382EB542BEa6c74786D398DF4CC19",
    vaultFromBlock: 23245775,
  },
  robinhood: {
    vault: "0x57B8f68ef57Af2dB70BC9aAc891836661CA4cB51",
    vaultFromBlock: 60423, 
  },
};

Object.keys(config).forEach((chain) => {
  const { vault, vaultFromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => await addCreditPoolTvl(api, vault, vaultFromBlock),
    borrowed: async (api) => await addCreditPoolBorrowed(api, vault, vaultFromBlock),
  };
});