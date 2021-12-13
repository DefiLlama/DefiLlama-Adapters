const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const factory = "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA";

async function tvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(
    (addr) => `polygon:${addr}`,
    chainBlocks.polygon,
    "polygon",
    factory,
    0,
    true
  );
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: "0x3a3Df212b7AA91Aa0402B9035b098891d276572B",
      owner: "0x640328B6BB1856dDB6a7d7BB07e5E1F3D9F50B94",
      block: chainBlocks.polygon,
      chain: "polygon",
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    "polygon:0x3a3Df212b7AA91Aa0402B9035b098891d276572B",
    balance
  );
  return balances;
}

module.exports = {
  methodology: "TVL are from the pools created by the factory.",
  polygon: {
    tvl,
    staking,
  },
  tvl,
};
