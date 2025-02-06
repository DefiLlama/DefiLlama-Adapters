const methodologies = require("../helper/methodologies");
const { getTVL, getBorrowed } = require("./helper/index");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await getTVL(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  const balances = {};
  await getBorrowed(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl,
    borrowed,
  },
};
