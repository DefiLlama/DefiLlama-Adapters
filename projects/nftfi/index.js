const { getTVL } = require("./helper/index");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await getTVL(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds`,
  ethereum: {
    tvl,
  }
}
