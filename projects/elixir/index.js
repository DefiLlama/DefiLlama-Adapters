const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const MANAGER_ABI = require('./abis/manager');

const DEUSD_LP_STAKING = "0xC7963974280261736868f962e3959Ee1E1B99712";
const COMMITS = "0x4265f5D6c0cF127d733EeFA16D66d0df4b650D53";
const FOUNDATION = "0x4B4EEC1DDC9420a5cc35a25F5899dC5993f9e586";
const FOUNDATION_2 = "0x738744237b7Fd97AF670d9ddF54390c24263CeA8";
const deUSD = "0x15700b564ca08d9439c58ca5053166e8317aa138"

const LP_TOKENS = [
  "0xb478Bf40dD622086E0d0889eeBbAdCb63806ADde", // DEUSD/DAI Curve LP
  "0x88DFb9370fE350aA51ADE31C32549d4d3A24fAf2", // DEUSD/FRAX Curve LP
  "0x5F6c431AC417f0f430B84A666a563FAbe681Da94", // DEUSD/USDC Curve LP
  "0x7C4e143B23D72E6938E06291f705B5ae3D5c7c7C", // DEUSD/USDT Curve LP
];

const VERTEX_MANAGER = '0x052Ab3fd33cADF9D9f227254252da3f996431f75'
const ORDERLY_MANAGER = '0x79865208f5dc18a476f49e6dbfd7d79785cb8cd8'

const integration = async (api, manager, poolIds, tokens) => {
  const tokenBalances = tokens.reduce((acc, token) => ({ ...acc, [token[1]]: 0 }), {});

  for (const poolId of poolIds) {
    for (const token of tokens) {
      if (manager === ORDERLY_MANAGER) {
        const amount = await api.call({
          target: manager,
          abi: MANAGER_ABI.getPoolToken_2,
          params: [poolId]
        });
        tokenBalances[token[1]] += Number(amount[5]);
      } else {
        const amount = await api.call({
          target: manager,
          abi: MANAGER_ABI.getPoolToken,
          params: [poolId, token[1]]
        });
        tokenBalances[token[1]] += Number(amount[1]);
      }
    }
  }

  for (const token of tokens) {
    api.add(token[1], tokenBalances[token[1]]);
  }
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const deusdSupply = await api.call({ target: deUSD, abi: "erc20:totalSupply" })
      api.add(deUSD, deusdSupply);
      await api.sumTokens({ owners: [COMMITS, FOUNDATION, FOUNDATION_2], tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.null, ADDRESSES.ethereum.SDAI] })
    },
    pool2: sumTokensExport({ owner: DEUSD_LP_STAKING, tokens: LP_TOKENS })
  },
  arbitrum: {
    tvl: async (api) => {
      await integration(api, VERTEX_MANAGER, [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 31, 34, 36, 38, 40, 41, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62], [
        [0, ADDRESSES.arbitrum.USDC_CIRCLE],
        [0, ADDRESSES.arbitrum.USDT],
        [0, ADDRESSES.arbitrum.ARB],
        [0, '0x95146881b86B3ee99e63705eC87AfE29Fcc044D9'],
        [0, ADDRESSES.arbitrum.WBTC],
        [0, ADDRESSES.arbitrum.WETH]
      ])

      await integration(api, ORDERLY_MANAGER, Array.from({ length: 10 }, (_, i) => i + 1), [
        [0, ADDRESSES.arbitrum.USDC_CIRCLE]
      ])
    }
  }
};
