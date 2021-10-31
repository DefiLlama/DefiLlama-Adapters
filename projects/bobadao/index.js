const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const stakingContracts = [
  "0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00",
  "0x1A26ef6575B7BBB864d984D9255C069F6c361a14",
];

const OMG = "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07";

async function ethTvl() {
  const balances = {};

  await sumTokensAndLPsSharedOwners(balances, [[OMG, false]], stakingContracts);

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology: "Counts tvl of OMG Token staked through Staking Contracts",
};
