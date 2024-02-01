const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const SigThreePoolContract = "0x3333333ACdEdBbC9Ad7bda0876e60714195681c5";
const USDC = ADDRESSES.ethereum.USDC;
const DAI = ADDRESSES.ethereum.DAI;
const USDT = ADDRESSES.ethereum.USDT;

const sigMasterchefContract = "0x98C32b59a0AC00Cd33750427b1A317eBcf84D0F7";
const SIG = "0x7777777777697cfeecf846a76326da79cc606517";
const SIG_ETH_UNIV2 = "0x23b7e6932cb873b8696afba077c4a2486b1c862e";

async function ethTvl() {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDC, false],
      [DAI, false],
      [USDT, false],
    ],
    [SigThreePoolContract]
  );

  return balances;
}

module.exports = {
  ethereum: {
    staking: staking(sigMasterchefContract, SIG),
    pool2: pool2(sigMasterchefContract, SIG_ETH_UNIV2),
    tvl: ethTvl,
  },
  methodology:
    "Counts tvl of Stablecoins(USDC, DAI and USDT) deposited through SigThreePoolContract Contract",
};
