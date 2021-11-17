const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const TimeStaking = "0x85784d5e2CCae89Bcb39EbF0ac6Cdc93d42d99AD"
const time = "0x7d1232b90d3f809a54eeaeebc639c62df8a8942f"
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
const treasury = "0xa82422A5FD4F9cB85cD4aAc393cD3296A27dD873"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      ["0x425c45adfb53861e5db8f17d9b072ab60d4404d8", true],
      ["0xa3d2cfe49df9d1ea0dc589b69252e1eddc417d6d", true],
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
    "Counts tokens on the treasury for tvl and staked SB for staking",
};
