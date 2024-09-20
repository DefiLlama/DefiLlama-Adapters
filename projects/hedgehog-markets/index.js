//@ts-check

const classicMarkets = require("./classic-markets");
const p2p = require("./p2p");
const parimutuel = require("./parimutuel");
const parlay = require("./parlay");

const { mergeBalances } = require("./utils");

async function tvl() {
  const balances = await Promise.all([
    classicMarkets(),
    p2p(),
    parimutuel(),
    parlay(),
  ]);

  const merged = mergeBalances(...balances);

  const result = {};
  for (const [key, value] of Object.entries(merged)) {
    result[`solana:${key}`] = value.toString();
  }
  return result;
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL consists of deposits made into Hedgehog Markets.",
  hallmarks: [],
};
