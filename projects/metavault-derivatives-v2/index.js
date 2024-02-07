const ADDRESSES = require("../helper/coreAssets.json");

const { nullAddress } = require("../helper/unwrapLPs");

async function LineaTvl(_time, _ethBlock, _cb, { api}) {
  const tokens = [nullAddress, ADDRESSES.linea.USDC];
  const owners = ["0xf3Ef1c95aecf5B5025815014890dC14488599883"];
  return api.sumTokens({ owners, tokens})
}

module.exports = {
  linea: {
    tvl: LineaTvl,
  },
};
