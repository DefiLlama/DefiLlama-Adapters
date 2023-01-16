const sdk = require("@defillama/sdk");

const { getAPY, getNFTTVL, getTVL, getBorrowed } = require("./helper/index");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await getTVL(balances, "ethereum", timestamp, chainBlocks);

  return balances;
}

async function nfttvl(timestamp, block, chainBlocks) {
  const balances = {};

  await getNFTTVL(balances, "ethereum", timestamp, chainBlocks);

  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  const balances = {};

  await getBorrowed(balances, "ethereum", timestamp, chainBlocks);

  return balances;
}

async function apy(timestamp, block, chainBlocks) {
  const apys = {};

  await getAPY(balances, "ethereum", timestamp, chainBlocks);

  return apys;
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    nfttvl,
    borrowed,
    apy,
  },
};
