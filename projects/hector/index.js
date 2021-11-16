const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const erc20 = require("../helper/abis/erc20.json");
const { transformFantomAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs")
const { getBlock } = require('../helper/getBlock');

const hectorStakingv1 = "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40"
const hectorStakingv2 = "0xD12930C8deeDafD788F437879cbA1Ad1E3908Cc5"
const hec = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0"
const hecDaiSLP = "0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9"
const treasury = "0xCB54EA94191B280C296E6ff0E37c7e76Ad42dC6A"
const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"
const ftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
const hecUsdcLP = "0xd661952749f05acc40503404938a91af9ac1473b"
const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75"

const HectorStakings = [
  // V1
  hectorStakingv1,
  // V2
  hectorStakingv2,
];


async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [dai, false],
      [usdc, false],
      [ftm, false],
      [hecUsdcLP, true],
      [hecDaiSLP, true]
    ],
    [treasury],
    chainBlocks.fantom,
    'fantom',
    transformAddress
  );

  return balances;
}

/*** Staking of native token (OHM) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const chain = "fantom";
  let stakingBalance, totalBalance = 0;
  const block = await getBlock(timestamp, chain, chainBlocks)
  for (const stakings of HectorStakings) {
    stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: hec,
      params: stakings,
      chain: chain,
      block: block,
    });
    totalBalance += Number(stakingBalance.output);
  }
  const  address = `${chain}:${hec}`

  return {
    [address]: totalBalance
}
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl,
    staking
  },
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};