const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const USDB = "0x4300000000000000000000000000000000000003";

const LOCKED_STAKING = "0xd95773e5b1eedc7ff302a70acd0eb370927397d2";
const NONLOCK_STAKING = "0xd9747a98624f0B64B4412632C420672E16432334";

async function tvl(_, _1, _2, { api, chain, block }) {
  const lockedUsdb = await api.call({
    abi: "erc20:balanceOf",
    target: USDB,
    params: [LOCKED_STAKING],
    block,
    chain,
  });
  api.add(USDB, lockedUsdb);
  const nonlockUsdb = await api.call({
    abi: "erc20:balanceOf",
    target: USDB,
    params: [NONLOCK_STAKING],
    block,
    chain
  });
  api.add(USDB, nonlockUsdb);
  const lockETH = await sdk.api.eth.getBalance({
    target: LOCKED_STAKING,
    block,
    chain,
  });
  api.addGasToken(lockETH.output)

  const nonlockETH = await sdk.api.eth.getBalance({
    target: NONLOCK_STAKING,
    block,
    chain,
  });
  api.addGasToken(nonlockETH.output);
}

module.exports = {
  blast: {
    tvl,
  },
  methodology:
    "counts the amount of USDB and ETH locked in 2 staking contracts",
  timetravel: false,
};
