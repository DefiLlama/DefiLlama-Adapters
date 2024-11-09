const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const STAKE_PRIZE_POOL_CONTRACT = "0x82D24dD5041A3Eb942ccA68B319F1fDa9EB0c604";
const EETH_PRIZE_POOL_CONTRACT = "0xCD760e8E1aEB4485268F1c389f20961E803dCf01"
const ST_ETH_TOKEN_CONTRACT = ADDRESSES.ethereum.STETH;
const E_ETH_TOKEN_CONTRACT = ADDRESSES.ethereum.EETH

module.exports = {
  methodology:
    "TVL is counted as the amount of all stETH on the StakePrizePool contract. stETH that is not distributed yet are also counting because they will be distributed in the end of the current draw.",
  ethereum: {
    tvl: sumTokensExport({ owners: [STAKE_PRIZE_POOL_CONTRACT, EETH_PRIZE_POOL_CONTRACT], tokens: [ST_ETH_TOKEN_CONTRACT, E_ETH_TOKEN_CONTRACT]}),
  },
};
