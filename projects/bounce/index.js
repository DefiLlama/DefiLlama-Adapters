const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

const AUCTION = '0xA9B1Eb5908CfC3cdf91F9B8B3a74108598009096'
const AUCTION_ETH_SLP = '0x0f8086d08a69ebd8e3a130a87a3b6a260723976f'

const STAKING_ADDRESS = '0x98945BC69A554F8b129b09aC8AfDc2cc2431c48E'
const STAKING_LP_ADDRESS = '0xbe5a88b573290e548759520a083a61051b258451'
const MULTI_SIG_ADDRESS = '0xc9297466C6c7acc799Fb869806C53398b8B10680'


async function ethTvl(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [AUCTION, false],
      [AUCTION_ETH_SLP, true]
    ],
    [STAKING_LP_ADDRESS, MULTI_SIG_ADDRESS, STAKING_ADDRESS],
    block
  );

  return balances;
}

async function staking(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [AUCTION, false]
    ],
    [STAKING_ADDRESS],
    block
  );

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking
  },

}
