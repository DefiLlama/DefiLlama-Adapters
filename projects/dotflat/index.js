const CDP_ADDRESS = "0xbCf58DE37791eFe60fE87a6d420FE8F7AEA99ef8";
const ETH = "0x0000000000000000000000000000000000000000";

// TVL: ETH collateral locked in CDP positions
async function tvl(api) {
  return api.sumTokens({ owners: [CDP_ADDRESS], tokens: [ETH] });
}

module.exports = {
  methodology:
    "TVL counts ETH collateral locked in CDP positions.",
  start: "2025-01-21",
  ethereum: {
    tvl,
  },
};
