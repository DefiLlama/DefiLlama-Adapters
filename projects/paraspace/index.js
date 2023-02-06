const sdk = require("@defillama/sdk");

const { getTVL, getBorrowed } = require("./helper/index");

async function tvl(timestamp, block, chainBlocks) {
  return await getTVL("ethereum", chainBlocks);
}

async function borrowed(timestamp, block, chainBlocks) {
  return await getBorrowed("ethereum", chainBlocks);
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
  },
};
