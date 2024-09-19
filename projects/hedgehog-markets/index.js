const { tvl: parimutuel } = require("./parimutuel");
const { tvl: p2p } = require("./p2p");
const { mergeBalances } = require("./utils");

async function tvl() {
  const balances = await Promise.all([parimutuel(), p2p()]);
  const merged = mergeBalances(...balances);

  const result = {};
  for (const [key, value] of Object.entries(merged)) {
    result[`solana:${key}`] = value.toString();
  }
  return result;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: "TVL consists of deposits made into hedgehog markets programs.",
  hallmarks: [],
};
