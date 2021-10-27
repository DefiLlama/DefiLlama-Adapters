const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const ExodStaking = "0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"
const exod = "0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

    const stakingBalance = await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: exod,
      params: ExodStaking,
      block: chainBlocks.fantom,
      chain: 'fantom'
    });

    sdk.util.sumSingleBalance(balances, 'fantom:'+exod, stakingBalance.output);

  return balances;
};

const treasury = "0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"
const dai = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [dai, false],
      ["0x113f413371fC4CC4C9d6416cf1DE9dFd7BF747Df", true],
    ],
    [treasury],
    chainBlocks.fantom,
    'fantom',
  );

  return balances;
}

module.exports = {
  fantom: {
    tvl,
  },
  staking: {
    tvl: staking,
  },
  tvl,
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};
