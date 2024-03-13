const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function LineaTvl(_time, _ethBlock, _cb, { api }) {
  const tokens = [nullAddress, ADDRESSES.linea.USDC];
  const owners = ["0xb514Ee8a1e00B102cE2312048abcbc3E57bfED94"];
  return api.sumTokens({ owners, tokens });
}

async function PolygonTvl(_time, _ethBlock, _cb, { api }) {
  const tokens = [nullAddress, ADDRESSES.polygon.USDC];
  const owners = ["0xAb36984e4952e5a9d08536C4dE5190ed37725017"];
  return api.sumTokens({ owners, tokens });
}

module.exports = {
  linea: {
    tvl: LineaTvl,
  },
  polygon: {
    tvl: PolygonTvl,
  },
};
