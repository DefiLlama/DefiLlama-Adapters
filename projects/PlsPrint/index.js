const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x750684313510d680D172FD5734e49De3cE91925D";

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
