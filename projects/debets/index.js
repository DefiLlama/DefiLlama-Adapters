const ADDRESSES = require('../helper/coreAssets.json')
const getPoolInfo =
  "function getPoolInfo(address token) view returns (tuple(uint256 freeAmount, uint256 frozenAmount) poolInfo)";

// polygon
const factory_address_polygon = "0xcE214f6a877747495106B5e55533f3e23D290DBd";

const polygon_tokens = Object.values({
  POLYGON_WMATIC: ADDRESSES.polygon.WMATIC_2,
  POLYGON_WETH: ADDRESSES.polygon.WETH_1,
  POLYGON_WBTC: ADDRESSES.polygon.WBTC,
  POLYGON_USDC: ADDRESSES.polygon.USDC,
  POLYGON_USDT: ADDRESSES.polygon.USDT,
  POLYGON_DAI: ADDRESSES.polygon.DAI,
  POLYGON_XEN: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
});

// fantom
const factory_address_fantom = "0x069C55f2DDb434fF67055977dbeB9e9FE8a2F25E";

const fantom_tokens = Object.values({
  FANTOM_WFTM: ADDRESSES.fantom.WFTM,
  FANTOM_XEN: "0xeF4B763385838FfFc708000f884026B8c0434275",
});

function chain_tvl(factory, tokens) {
  return async function (api) {
    const bals  = await api.multiCall({  abi: getPoolInfo, calls: tokens, target: factory })
    api.add(tokens, bals.map(i => i.freeAmount))
  };
}

module.exports = {
  polygon: {
    tvl: chain_tvl(factory_address_polygon, polygon_tokens),
  },
  fantom: {
    tvl: chain_tvl( factory_address_fantom, fantom_tokens),
  },
};
