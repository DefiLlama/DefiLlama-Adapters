const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xb29201EBB420b28Bb43052Ad58C23F43d6899F51";

async function tvl(time, ethBlock, { bsc: block }) {
  return sumTokens2({
    tokens: [nullAddress],
    owner: contract,
    block,
    chain: "pulse",
  });
}

module.exports = {
  pulse: {
    tvl,
  },
};