const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");
const ETH_DEFAULT_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const ERA_ETH_BALANCE_OF_ABI =
  "function balanceOf(uint256) view returns (uint256)";
const ERA_ETH_ADDRESS = "0x000000000000000000000000000000000000800A";
async function getEraEthBalance(api, addr) {
  return await api.call({
    abi: ERA_ETH_BALANCE_OF_ABI,
    target: ERA_ETH_ADDRESS,
    params: [addr],
  });
}
module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x5fD9F73286b7E8683Bab45019C94553b93e015Cf",
          "0xAd16eDCF7DEB7e90096A259c81269d811544B6B6",
        ],
        fetchCoValentTokens: true,
      }),
  },
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xFF73a1a1d27951A005eb23276dc99CB7F8d5420A",
          "0xfB0Ad0B3C2605A7CA33d6badd0C685E11b8F5585",
        ],
        fetchCoValentTokens: true,
      }),
  },
  linea: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x5Cb18b6e4e6F3b46Ce646b0f4704D53724C5Df05",
          "0x62cE247f34dc316f93D3830e4Bf10959FCe630f8",
        ],
        fetchCoValentTokens: true,
      }),
  },

  era: {
    tvl: async (api) => {
      const balances = {};
      balances[`era:${ERA_ETH_ADDRESS}`] = await getEraEthBalance(
        api,
        "0xaFe8C7Cf33eD0fee179DFF20ae174C660883273A"
      );

      return sumTokens2({
        api,
        owners: ["0xaB3DDB86072a35d74beD49AA0f9210098ebf2D08"],
        balances: balances,
        tokens: [
                  "0xBBeB516fb02a01611cBBE0453Fe3c580D7281011", //btc
                  "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4" , //usdc
                  "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C", //usdt
        ],
        blacklistedTokens: [ERA_ETH_ADDRESS],
      });
    },
  },

  mantle: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xD784d7128B46B60Ca7d8BdC17dCEC94917455657",
          "0x62351b47e060c61868Ab7E05920Cb42bD9A5f2B2",
        ],
        tokens: ["0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8", //mnt
                 "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE", //usdt
                 "0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111" ,//weth
                 "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9" , //usdc
               ],
      }),
  },
  manta: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xD784d7128B46B60Ca7d8BdC17dCEC94917455657",
          "0x44a65dc12865A1e5249b45b4868f32b0E37168FF",
        ],
        tokens: [
          ...Object.values(ADDRESSES.manta),
          ETH_DEFAULT_ADDRESS,
          "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5", //MANTA
          "0xEc901DA9c68E90798BbBb74c11406A32A70652C3", //STONE
          "0xbdAd407F77f44F7Da6684B416b1951ECa461FB07", //WUSDM
        ],
        fetchCoValentTokens: false,
      }),
  },
  blast: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x29BA92Fe724beD5c5EBfd0099F2F64a6DC5078FD",
          "0x8Df0c2bA3916bF4789c50dEc5A79b2fc719F500b",
        ],
        tokens: [ETH_DEFAULT_ADDRESS],
      }),
  },
};
