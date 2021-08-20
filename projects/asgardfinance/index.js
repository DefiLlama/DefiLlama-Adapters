const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const AsgardStaking = "0x4EA2bb6Df87F66cbea70818aE92f3A48F98EBC93";
const ASG = "0x0DC5189Ec8CDe5732a01F0F592e927B304370551";

const AsgardTreasury = "0x9D5818af130705F95444d78A55B4F3d85cBfCC13";
const bondsTokensLPsAddresses = [
  // DAI
  "0x6b175474e89094c44da98b954eedeac495271d0f",
  // ASG/DAI SLP
  "0x024cc95611d478dd367240e72c82662d9e390a6a",
  // FRAX
  "0x853d955acef822db058eb8505911ed77f175b99e",
  // ASG/FRAX SLP
  "0x5696cd9054ce11625141f5ee2c65fc4d57c2a5ca",
  // WUST
  "0xa47c8bf37f92abed4a126bda807a7b7498661acd",
  // ASG/UST SLP
  "0x5a1abc007f031aa58238f45941d965ce6892fdff",
];

/*** Staking of native token (ASG) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stakingBalance = (
    await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: ASG,
      params: AsgardStaking,
      ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ASG, stakingBalance);

  return balances;
};

/*** Bonds TVL Portion (Treasury) ***
* Treasury TVL consists of DAI, UST and FRAX balances + Sushi SLPs balance
***/
async function ethTvl(timestamp, block) {
  const balances = {};

  for (let index = 0; index < bondsTokensLPsAddresses.length; index++) {
    if (index % 2 == 0) {
      await sumTokensAndLPsSharedOwners(
        balances,
        [[bondsTokensLPsAddresses[index], false]],
        [AsgardTreasury],
        block
      );
    } else {
      await sumTokensAndLPsSharedOwners(
        balances,
        [[bondsTokensLPsAddresses[index], true]],
        [AsgardTreasury],
        block
      );
    }
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  staking: {
    tvl: staking,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts DAI, DAI SLP (ASG-DAI), FRAX, FRAX SLP (ASG-FRAX), UST, UST SLP (ASG-UST) on the treasury",
};
