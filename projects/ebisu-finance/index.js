const { sumTokens2 } = require("../helper/unwrapLPs")

const POINTS_VAULTS = {
  ethereum: [
    "0x221042C39EfFfCfF8FaD051032FEF583019F165F", // weeth vault
    "0xA8c3fc43Fa3992b315B8a63fe87386211F220669", // ezeth vault
    "0x950a316587B7a9277aDf13A5f4327c959472f030", // pufeth vault
    "0x6da1a9307fBf1d0a00EAF3B151f370b1925AB7e4", // swell vault
    "0x270C6FA5a206Bfc1382C6101e3F366a632bE80a2", // kelp vault
  ],
  mode: [
    "0x46b1a9e1baa54e1edda42d3831d6a48ad527900c", // weeth vault
    "0xe3583d7efc9d33269615b1c8fd0ff5836b176948", // ezeth vault
  ],
}

const ACTIVE_POOL_WEETH = '0x99a5a86d6e5a6f8b96d15cb71be5bace474f81a6';
const ACTIVE_POOL_SUSDE = '0x83a095a74839ad88c24e77f1e9a54baaa7ff5157';
const ACTIVE_POOL_WBTC = '0x5c806d1f8ea290fe39642048e64b9f2ee031036f';
const ACTIVE_POOL_LBTC = '0x89fd2c36d0134ea7c8c069e2c641f3dec95d3d73';
const STABILITY_POOL_WEETH = '0x4f14903b69ff454555a2d0eb1f321e782b235cf4';
const STABILITY_POOL_SUSDE = '0xd31d0df7652ec403ffd751d2706431be080c79d5';
const STABILITY_POOL_WBTC = '0x441a2d31610ab6edffd7d42c44f3c2cbf61e7c8b';
const STABILITY_POOL_LBTC = '0x5f841e826038744ecf96f74b44520fa8828d596e';
const EBUSD_TOKEN_CONTRACT = '0x09fd37d9aa613789c517e76df1c53aece2b60df4';
const WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const WEETH = '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee';
const SUSDE = '0x9d39a5de30e57443bff2a8307a4256c8797a3497';
const LBTC = '0x8236a87084f8b84306f72007f36f2618a5634494';

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const vaults = POINTS_VAULTS.ethereum;
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      return sumTokens2({ api,
        tokensAndOwners2: [tokens, vaults],
        tokensAndOwners: [
          [EBUSD_TOKEN_CONTRACT, STABILITY_POOL_WEETH],
          [EBUSD_TOKEN_CONTRACT, STABILITY_POOL_SUSDE],
          [EBUSD_TOKEN_CONTRACT, STABILITY_POOL_WBTC],
          [EBUSD_TOKEN_CONTRACT, STABILITY_POOL_LBTC],
          [WEETH, ACTIVE_POOL_WEETH],
          [SUSDE, ACTIVE_POOL_SUSDE],
          [WBTC, ACTIVE_POOL_WBTC],
          [LBTC, ACTIVE_POOL_LBTC],
        ],
      })
    }
  },
  mode: {
    tvl: async (api) => {
      const vaults = POINTS_VAULTS.mode;
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
    }
  }
}
