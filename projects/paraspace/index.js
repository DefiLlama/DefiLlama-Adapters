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
  methodology: `TVL includes ERC-20 and ERC-721 tokens that have been supplied as collateral as well as ERC-20 tokens that are supplied for lending`,
  ethereum: {
    tvl,
    borrowed,
  },
};
