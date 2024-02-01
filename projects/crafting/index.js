const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const contractStakingETH = "0x9353177049757A21f19a28C3055c03871e6428cf";
const ETH = ADDRESSES.null;

const contractAddresses = [
  //Staking Contract wbtc
  "0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba",
  //Staking Contract usdt
  "0x321Fd763B8220b5697E41862AcAa41AeB1e2556d",
  //Staking Contract bayc
  "0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba",
];

const tokens = [
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

async function ethTvl(timestamp, block) {
  const balances = {};

  for (let i = 0; i < tokens.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[tokens[i], false]],
      [contractAddresses[i]]
    );
  }

  const ethBal = (
    await sdk.api.eth.getBalance({
      target: contractStakingETH,
      block
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, ethBal);

  return balances;
}

async function auroraTvl(timestamp, block, chainBlocks) {
  const balances = {};

  for (let i = 0; i < tokens_aurora.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[tokens_aurora[i], false]],
      [contractAddresses_aurora[i]],
      chainBlocks["aurora"],
      "aurora",
      (addr) => `aurora:${addr}`
    );
  }

  return balances;
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
