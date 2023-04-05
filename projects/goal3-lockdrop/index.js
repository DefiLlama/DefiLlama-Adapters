const { sumTokens2 } = require("../helper/unwrapLPs");

const ZKSYNC_USDC = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";

async function zkSyncTvl(_time, _ethBlock, { era: block }) {
  const contract = {
    GOAL3LockdropDAOTreasuryAddress:
      "0xa5aD8953DE51CeD330E788DDDde19A5f96CaC082",
  };
  const chain = "era";
  const tokens = [ZKSYNC_USDC];
  owners = Object.values(contract);
  return sumTokens2({ chain, block, tokens, owners });
}
module.exports = {
  era: {
    tvl: zkSyncTvl,
  },
};
