const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { getTVL, getBorrowed } = require("./helper/index");
const address = require("./helper/address");

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
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
    staking: staking(
      address.VeBend.ethereum,
      address.Bend.ethereum,
      "ethereum"
    ),
    pool2: pool2(
      address.stkBUNI.ethereum,
      address.UniswapV2PairWETH.ethereum,
      "ethereum"
    ),
    treasury: staking(
      address.Treasury.ethereum,
      [address.USDC.ethereum, address.ApeCoin.ethereum],
      "ethereum"
    ),
  },
};
