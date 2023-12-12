const ADDRESSES = require("../helper/coreAssets.json");

const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

async function LineaTvl(_time, _ethBlock, { linea: block }) {
  const chain = "linea";
  const tokens = [nullAddress, ADDRESSES.linea.USDC];
  const owners = ["0xf3Ef1c95aecf5B5025815014890dC14488599883"];

  return sumTokens2({ chain, block, tokens, owners });
}

module.exports = {
  linea: {
    tvl: LineaTvl,
  },
};
