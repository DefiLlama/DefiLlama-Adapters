const { txBridgeTvlV2 } = require("../txBridge/util")

const START_BLOCK = 24782006;
const VAULT_ADDRESS = "0xC95Fedb8Bdc763e4ef093D14e8196afafBB48f45";

const ABI = {
  getTrackedTvlTokens:
    "function getTrackedTvlTokens() view returns (address[])",
  tokenTotals:
    "function tokenTotals(address queryToken) view returns (uint256 idle, uint256 strategy, uint256 total)",
};

async function tvl(api) {
  await txBridgeTvlV2(api, { chainId: 325, })
  await api.getBlock()

  if (api.block < START_BLOCK) return;

  // include tokens earning yield
  const tokens = await api.call({  abi: ABI.getTrackedTvlTokens, target: VAULT_ADDRESS })
  const bals = await api.multiCall({  abi: ABI.tokenTotals, calls: tokens, target: VAULT_ADDRESS, field: 'total' })
  api.add(tokens, bals)
}

module.exports = {
  ethereum: {
    tvl,
  },
}
