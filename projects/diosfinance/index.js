const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners, sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs");
// const abi = require('./abi.json')

const chain = "bsc"
const transformAddress = (id) => `${chain}:${id}`
const DIOS = "0x08eEcF5d03bDA3dF2467F6AF46b160c24D931DE7";
const DiosStakings = [
  "0x36c8a6E7436EDd850752E09539a519a369D95096",
];
const treasuryAddresses = [
  "0x98eE3F3629aCFA6fDDB49028C494030E5dFA349a",
];

const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DIOS_BUSD_LP = "0x2D7A5e9d85F62ADbaea9d48B11F5947F3AC57FC8";

/*** Staking of native token (DIOS) TVL Portion ***/
const staking = async (timestamp, block, chainBlocks) => {
  const balances = {};

  for (const stakings of DiosStakings) {
    const stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: DIOS,
      params: stakings,
      block: block,
			chain: chain
    });

    sdk.util.sumSingleBalance(balances, transformAddress(DIOS), stakingBalance.output);
  }

  return balances;
};

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of BUSD + Pancake-V2 balances
 ***/
async function bscTvl(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [BUSD, false],
      [DIOS_BUSD_LP, true],
    ],
    treasuryAddresses,
    block,
		chain,
		transformAddress
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking
  },
};
