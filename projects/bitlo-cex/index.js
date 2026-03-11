const { cexExports } = require("../helper/cex");

const config = {
  bitcoin: {
    owners: [
      "3392g7wWA64L8apgSLKHdDN7JxK9eeH6Sc",
      "33DtinVYzZcK5pg1AjCnGRefrDgXgrEZyw",
    ],
  },
  aptos: {
    owners: [
      "0xf6fbd3690200dd9a28eaf210349ca607a4df5eb63018845797241161a07e9dd6",
      "0x4daca89afce1b279856a7a2185d044be86840bb264c20f2061d3327ed40c2b2d",
    ],
  },
  algorand: {
    owners: ["TBXO5VXDTYVFRQBMK3PQZZRPCEKME2D7EKNBTT5MB4P2FOGKX4SPGNOB5A"],
  },
  cardano: {
    owners: [
      "addr1qxheka95t9mgdvpta5tn7k0hzkd4vefm3xu2dgy20fn8nevvquk8gyd0mj7cfgju0ww69qvekezlf74jxl7jajds2dpqtr5hcc",
    ],
  },
  doge: {
    owners: [
      "D9PyugrmQdpoabcVUceMFUZubDx4JHzebd",
      "D9GEFr81xw1mnbq7HnMaTnywF3FwDGjiw8",
    ],
  },
  ethereum: {
    owners: [
      "0x57c2a615b268e8db97d17d6068a96f95f40176aa",
      "0x9c21d12400bae033f43497b6aa72c33f7ed12b79",
      "0x2AF26Fa3682edd327B4caf48158c814EEd7288a9",
    ],
  },
  near: {
    owners: [
      "6ab1742337f2734a9da8bc75091c0a4558280adc951be7db04feb4c1cea0edc1",
    ],
  },
  polkadot: {
    owners: ["13R98s5YQLiYUw8nhhKUD2KuPVko4xyc9rTtXFHRz5L5DF1H"],
  },
  solana: {
    owners: [
      "D9tnx1BsZtjnJQKSPfY88tWrLkPeukCnUnzoG1GNmp4i",
      "ADfsfX95pX8VkHcF7i1JCLrwKZ5mQptQF5QcVQf5cv3A",
      "FDPWPcm3FrtQcQcAjd9k3biyco6RCwun9dgt8GpjReXk",
    ],
  },
  sui: {
    owners: [
      "0xd0bb3cc13817613004aee1974a9075dfe9a6290de4b397a8b31d22673e6be885",
    ],
  },
  tron: {
    owners: [
      "TCWBhFzyDMvFM2Xm5bDjTRmcfYumEd8LrS",
      "TBMfAkZXi2fg9VXHeJqzZrmFwN2VooDBeZ",
    ],
  },
  ripple: {
    owners: ["rUTyLdTBDcajmCBZYnRVmHTUAMuCzbNgnC"],
  },
};

module.exports = cexExports(config);
