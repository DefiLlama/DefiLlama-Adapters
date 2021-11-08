const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const TimeStaking = "0x4456B87Af11e87E329AB7d7C7A246ed1aC2168B9"
const time = "0xb54f16fB19478766A268F172C9480f8da1a7c9C3"
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

    const stakingBalance = await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: time,
      params: TimeStaking,
      block: chainBlocks.avax,
      chain: 'avax'
    });

    sdk.util.sumSingleBalance(balances, 'avax:'+time, stakingBalance.output);

  return balances;
};

// https://app.wonderland.money/#/bonds
const treasury = "0x1c46450211CB2646cc1DA3c5242422967eD9e04c"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      ["0x113f413371fC4CC4C9d6416cf1DE9dFd7BF747Df", true],
      ["0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917", true],
    ],
    [treasury],
    chainBlocks.avax,
    'avax',
    addr=>addr.toLowerCase()==="0x130966628846bfd36ff31a822705796e8cb8c18d"?"0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3":`avax:${addr}`
  );

  return balances;
}

module.exports = {
  avalanche: {
    tvl,
    staking
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked TIME for staking",
};
