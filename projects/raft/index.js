const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const RAFT_POSITION_MANAGER = "0x5f59b322eb3e16a0c78846195af1f588b77403fc";
const WRAPPED_RETH = "0xb69e35fb4a157028b92f42655090b984609ae598";

function transformAddress(token) {
  if (token === WRAPPED_RETH) {
    return ADDRESSES.ethereum.RETH;
  }

  return token;
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: RAFT_POSITION_MANAGER,
      tokens: [ADDRESSES.ethereum.WSTETH, WRAPPED_RETH],
      transformAddress: transformAddress,
    }),
  },
};
