const ADDRESSES = require('../helper/coreAssets.json')

const contractStakingETH = "0x9353177049757A21f19a28C3055c03871e6428cf";

const contractAddresses = [
  contractStakingETH,
  //Staking Contract wbtc
  "0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba",
  //Staking Contract usdt
  "0x321Fd763B8220b5697E41862AcAa41AeB1e2556d",
  //Staking Contract bayc
  "0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba",
];

const tokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.USDT,
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
];

const contractAddresses_aurora = [
  //Staking Contract aurora
  "0xB0D10De43eb7D6F43e376aA5dA9022A9baB4313C",
  // Staking Contract near
  "0x508df5aa4746bE37b5b6A69684DfD8BDC322219d",
];

const tokens_aurora = [
  ADDRESSES.aurora.AURORA,
  ADDRESSES.aurora.NEAR,
];

async function ethTvl(api) {
  await api.sumTokens({owners: contractAddresses, tokens: tokens})
}

async function auroraTvl(api) {
  return api.sumTokens({owners: contractAddresses_aurora, tokens: tokens_aurora})
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  aurora: {
    tvl: auroraTvl,
  },
  methodology:
    "Counts tvl of all the Assets staked through Staking Contracts",
};
